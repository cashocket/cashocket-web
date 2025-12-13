import { Request, Response } from "express";
import Stripe from "stripe";
import { db } from "../config/db.js";
import { users, subscriptions } from "../models/schema.js";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia", // Latest version use karein
});

// --- 1. CREATE CHECKOUT SESSION (Start Trial) ---
export const createCheckoutSession = async (req: Request, res: Response): Promise<any> => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { email, name } = req.user; // Auth middleware se aayega

    // 1. User details fetch karein taaki Stripe Customer ID check kar sakein
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    let customerId = user.stripeCustomerId;

    // 2. Agar Stripe Customer ID nahi hai, to create karein
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: email,
        name: name,
        metadata: { userId: userId },
      });
      customerId = customer.id;

      // DB update karein
      await db.update(users)
        .set({ stripeCustomerId: customerId })
        .where(eq(users.id, userId));
    }

    // 3. Checkout Session Create Karein
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_collection: "always", // Card details compulsory
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // .env se ₹49 wala plan ID
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 90, // 3 Months Free Trial
        metadata: { userId: userId },
      },
      success_url: `${process.env.CLIENT_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard/settings`,
    });

    return res.json({ url: session.url });

  } catch (error) {
    console.error("Stripe Session Error:", error);
    return res.status(500).json({ message: "Failed to create checkout session" });
  }
};

// --- 2. WEBHOOK HANDLER (Update DB on Events) ---
export const handleStripeWebhook = async (req: Request, res: Response): Promise<any> => {
  const sig = req.headers["stripe-signature"];
  let event: Stripe.Event;

  try {
    // Raw body verification
    event = stripe.webhooks.constructEvent(
      req.body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook Signature Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Event Types Handle karein
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // Subscription details fetch karein
        const subscriptionId = session.subscription as string;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        
        // Metadata se userId nikalein (ya customer lookup karein)
        // Subscription object mein metadata nahi hota by default, humne checkout mein dala tha.
        // Better way: Customer ID se user dhundhein
        const customerId = session.customer as string;
        const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));

        if (user) {
          // DB mein subscription entry
          await db.insert(subscriptions).values({
            userId: user.id,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            status: "trialing", // Shuru mein trial hoga
            trialEnd: new Date(subscription.trial_end! * 1000),
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          }).onConflictDoUpdate({
            target: subscriptions.userId,
            set: {
                stripeSubscriptionId: subscription.id,
                status: "trialing",
                trialEnd: new Date(subscription.trial_end! * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            }
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        // DB Update
        await db.update(subscriptions)
          .set({
            status: subscription.status as any, // active, past_due, etc.
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
          })
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await db.update(subscriptions)
          .set({ status: "canceled" })
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook Logic Error:", error);
    res.status(500).send("Webhook Logic Error");
  }
};
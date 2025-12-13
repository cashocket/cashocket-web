import { Request, Response } from "express";
import Stripe from "stripe";
import { db } from "../config/db.js";
import { users, subscriptions } from "../models/schema.js";
import { eq } from "drizzle-orm";

// FIX 1: apiVersion hata diya gaya hai taaki version mismatch error na aaye
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

// --- 1. CREATE CHECKOUT SESSION (Start Trial) ---
export const createCheckoutSession = async (req: Request, res: Response): Promise<any> => {
  try {
    // FIX 2: req ko cast kiya 'any' mein taaki 'user' access ho sake
    const userObj = (req as any).user;
    const userId = userObj.id;
    const { email, name } = userObj;

    // 1. User details fetch karein
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
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = session.subscription as string;
        
        // FIX 3: Subscription object ko 'any' cast kiya taaki TS error na de
        const subscription: any = await stripe.subscriptions.retrieve(subscriptionId);
        
        const customerId = session.customer as string;
        const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));

        if (user) {
          await db.insert(subscriptions).values({
            userId: user.id,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            status: "trialing",
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
        // FIX 4: Event object ko 'any' cast kiya
        const subscription: any = event.data.object;
        await db.update(subscriptions)
          .set({
            status: subscription.status,
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
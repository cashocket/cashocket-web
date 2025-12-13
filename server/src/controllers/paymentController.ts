import { Request, Response } from "express";
import Stripe from "stripe";
import { db } from "../config/db.js";
import { users, subscriptions } from "../models/schema.js";
import { eq } from "drizzle-orm";

// FIX 1: Initialize Stripe with TypeScript support
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

// Helper function to safely convert Stripe timestamps (seconds) to JS Date (milliseconds)
const toDate = (timestamp: any): Date | null => {
  if (!timestamp) return null;
  return new Date(timestamp * 1000);
};

// --- 1. CREATE CHECKOUT SESSION (Start Trial) ---
export const createCheckoutSession = async (req: Request, res: Response): Promise<any> => {
  try {
    // Cast req to any to access user
    const userObj = (req as any).user;
    const userId = userObj.id;
    const { email, name } = userObj;

    // 1. Fetch user to check for existing Stripe Customer ID
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    let customerId = user.stripeCustomerId;

    // 2. Create Stripe Customer if not exists
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: email,
        name: name,
        metadata: { userId: userId },
      });
      customerId = customer.id;

      await db.update(users)
        .set({ stripeCustomerId: customerId })
        .where(eq(users.id, userId));
    }

    // 3. Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_collection: "always",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 90,
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

// --- 2. WEBHOOK HANDLER ---
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
    // Handle specific event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        // Retrieve full subscription details from Stripe
        const subscription: any = await stripe.subscriptions.retrieve(subscriptionId);

        // Find user by Stripe Customer ID
        const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));

        if (user) {
          // FIX 2: Use safe 'toDate' helper to prevent "Invalid time value" crash
          await db.insert(subscriptions).values({
            userId: user.id,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            status: subscription.status === 'trialing' ? 'trialing' : 'active',
            trialEnd: toDate(subscription.trial_end),
            currentPeriodStart: toDate(subscription.current_period_start),
            currentPeriodEnd: toDate(subscription.current_period_end),
          }).onConflictDoUpdate({
            target: subscriptions.userId,
            set: {
              stripeSubscriptionId: subscription.id,
              status: subscription.status === 'trialing' ? 'trialing' : 'active',
              trialEnd: toDate(subscription.trial_end),
              currentPeriodEnd: toDate(subscription.current_period_end),
            }
          });
          console.log(`✅ Subscription activated for user: ${user.email}`);
        } else {
            console.error("❌ User not found for customer ID:", customerId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription: any = event.data.object;
        
        await db.update(subscriptions)
          .set({
            status: subscription.status,
            currentPeriodStart: toDate(subscription.current_period_start),
            currentPeriodEnd: toDate(subscription.current_period_end),
            trialEnd: toDate(subscription.trial_end)
          })
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
          
        console.log(`🔄 Subscription updated: ${subscription.id}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription: any = event.data.object;
        
        await db.update(subscriptions)
          .set({ status: "canceled" })
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
          
        console.log(`❌ Subscription canceled: ${subscription.id}`);
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook Logic Error:", error);
    res.status(500).send("Webhook Logic Error");
  }
};
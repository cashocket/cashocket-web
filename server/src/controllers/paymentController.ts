import { Request, Response } from "express";
import Stripe from "stripe";
import { db } from "../config/db.js";
import { users, subscriptions } from "../models/schema.js";
import { eq } from "drizzle-orm";

// FIX 1: Force API Version to enable automatic_payment_methods (UPI)
// 'as any' use kiya hai taaki TypeScript version mismatch ka error na de
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia" as any, 
  typescript: true,
});

// Helper function
const toDate = (timestamp: any): Date | null => {
  if (!timestamp) return null;
  return new Date(timestamp * 1000);
};

// --- 1. CREATE CHECKOUT SESSION ---
export const createCheckoutSession = async (req: Request, res: Response): Promise<any> => {
  try {
    const userObj = (req as any).user;
    const userId = userObj.id;
    const { email, name } = userObj;

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    let customerId = user.stripeCustomerId;

    const [existingSub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
    const isReturningUser = !!existingSub; 

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: email,
        name: name,
        metadata: { userId: userId },
      });
      customerId = customer.id;
      await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, userId));
    }

    // FIX 2: Session Payload
    const sessionPayload: any = {
      customer: customerId,
      mode: "subscription",
      // Ab ye parameter 'Unknown' nahi aayega kyunki humne API version fix kar diya hai
      automatic_payment_methods: { enabled: true }, 
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/subscribe`,
      metadata: { userId: userId },
    };

    if (!isReturningUser) {
       sessionPayload.subscription_data = {
         trial_period_days: 90,
         metadata: { userId: userId },
       };
    } else {
       sessionPayload.subscription_data = {
         metadata: { userId: userId },
       };
    }

    const session = await stripe.checkout.sessions.create(sessionPayload);
    return res.json({ url: session.url });

  } catch (error) {
    console.error("Stripe Session Error:", error);
    return res.status(500).json({ message: "Failed to create checkout session" });
  }
};

// --- 2. CREATE CUSTOMER PORTAL ---
export const createCustomerPortal = async (req: Request, res: Response): Promise<any> => {
  try {
    const userObj = (req as any).user;
    const userId = userObj.id;
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user.stripeCustomerId) return res.status(400).json({ message: "No subscription found" });

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL}/dashboard/settings`,
    });
    return res.json({ url: session.url });
  } catch (error) {
    console.error("Portal Error:", error);
    return res.status(500).json({ message: "Failed to create portal session" });
  }
};

// --- 3. WEBHOOK HANDLER ---
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
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        const subscription: any = await stripe.subscriptions.retrieve(subscriptionId);
        const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));

        if (user) {
          await db.insert(subscriptions).values({
            userId: user.id,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            status: subscription.status,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            trialEnd: toDate(subscription.trial_end),
            currentPeriodStart: toDate(subscription.current_period_start),
            currentPeriodEnd: toDate(subscription.current_period_end),
          }).onConflictDoUpdate({
            target: subscriptions.userId,
            set: {
              stripeSubscriptionId: subscription.id,
              status: subscription.status,
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
              trialEnd: toDate(subscription.trial_end),
              currentPeriodEnd: toDate(subscription.current_period_end),
            }
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription: any = event.data.object;
        await db.update(subscriptions)
          .set({
            status: subscription.status,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            currentPeriodStart: toDate(subscription.current_period_start),
            currentPeriodEnd: toDate(subscription.current_period_end),
            trialEnd: toDate(subscription.trial_end)
          })
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
        break;
      }

      case "customer.subscription.deleted": {
        const subscription: any = event.data.object;
        await db.update(subscriptions)
          .set({ status: "canceled", cancelAtPeriodEnd: false })
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
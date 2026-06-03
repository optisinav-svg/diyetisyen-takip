import Stripe from "stripe";
import { eq } from "drizzle-orm";

// Initialize Stripe with secret key
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.warn(
    "[Stripe] STRIPE_SECRET_KEY not configured. Stripe features will be disabled. " +
    "Set STRIPE_SECRET_KEY environment variable for production."
  );
}

const stripe = stripeKey
  ? new Stripe(stripeKey, {
      apiVersion: "2026-03-25.dahlia" as any,
    })
  : null;

// Stripe webhook secret for signature verification
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Create a Stripe payment intent for subscription
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = "usd",
  metadata?: Record<string, string>
) {
  try {
    if (!stripe) throw new Error("Stripe not configured");
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error("Stripe payment intent error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Payment intent creation failed",
    };
  }
}

/**
 * Retrieve payment intent status
 */
export async function getPaymentIntentStatus(paymentIntentId: string) {
  try {
    if (!stripe) throw new Error("Stripe not configured");
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      success: true,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata,
    };
  } catch (error) {
    console.error("Stripe retrieve payment intent error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to retrieve payment intent",
    };
  }
}

/**
 * Create a customer in Stripe
 */
export async function createStripeCustomer(
  email: string,
  name?: string,
  metadata?: Record<string, string>
) {
  try {
    if (!stripe) throw new Error("Stripe not configured");
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });

    return {
      success: true,
      customerId: customer.id,
    };
  } catch (error) {
    console.error("Stripe customer creation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Customer creation failed",
    };
  }
}

/**
 * Create a subscription
 */
export async function createSubscription(
  customerId: string,
  priceId: string,
  metadata?: Record<string, string>
) {
  try {
    if (!stripe) throw new Error("Stripe not configured");
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: priceId,
        },
      ],
      metadata,
      payment_behavior: "default_incomplete",
      payment_settings: {
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.payment_intent"],
    });

    const paymentIntent = subscription.latest_invoice &&
      typeof subscription.latest_invoice !== "string" &&
      (subscription.latest_invoice as any).payment_intent &&
      typeof (subscription.latest_invoice as any).payment_intent !== "string"
        ? ((subscription.latest_invoice as any).payment_intent as any).client_secret
        : null;

    return {
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status,
      clientSecret: paymentIntent,
    };
  } catch (error) {
    console.error("Stripe subscription creation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Subscription creation failed",
    };
  }
}

/**
 * Update payment status in database
 */
export async function updatePaymentStatusFromStripe(
  stripePaymentIntentId: string,
  status: "pending" | "completed" | "failed" | "refunded"
) {
  try {
    // In production, this would update the database
    // For now, we'll just log the update
    console.log(`Payment ${stripePaymentIntentId} status updated to ${status}`);
    return { success: true };
  } catch (error) {
    console.error("Update payment status error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update payment status",
    };
  }
}

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(event: Stripe.Event) {
  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment succeeded:", paymentIntent.id);
        // Update payment status in database
        await updatePaymentStatusFromStripe(paymentIntent.id, "completed");
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment failed:", paymentIntent.id);
        // Update payment status in database
        await updatePaymentStatusFromStripe(paymentIntent.id, "failed");
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Subscription updated:", subscription.id);
        // Handle subscription update
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Subscription deleted:", subscription.id);
        // Handle subscription cancellation
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Invoice payment succeeded:", invoice.id);
        // Handle invoice payment
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    return { success: true };
  } catch (error) {
    console.error("Webhook handling error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Webhook handling failed",
    };
  }
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): Stripe.Event | null {
  try {
    if (!stripe) throw new Error("Stripe not configured");
    return stripe.webhooks.constructEvent(body, signature, secret) as Stripe.Event;
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return null;
  }
}

/**
 * Get subscription details
 */
export async function getSubscriptionDetails(subscriptionId: string) {
  try {
    if (!stripe) throw new Error("Stripe not configured");
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    return {
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
      items: subscription.items.data.map((item: any) => ({
        priceId: item.price.id,
        productId: item.price.product,
        amount: item.price.unit_amount ? item.price.unit_amount / 100 : 0,
        currency: item.price.currency,
      })),
    };
  } catch (error) {
    console.error("Get subscription error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get subscription",
    };
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  try {
    if (!stripe) throw new Error("Stripe not configured");
    const subscription = await (stripe.subscriptions as any).del(subscriptionId);

    return {
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status,
    };
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel subscription",
    };
  }
}

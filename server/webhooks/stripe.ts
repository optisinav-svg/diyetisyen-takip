import { Request, Response } from "express";
import * as stripe from "../stripe";

/**
 * Handle Stripe webhook events
 * POST /api/webhooks/stripe
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

  if (!sig || !webhookSecret) {
    console.error("Missing Stripe webhook signature or secret");
    return res.status(400).json({ error: "Missing webhook configuration" });
  }

  try {
    // Verify webhook signature
    const event = stripe.verifyWebhookSignature(
      req.body as string,
      sig,
      webhookSecret
    );

    if (!event) {
      console.error("Invalid webhook signature");
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Handle the event
    const result = await stripe.handleStripeWebhook(event);

    if (!result.success) {
      console.error("Error handling webhook:", result.error);
      return res.status(500).json({ error: result.error });
    }

    return res.json({ received: true, eventType: event.type });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Webhook processing failed",
    });
  }
}

/**
 * Test webhook endpoint for development
 * GET /api/webhooks/stripe/test
 */
export async function testStripeWebhook(req: Request, res: Response) {
  try {
    // Simulate a payment_intent.succeeded event
    const testEvent = {
      type: "payment_intent.succeeded",
      data: {
        object: {
          id: "pi_test_123",
          status: "succeeded",
          amount: 9900,
          currency: "usd",
          metadata: { userId: "1" },
        },
      },
    };

    const result = await stripe.handleStripeWebhook(testEvent as any);

    return res.json({
      success: result.success,
      message: "Test webhook processed",
      event: testEvent.type,
    });
  } catch (error) {
    console.error("Test webhook error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Test webhook failed",
    });
  }
}

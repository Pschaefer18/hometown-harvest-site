import { NextResponse } from "next/server";
import { getStripe } from "@/lib/server/stripe";
import { markOrderPaid, releaseOrderStock } from "@/lib/server/orders";

export const dynamic = "force-dynamic";

// POST /api/stripe-webhook
// Stripe calls this when a checkout is paid, expires, or a delayed payment fails.
// Paid orders are marked "paid"; unpaid ones have their stock returned to Inventory.
export async function POST(request) {
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  let event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook signature check failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const session = event.data.object;
  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await markOrderPaid(session);
        break;
      case "checkout.session.expired":
        await releaseOrderStock(session.metadata?.orderNumber, "checkout_expired");
        break;
      case "checkout.session.async_payment_failed":
        await releaseOrderStock(session.metadata?.orderNumber, "payment_failed");
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    // A 500 makes Stripe retry later.
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}

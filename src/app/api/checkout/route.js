import { NextResponse } from "next/server";
import { getStripe } from "@/lib/server/stripe";
import { toCents } from "@/lib/orderConfig";
import {
  buildOrder,
  createPendingOrder,
  OrderValidationError,
  releaseExpiredHolds,
  releaseOrderStock,
} from "@/lib/server/orders";

export const dynamic = "force-dynamic";

// POST /api/checkout
// Validates and prices the order, reserves inventory and saves the order to
// Firestore as "pending_payment", then creates a Stripe Checkout session.
export async function POST(request) {
  let order;
  try {
    order = buildOrder(await request.json());
  } catch (err) {
    if (err instanceof OrderValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Free up stock from abandoned checkouts before checking availability.
  await releaseExpiredHolds().catch((err) => console.error("Hold cleanup failed:", err));

  let pending;
  try {
    pending = await createPendingOrder(order);
  } catch (err) {
    if (err instanceof OrderValidationError) {
      return NextResponse.json({ error: err.message, inventoryChanged: true }, { status: 409 });
    }
    console.error("Checkout error (saving order):", err);
    return NextResponse.json(
      { error: "We couldn't start checkout. Please try again, or contact us if the problem continues." },
      { status: 500 }
    );
  }

  const { ref: orderRef, orderNumber, cancelToken, holdExpiresAt } = pending;
  try {
    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

    const lineItems = order.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        unit_amount: toCents(item.unitPrice),
        product_data: {
          name:
            item.amount === 1 && item.unit !== "lb"
              ? `${item.productName} (per ${item.unit})`
              : `${item.productName} (${item.sizeLabel})`,
        },
      },
    }));
    if (order.fulfillmentFee > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: toCents(order.fulfillmentFee),
          product_data: { name: order.fulfillment.method === "delivery" ? "Delivery fee" : "Pickup fee" },
        },
      });
    }

    const fulfillmentText =
      order.fulfillment.method === "delivery"
        ? `Home delivery on ${order.fulfillment.date}`
        : `Garden pickup on ${order.fulfillment.date} (${order.fulfillment.time})`;

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: order.customer.email,
      client_reference_id: orderNumber,
      metadata: { orderNumber },
      // The checkout link stops working when the inventory hold ends.
      expires_at: Math.floor(holdExpiresAt.toMillis() / 1000),
      payment_intent_data: {
        description: `Hometown Harvest order ${orderNumber}`,
        metadata: { orderNumber },
      },
      custom_text: {
        submit: { message: `Order ${orderNumber}: ${fulfillmentText}.` },
      },
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/order?canceled=1&order=${orderNumber}&token=${cancelToken}`,
    });

    await orderRef.update({ stripeSessionId: session.id });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error (Stripe):", err);
    // Give the reserved stock back since the customer can't pay.
    await releaseOrderStock(orderNumber, "checkout_failed").catch((e) => console.error("Stock release failed:", e));
    return NextResponse.json(
      { error: "We couldn't start checkout. Please try again, or contact us if the problem continues." },
      { status: 500 }
    );
  }
}

import { randomBytes, randomInt } from "crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "./firebaseAdmin";
import { getStripe } from "./stripe";
import { sendConfirmationEmailOnce } from "./email";
import {
  CHECKOUT_HOLD_MINUTES,
  FULFILLMENT_OPTIONS,
  INVENTORY_COLLECTION,
  MAX_QTY_PER_LINE,
  ORDERS_COLLECTION,
  PICKUP_ADDRESS,
  PRODUCTS,
  findProduct,
  findSize,
  getFulfillmentFee,
  isDeliveryZipAllowed,
  isOptionOpen,
} from "../orderConfig";

export class OrderValidationError extends Error {}
class OrderNumberTaken extends Error {}

// Orders in these statuses are holding inventory that hasn't been paid for yet.
const HOLDING_STATUSES = ["pending_payment", "payment_processing"];

const clean = (value, max = 200) => (typeof value === "string" ? value.trim().slice(0, max) : "");

// Takes the raw request body from the order page and returns a fully priced
// order. All prices come from orderConfig.js, never from the browser.
export function buildOrder(body) {
  const fail = (msg) => {
    throw new OrderValidationError(msg);
  };

  // Items
  if (!Array.isArray(body?.items) || body.items.length === 0) fail("Your order is empty.");
  const items = body.items.map((line) => {
    const product = findProduct(line.productId);
    const size = findSize(product, line.sizeId);
    const quantity = Number(line.quantity);
    if (!product || !size) fail("One of the items in your order is no longer available.");
    if (!product.available) fail(`${product.name} is sold out.`);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY_PER_LINE) {
      fail(`Quantity for ${product.name} must be between 1 and ${MAX_QTY_PER_LINE}.`);
    }
    return {
      productId: product.id,
      productName: product.name,
      sizeId: size.id,
      sizeLabel: size.label,
      pounds: size.pounds,
      unitPrice: size.price,
      quantity,
      lineTotal: size.price * quantity,
    };
  });

  // Fulfillment
  const option = FULFILLMENT_OPTIONS.find((o) => o.id === body?.fulfillmentId);
  if (!option) fail("Please choose delivery or pickup.");
  if (!isOptionOpen(option)) fail(`Ordering for ${option.dateLabel} has closed.`);

  // Customer
  const customer = {
    firstName: clean(body.customer?.firstName, 80),
    lastName: clean(body.customer?.lastName, 80),
    email: clean(body.customer?.email, 200).toLowerCase(),
    phone: clean(body.customer?.phone, 30),
  };
  if (!customer.firstName || !customer.lastName) fail("Please enter your first and last name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) fail("Please enter a valid email address.");
  if (customer.phone.replace(/\D/g, "").length < 10) fail("Please enter a valid phone number.");

  // Address (delivery only)
  let address = null;
  if (option.method === "delivery") {
    address = {
      street: clean(body.address?.street),
      unit: clean(body.address?.unit, 50),
      city: clean(body.address?.city, 100),
      zipCode: clean(body.address?.zipCode, 10),
    };
    if (!address.street || !address.city || !address.zipCode) fail("Please enter your full delivery address.");
    if (!/^\d{5}$/.test(address.zipCode)) fail("Please enter a 5-digit ZIP code.");
    if (!isDeliveryZipAllowed(address.zipCode)) {
      fail("Sorry, that ZIP code is outside our delivery area. Garden pickup is available!");
    }
  }

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const fulfillmentFee = getFulfillmentFee(option, subtotal);

  return {
    items,
    totalPounds: items.reduce((sum, i) => sum + i.pounds * i.quantity, 0),
    subtotal,
    fulfillmentFee,
    total: subtotal + fulfillmentFee,
    fulfillment: {
      optionId: option.id,
      method: option.method,
      date: option.dateLabel,
      time: option.timeLabel,
      location: option.method === "pickup" ? PICKUP_ADDRESS : null,
    },
    customer,
    address,
    notes: clean(body.notes, 1000),
  };
}

// { "onions": 35, "sweet-potatoes-orange": 10 }
function poundsByProduct(items) {
  const totals = {};
  for (const item of items) totals[item.productId] = (totals[item.productId] || 0) + item.pounds * item.quantity;
  return totals;
}

const inventoryRef = (db, productId) => db.collection(INVENTORY_COLLECTION).doc(productId);
const orderRef = (db, orderNumber) => db.collection(ORDERS_COLLECTION).doc(orderNumber);

// Current pounds available for every product in orderConfig. Missing docs count as 0.
export async function getInventory() {
  const db = getAdminDb();
  const snaps = await db.getAll(...PRODUCTS.map((p) => inventoryRef(db, p.id)));
  return Object.fromEntries(
    snaps.map((snap, i) => [PRODUCTS[i].id, snap.exists ? Math.max(0, Number(snap.get("poundsAvailable")) || 0) : 0])
  );
}

// Readable order numbers like "HH-7KQ4M". Skips look-alike characters (0/O, 1/I).
function generateOrderNumber() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) code += chars[randomInt(chars.length)];
  return `HH-${code}`;
}

// In one transaction: checks stock, subtracts the ordered pounds from Inventory,
// and saves the order as "pending_payment". Throws OrderValidationError if
// there isn't enough stock.
export async function createPendingOrder(order) {
  const db = getAdminDb();
  const reservation = poundsByProduct(order.items);
  const productIds = Object.keys(reservation);
  const holdExpiresAt = Timestamp.fromMillis(Date.now() + CHECKOUT_HOLD_MINUTES * 60 * 1000);

  for (let attempt = 0; attempt < 5; attempt++) {
    const orderNumber = generateOrderNumber();
    const cancelToken = randomBytes(16).toString("hex");
    const ref = orderRef(db, orderNumber);
    try {
      await db.runTransaction(async (tx) => {
        const [orderSnap, ...invSnaps] = await tx.getAll(ref, ...productIds.map((id) => inventoryRef(db, id)));
        if (orderSnap.exists) throw new OrderNumberTaken();

        invSnaps.forEach((snap, i) => {
          const available = snap.exists ? Number(snap.get("poundsAvailable")) || 0 : 0;
          const needed = reservation[productIds[i]];
          if (needed > available) {
            const name = findProduct(productIds[i]).name;
            throw new OrderValidationError(
              available > 0
                ? `Sorry, only ${available} lb of ${name} left. Please adjust your order.`
                : `Sorry, ${name} just sold out. Please remove it from your order.`
            );
          }
        });

        invSnaps.forEach((snap, i) =>
          tx.update(snap.ref, {
            poundsAvailable: FieldValue.increment(-reservation[productIds[i]]),
            updatedAt: FieldValue.serverTimestamp(),
          })
        );
        tx.create(ref, {
          ...order,
          orderNumber,
          status: "pending_payment",
          stockReservation: reservation,
          stockReleased: false,
          cancelToken,
          holdExpiresAt,
          createdAt: FieldValue.serverTimestamp(),
        });
      });
      return { ref, orderNumber, cancelToken, holdExpiresAt };
    } catch (err) {
      if (!(err instanceof OrderNumberTaken)) throw err;
    }
  }
  throw new Error("Could not generate a unique order number.");
}

// Puts an unpaid order's pounds back into Inventory and sets its final status.
// Safe to call repeatedly: only orders still holding stock are released.
export async function releaseOrderStock(orderNumber, newStatus) {
  if (!orderNumber) return false;
  const db = getAdminDb();
  const ref = orderRef(db, orderNumber);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists || !HOLDING_STATUSES.includes(snap.get("status"))) return false;

    const reservation = snap.get("stockReservation") || {};
    if (!snap.get("stockReleased")) {
      for (const [productId, pounds] of Object.entries(reservation)) {
        tx.set(
          inventoryRef(db, productId),
          { poundsAvailable: FieldValue.increment(pounds), updatedAt: FieldValue.serverTimestamp() },
          { merge: true }
        );
      }
    }
    tx.update(ref, { status: newStatus, stockReleased: true, releasedAt: FieldValue.serverTimestamp() });
    return true;
  });
}

// Called by the Stripe webhook, the success page, and the cleanup sweep.
// Safe to call repeatedly.
export async function markOrderPaid(session) {
  const orderNumber = session.metadata?.orderNumber;
  if (!orderNumber) return;

  const db = getAdminDb();
  const ref = orderRef(db, orderNumber);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists || snap.get("status") === "paid") return;

    // Checkout finished, but a slower payment method (e.g. bank transfer) is still clearing.
    if (session.payment_status !== "paid") {
      if (snap.get("status") === "pending_payment") tx.update(ref, { status: "payment_processing" });
      return;
    }

    const amountPaid = session.amount_total / 100;
    tx.update(ref, {
      status: "paid",
      paidAt: FieldValue.serverTimestamp(),
      amountPaid,
      amountMismatch: amountPaid !== snap.get("total"),
      // Should never happen: payment arrived after the stock was put back.
      ...(snap.get("stockReleased") ? { needsReview: "Paid after stock was released. Check inventory." } : {}),
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent ?? null,
    });
  });

  if (session.payment_status === "paid") await sendConfirmationEmailOnce(orderNumber);
}

// Asks Stripe for the true state of an order's checkout, then marks it paid
// or releases its stock. With `expireNow`, an open checkout is closed first.
async function reconcileWithStripe(order, { expireNow, releaseStatus }) {
  if (!order.stripeSessionId) {
    // Checkout never started (e.g. Stripe was unreachable). Just release the hold.
    return releaseOrderStock(order.orderNumber, releaseStatus);
  }
  const stripe = getStripe();
  let session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
  if (session.status === "open" && expireNow) {
    try {
      session = await stripe.checkout.sessions.expire(order.stripeSessionId);
    } catch {
      session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
    }
  }
  if (session.status === "expired") return releaseOrderStock(order.orderNumber, releaseStatus);
  if (session.status === "complete") await markOrderPaid(session);
  return false;
}

// Customer clicked "back" on the Stripe page. Close their checkout and return the stock.
export async function cancelPendingOrder(orderNumber, cancelToken) {
  if (!/^HH-[A-Z0-9]{5}$/.test(orderNumber || "") || !cancelToken) return false;
  const snap = await orderRef(getAdminDb(), orderNumber).get();
  if (!snap.exists || snap.get("cancelToken") !== cancelToken || snap.get("status") !== "pending_payment") {
    return false;
  }
  return reconcileWithStripe(snap.data(), { expireNow: true, releaseStatus: "canceled" });
}

// Backup for the webhook: finds unpaid orders whose hold time has passed and
// releases their stock. Runs at most once a minute per server instance.
let lastSweep = 0;
export async function releaseExpiredHolds() {
  if (Date.now() - lastSweep < 60 * 1000) return;
  lastSweep = Date.now();

  const snaps = await getAdminDb().collection(ORDERS_COLLECTION).where("status", "==", "pending_payment").get();
  const graceMs = 60 * 1000;
  const expired = snaps.docs.filter((d) => {
    const holdExpiresAt = d.get("holdExpiresAt");
    return holdExpiresAt && holdExpiresAt.toMillis() + graceMs < Date.now();
  });
  await Promise.all(
    expired.map((d) =>
      reconcileWithStripe(d.data(), { expireNow: true, releaseStatus: "checkout_expired" }).catch((err) =>
        console.error(`Could not reconcile order ${d.id}:`, err)
      )
    )
  );
}

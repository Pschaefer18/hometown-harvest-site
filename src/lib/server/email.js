// Order confirmation email, sent from the server through EmailJS's REST API.
// The full email body is built here as HTML and passed to a simple EmailJS
// template as {{{message_html}}}. See ORDERING_SETUP.md, "Confirmation emails".
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "./firebaseAdmin";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  ORDERS_COLLECTION,
  PICKUP_ADDRESS,
  PICKUP_DIRECTIONS,
  PICKUP_MAPS_URL,
  PICKUP_MAP_IMAGE,
  SITE_URL,
  formatPrice,
  quantityLabel,
} from "../orderConfig";

const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export function buildOrderEmailHtml(order) {
  const isPickup = order.fulfillment.method === "pickup";
  const font = "font-family:Georgia,'Times New Roman',serif;";
  const body = "font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5;color:#222;";

  const itemRows = order.items
    .map(
      (i) => `<tr>
        <td style="padding:6px 0;${body}">${esc(i.productName)}, ${esc(quantityLabel(i)).replace(" × ", " &times; ")}</td>
        <td style="padding:6px 0;${body}text-align:right;">${formatPrice(i.lineTotal)}</td>
      </tr>`
    )
    .join("");
  const feeRow = `<tr>
      <td style="padding:6px 0;${body}">${isPickup ? "Garden pickup" : "Delivery"}</td>
      <td style="padding:6px 0;${body}text-align:right;">${order.fulfillmentFee ? formatPrice(order.fulfillmentFee) : "Free"}</td>
    </tr>`;

  const fulfillmentBlock = isPickup
    ? `<p style="margin:0 0 4px;${body}font-weight:bold;font-size:17px;">Garden Pickup: ${esc(order.fulfillment.date)}</p>
       <p style="margin:0 0 4px;${body}">${esc(order.fulfillment.time)}</p>
       <p style="margin:0 0 12px;${body}"><a href="${PICKUP_MAPS_URL}" style="color:#111;font-weight:bold;">${esc(PICKUP_ADDRESS)}</a> (open in Google Maps)</p>
       <p style="margin:0 0 14px;${body}">${esc(PICKUP_DIRECTIONS)}</p>
       <a href="${SITE_URL}${PICKUP_MAP_IMAGE}"><img src="${SITE_URL}${PICKUP_MAP_IMAGE}" width="400" alt="Map of the garden showing where to pick up your order" style="display:block;width:100%;max-width:400px;height:auto;border:2px solid #111;border-radius:12px;"></a>`
    : `<p style="margin:0 0 4px;${body}font-weight:bold;font-size:17px;">Home Delivery: ${esc(order.fulfillment.date)}</p>
       <p style="margin:0 0 4px;${body}">${esc(order.fulfillment.time)}</p>
       <p style="margin:0;${body}">${esc(order.address.street)}${order.address.unit ? `, ${esc(order.address.unit)}` : ""}<br>${esc(order.address.city)}, MI ${esc(order.address.zipCode)}</p>`;

  return `<div style="background:#f4f4f4;padding:24px 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#fff;border:3px solid #111;border-radius:16px;">
    <tr><td style="padding:28px 28px 8px;text-align:center;">
      <img src="${SITE_URL}/Hometown%20Harvest%20Logo%20(transparent%20background).png" width="110" alt="Hometown Harvest" style="width:110px;height:auto;">
      <h1 style="${font}font-size:26px;margin:12px 0 6px;color:#111;">Thanks for your order, ${esc(order.customer.firstName)}!</h1>
      <p style="margin:0;${body}">Order <strong>${esc(order.orderNumber)}</strong> is confirmed and paid.</p>
    </td></tr>
    <tr><td style="padding:20px 28px;">
      <div style="border:2px solid #111;border-radius:12px;padding:18px;">${fulfillmentBlock}</div>
    </td></tr>
    <tr><td style="padding:0 28px 8px;">
      <h2 style="${font}font-size:20px;margin:0 0 8px;color:#111;">Your order</h2>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${itemRows}
        ${feeRow}
        <tr>
          <td style="padding:10px 0 0;border-top:2px solid #111;${body}font-weight:bold;font-size:17px;">Total paid</td>
          <td style="padding:10px 0 0;border-top:2px solid #111;${body}font-weight:bold;font-size:17px;text-align:right;">${formatPrice(order.total)}</td>
        </tr>
      </table>
      ${order.notes ? `<p style="margin:16px 0 0;${body}"><strong>Your notes:</strong> ${esc(order.notes)}</p>` : ""}
    </td></tr>
    <tr><td style="padding:20px 28px 28px;">
      <p style="margin:0;${body}font-size:14px;color:#555;">Need to make a change? Reply to this email, write to <a href="mailto:${CONTACT_EMAIL}" style="color:#111;">${CONTACT_EMAIL}</a>, or call/text ${CONTACT_PHONE}, and mention order ${esc(order.orderNumber)}.</p>
    </td></tr>
  </table>
  <p style="text-align:center;${body}font-size:12px;color:#888;margin:14px 0 0;">Hometown Harvest &middot; Dexter, MI</p>
</div>`;
}

async function sendWithEmailJs(order) {
  const { EMAILJS_SERVICE_ID, EMAILJS_ORDER_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY } = process.env;
  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_ORDER_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      accessToken: EMAILJS_PRIVATE_KEY,
      template_params: {
        to_email: order.customer.email,
        to_name: `${order.customer.firstName} ${order.customer.lastName}`,
        owner_email: CONTACT_EMAIL,
        subject: `Your Hometown Harvest order ${order.orderNumber}`,
        order_number: order.orderNumber,
        message_html: buildOrderEmailHtml(order),
      },
    }),
  });
  if (!res.ok) throw new Error(`EmailJS ${res.status}: ${(await res.text()).slice(0, 300)}`);
}

// Sends the confirmation email for a paid order exactly once, even though the
// webhook and the success page may both call this. Failed sends are retried
// the next time it's called.
export async function sendConfirmationEmailOnce(orderNumber) {
  const required = ["EMAILJS_SERVICE_ID", "EMAILJS_ORDER_TEMPLATE_ID", "EMAILJS_PUBLIC_KEY", "EMAILJS_PRIVATE_KEY"];
  if (required.some((k) => !process.env[k])) {
    console.warn("Confirmation email skipped: EmailJS env vars not set (see ORDERING_SETUP.md).");
    return;
  }

  const db = getAdminDb();
  const ref = db.collection(ORDERS_COLLECTION).doc(orderNumber);
  const order = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists || snap.get("status") !== "paid") return null;
    const state = snap.get("confirmationEmail.status");
    if (state === "sent" || state === "sending") return null;
    tx.update(ref, { "confirmationEmail.status": "sending" });
    return snap.data();
  });
  if (!order) return;

  try {
    await sendWithEmailJs(order);
    await ref.update({ confirmationEmail: { status: "sent", sentAt: FieldValue.serverTimestamp() } });
  } catch (err) {
    console.error(`Confirmation email for ${orderNumber} failed:`, err);
    await ref.update({ confirmationEmail: { status: "failed", error: String(err.message).slice(0, 500) } });
  }
}

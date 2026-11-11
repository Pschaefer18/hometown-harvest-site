import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "../order.module.css";
import successStyles from "./success.module.css";
import ClearDraft from "./ClearDraft";
import { getStripe } from "@/lib/server/stripe";
import { getAdminDb } from "@/lib/server/firebaseAdmin";
import { markOrderPaid } from "@/lib/server/orders";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  ORDERS_COLLECTION,
  PICKUP_ADDRESS,
  PICKUP_DIRECTIONS,
  PICKUP_MAPS_URL,
  PICKUP_MAP_IMAGE,
  formatPrice,
  quantityLabel,
} from "@/lib/orderConfig";

export const metadata = { title: "Order Confirmed | Hometown Harvest" };
export const dynamic = "force-dynamic";

async function loadOrder(sessionId) {
  if (!sessionId) return null;
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") return { session, order: null };
    // Backup for the webhook: make sure the order is marked paid.
    await markOrderPaid(session);
    const snap = await getAdminDb().collection(ORDERS_COLLECTION).doc(session.metadata.orderNumber).get();
    return { session, order: snap.exists ? snap.data() : null };
  } catch (err) {
    console.error("Order success page error:", err);
    return null;
  }
}

export default async function OrderSuccessPage({ searchParams }) {
  const result = await loadOrder(searchParams?.session_id);
  const order = result?.order;
  const paid = result?.session?.payment_status === "paid";

  return (
    <div className={styles.page}>
      <ClearDraft enabled={paid} />
      <Link href="/" className={styles.backLink}>
        ← Home
      </Link>
      <div className={successStyles.wrapper}>
        <img
          className={successStyles.logo}
          src="/Hometown Harvest Logo (transparent background).png"
          alt="Hometown Harvest"
        />
        {paid ? (
          <>
            <h1 className={successStyles.title}>Thank you for your order!</h1>
            <p className={successStyles.lead}>
              {order ? <>Your order <strong>{order.orderNumber}</strong> is confirmed.</> : "Your payment was received."}{" "}
              A confirmation{order?.fulfillment.method === "pickup" ? " with pickup directions" : ""} has been
              emailed to {result.session.customer_details?.email || "you"}.
            </p>

            {order && (
              <div className={successStyles.card}>
                <div className={successStyles.fulfillment}>
                  <img
                    src={order.fulfillment.method === "delivery" ? "/express-delivery.png" : "/man-carrying-package.png"}
                    alt=""
                    width="56"
                    height="56"
                  />
                  <div>
                    <div className={successStyles.fulfillmentTitle}>
                      {order.fulfillment.method === "delivery" ? "Home Delivery" : "Garden Pickup"}:{" "}
                      {order.fulfillment.date}
                    </div>
                    <div>{order.fulfillment.time}</div>
                    {order.address && (
                      <div>
                        {order.address.street}
                        {order.address.unit && `, ${order.address.unit}`}, {order.address.city} {order.address.zipCode}
                      </div>
                    )}
                  </div>
                </div>

                <ul className={successStyles.items}>
                  {order.items.map((item) => (
                    <li key={`${item.productId}-${item.sizeId}`}>
                      <span>
                        {item.productName}, {quantityLabel(item)}
                      </span>
                      <span>{formatPrice(item.lineTotal)}</span>
                    </li>
                  ))}
                  {order.fulfillmentFee > 0 && (
                    <li>
                      <span>{order.fulfillment.method === "delivery" ? "Delivery fee" : "Pickup fee"}</span>
                      <span>{formatPrice(order.fulfillmentFee)}</span>
                    </li>
                  )}
                  <li className={successStyles.total}>
                    <span>Total paid</span>
                    <span>{formatPrice(order.total)}</span>
                  </li>
                </ul>
              </div>
            )}

            {order?.fulfillment.method === "pickup" && (
              <div className={successStyles.pickupCard}>
                <h2 className={successStyles.pickupTitle}>Where to pick up</h2>
                <p className={successStyles.pickupAddress}>
                  <a href={PICKUP_MAPS_URL} target="_blank" rel="noopener noreferrer">
                    {PICKUP_ADDRESS}
                  </a>
                  <span className={successStyles.pickupMapsHint}>Opens in Google Maps</span>
                </p>
                <p className={successStyles.pickupDirections}>{PICKUP_DIRECTIONS}</p>
                <a href={PICKUP_MAP_IMAGE} target="_blank" rel="noopener noreferrer">
                  <img
                    className={successStyles.pickupMap}
                    src={PICKUP_MAP_IMAGE}
                    alt="Aerial map of the garden. The pickup spot is marked with a red pin near the sheds in the back corner, off Zeeb Rd just north of Daly Rd."
                  />
                </a>
              </div>
            )}

            <p className={successStyles.small}>
              Need to make a change? Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or call/text{" "}
              {CONTACT_PHONE}
              {order && <> and mention order {order.orderNumber}</>}.
            </p>
          </>
        ) : (
          <>
            <h1 className={successStyles.title}>We couldn't confirm your payment</h1>
            <p className={successStyles.lead}>
              If you completed checkout, you'll receive an emailed receipt shortly. If you have any questions, contact
              us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or {CONTACT_PHONE}.
            </p>
          </>
        )}
        <div className={successStyles.actions}>
          <Link href="/" className="btn btn-dark">
            Back to Home
          </Link>
          <Link href="/order" className="btn btn-outline-dark">
            Place Another Order
          </Link>
        </div>
      </div>
    </div>
  );
}

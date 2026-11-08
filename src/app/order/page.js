import "bootstrap/dist/css/bootstrap.min.css";
import OrderForm from "./OrderForm";
import { getOpenFulfillmentOptions } from "@/lib/orderConfig";
import { cancelPendingOrder, getInventory, releaseExpiredHolds } from "@/lib/server/orders";

export const metadata = {
  title: "Place an Order | Hometown Harvest",
  description:
    "Order fresh, locally grown sweet potatoes and onions from Hometown Harvest in Dexter, MI. Home delivery or garden pickup.",
};

// Re-evaluate on every request so stock levels and order cutoffs are always current.
export const dynamic = "force-dynamic";

export default async function OrderPage({ searchParams }) {
  const canceled = searchParams?.canceled === "1";

  // Returning from Stripe via "back": close that checkout and return its stock.
  if (canceled && searchParams.order) {
    await cancelPendingOrder(searchParams.order, searchParams.token).catch((err) =>
      console.error("Cancel order failed:", err)
    );
  }
  await releaseExpiredHolds().catch((err) => console.error("Hold cleanup failed:", err));

  // If Firestore can't be reached, show the page without stock limits.
  // The checkout API still enforces inventory.
  let inventory = null;
  try {
    inventory = await getInventory();
  } catch (err) {
    console.error("Could not load inventory:", err);
  }

  return (
    <OrderForm
      canceled={canceled}
      inventory={inventory}
      openOptionIds={getOpenFulfillmentOptions().map((o) => o.id)}
    />
  );
}

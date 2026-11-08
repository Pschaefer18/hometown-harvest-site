// ─────────────────────────────────────────────────────────────────────────────
// ORDER PAGE CONFIGURATION
// This is the only file you need to edit to change what's for sale, prices,
// delivery/pickup dates, and fees. Both the order page and the secure checkout
// API read from here, so customers can never change prices on their end.
// ─────────────────────────────────────────────────────────────────────────────

// Bulk sizes offered for every product unless a product overrides `sizes`.
// `price` is in whole US dollars.
export const DEFAULT_SIZES = [
  { id: "5lb", label: "5 lb", pounds: 5, price: 15 },
  { id: "10lb", label: "10 lb", pounds: 10, price: 28 },
  { id: "25lb", label: "25 lb", pounds: 25, price: 60, badge: "Best value" },
];
export const RADISH_SIZES = [
  { id: "5lb", label: "5 lb", pounds: 5, price: 10 },
  { id: "10lb", label: "10 lb", pounds: 10, price: 15 },
  { id: "25lb", label: "25 lb", pounds: 25, price: 30},
];

// Products for sale.
// - `image`: drop a photo into /public/products/ using this file name.
//   Until the file exists, a "photo coming soon" placeholder is shown.
// - `available: false` shows the product as "Sold out" without removing it.
// - Add a new product by copying one of the blocks below and giving it a new `id`.
export const PRODUCTS = [
  {
    id: "sweet-potatoes-orange",
    name: "Sweet Potatoes",
    tagline: "Cured for peak sweetness",
    description:
      "One of our orange varieties (Beauregard, Centennial, or Georgia Jet) grown without synthetic fertilizers or pesticides, then cured for extra sweetness. Sweet potatoes keep for months stored somewhere cool and dry (55–60°F). Don't refrigerate them.",
    image: "/products/sweet-potatoes.jpeg",
    available: true,
    sizes: DEFAULT_SIZES,
  },
  {
    id: "sweet-potatoes-jap",
    name: "Sweet Potatoes (japanese)",
    tagline: "murasaki variety, Cured for peak sweetness",
    description:
      "Grown at the garden in Dexter without synthetic fertilizers or pesticides, then cured for extra sweetness. Sweet potatoes keep for months stored somewhere cool and dry (55–60°F). Don't refrigerate them.",
    image: "/products/sweet-potatoes-jap.jpeg",
    available: true,
    sizes: DEFAULT_SIZES,
  },
  {
    id: "onions",
    name: "Onions",
    tagline: "Greenhouse-cured storage onions",
    description:
      "Cured storage onions grown at the garden. Kept somewhere cool, dry, and dark with good airflow, they'll last well into winter, so they're a great pantry staple to stock up on.",
    image: "/products/onions.jpeg",
    available: true,
    sizes: DEFAULT_SIZES,
  },
  {
    id: "radish-black-spanish",
    name: "Black Spanish Radish",
    tagline: "Bold, peppery heirloom winter radish",
    description:
      "An heirloom winter radish with dramatic black skin and crisp, bright white flesh. It's spicy raw: slice it thin for salads or grate it into slaws. Roasting or sautéing mellows it into something sweet and nutty. Stored in a bag in the fridge, it keeps for months.",
    image: "/products/radish-black-spanish.jpeg",
    available: true,
    sizes: RADISH_SIZES,
  },
  {
    id: "radish-watermelon",
    name: "Watermelon Radish",
    tagline: "Mild, sweet, and pink inside",
    description:
      "Pale green on the outside with a vivid magenta center. Crisp and mildly sweet with just a hint of spice. Beautiful sliced thin on salads, toast, and boards, quick-pickled, or roasted. Stored in a bag in the fridge, it keeps for months.",
    image: "/products/radish-watermelon.jpeg",
    available: true,
    sizes: RADISH_SIZES,
  },
  {
    id: "radish-daikon",
    name: "Daikon Radish",
    tagline: "Crisp, juicy, and mild",
    description:
      "Long white radish with a clean, mild flavor and a satisfying crunch. Shred it for slaws and kimchi, slice it into stir-fries and soups, or pickle it. It mellows and turns tender when simmered. Stored in a bag in the fridge, it keeps for months.",
    image: "/products/radish-daikon.jpeg",
    available: true,
    sizes: RADISH_SIZES,
  },
  {
    id: "radish-purple-daikon",
    name: "Purple Daikon Radish",
    tagline: "Daikon with a pop of color",
    description:
      "All the crunch and mild flavor of a classic daikon, with striking purple skin and purple-streaked flesh. Great raw in salads and slaws, quick-pickled (the brine turns bright pink), or roasted. Stored in a bag in the fridge, it keeps for months.",
    image: "/products/radish-purple-daikon.jpeg",
    available: true,
    sizes: RADISH_SIZES,
  },
  {
    id: "turnips-purple-top",
    name: "Purple Top Turnips",
    tagline: "Classic fall storage turnip",
    description:
      "A traditional heirloom turnip with a purple-blushed shoulder and white root. Mildly sweet and earthy. Roast it, mash it with potatoes, or add it to soups and stews. Stored in a bag in the fridge, it keeps for months.",
    image: "/products/turnips-purple-top.jpeg",
    available: true,
    sizes: RADISH_SIZES,
  },
];

// Delivery and pickup dates.
// - `orderCutoff`: after this moment the option disappears from the page and
//   the checkout API refuses it. Use a full timestamp with the Michigan offset
//   (-05:00 in winter / EST, -04:00 in summer / EDT).
// - `fee`: added to the order total in whole dollars (0 = free).
// - `freeOver` (optional): the fee is waived when the produce subtotal is at least this amount.
// - Add more dates by adding objects; expired ones hide themselves automatically.
export const FULFILLMENT_OPTIONS = [
  {
    id: "delivery-2026-11-17",
    method: "delivery",
    title: "Home Delivery",
    dateLabel: "Tuesday, November 17",
    timeLabel: "Afternoon delivery, approx. 2–6 PM",
    orderCutoff: "2026-11-16T23:59:00-05:00",
    cutoffLabel: "Order by Monday, Nov 16",
    fee: 5,
    freeOver: 50,
    icon: "/express-delivery.png",
    iconInactive: "/express-delivery-gray.png",
  },
  {
    id: "pickup-2026-11-21",
    method: "pickup",
    title: "Garden Pickup",
    dateLabel: "Saturday, November 21",
    timeLabel: "12–6 PM at 5185 Zeeb Rd, Dexter",
    orderCutoff: "2026-11-20T23:59:00-05:00",
    cutoffLabel: "Order by Friday, Nov 20",
    fee: 0,
    icon: "/man-carrying-package.png",
    iconInactive: "/man-carrying-package-gray.png",
  },
];

// ZIP codes we deliver to. Orders for delivery to any other ZIP are refused
// (customers are pointed to garden pickup). Leave empty to accept any address.
// Add a short area name after each ZIP; it's shown to customers.
export const DELIVERY_ZIP_CODES = {
  "48130": "Dexter",
  "48189": "Dexter (north)",
  "48103": "Ann Arbor (west)",
  "48104": "Ann Arbor (central)",
  "48105": "Ann Arbor (north)",
  "48108": "Ann Arbor (south)",
};

export const DELIVERY_AREA_NOTE = "We currently deliver to Dexter and Ann Arbor.";

// Max quantity of any single product/size combination per order.
export const MAX_QTY_PER_LINE = 10;

export const PICKUP_ADDRESS = "5185 Zeeb Rd, Dexter, MI";
export const PICKUP_MAPS_URL = "https://www.google.com/maps/search/?api=1&query=5185+Zeeb+Rd+Dexter+MI";
export const PICKUP_MAP_IMAGE = "/pickup-map.jpg";
// Shown with the map on the confirmation page and in the confirmation email.
export const PICKUP_DIRECTIONS =
  "The garden is on Zeeb Rd just north of Daly Rd. Pull into the long driveway at 5185 Zeeb Rd and follow it toward the shed. Your order will be in the box truck, bagged and labeled with your name.";

// Your live website address. Emails use it to load images (logo, pickup map),
// so those images only appear once the site is deployed.
export const SITE_URL = "https://www.hometownharvestllc.com";
export const CONTACT_EMAIL = "paul@hometownharvestllc.com";
export const CONTACT_PHONE = "(734) 417-9715";

// Firestore collection that orders are saved to.
export const ORDERS_COLLECTION = "Orders";

// Firestore collection holding stock levels. One document per product, with the
// document ID equal to the product `id` above and a number field `poundsAvailable`.
// A product with no inventory document shows as sold out.
export const INVENTORY_COLLECTION = "Inventory";

// Show "Only X lb left" when a product's stock is at or below this many pounds.
export const LOW_STOCK_POUNDS = 50;

// How long stock is held for a customer while they're on the Stripe payment page.
// Stripe requires at least 30 minutes. Unpaid holds are released automatically.
export const CHECKOUT_HOLD_MINUTES = 31;

// ── Helpers (no need to edit below) ─────────────────────────────────────────

export function isOptionOpen(option, now = new Date()) {
  return now < new Date(option.orderCutoff);
}

export function getOpenFulfillmentOptions(now = new Date()) {
  return FULFILLMENT_OPTIONS.filter((o) => isOptionOpen(o, now));
}

// Fee for a delivery/pickup option given the produce subtotal (before fees).
export function getFulfillmentFee(option, subtotal) {
  if (!option?.fee) return 0;
  if (option.freeOver && subtotal >= option.freeOver) return 0;
  return option.fee;
}

export function isDeliveryZipAllowed(zipCode) {
  const zips = Object.keys(DELIVERY_ZIP_CODES);
  return zips.length === 0 || zips.includes(zipCode);
}

export function findProduct(productId) {
  return PRODUCTS.find((p) => p.id === productId);
}

export function findSize(product, sizeId) {
  return product?.sizes.find((s) => s.id === sizeId);
}

export function formatPrice(dollars) {
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

export function pricePerPound(size) {
  return `$${(size.price / size.pounds).toFixed(2)}/lb`;
}

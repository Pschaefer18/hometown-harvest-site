# Online Ordering Setup

The **Place an Order** page (`/order`) works like this:

1. The customer picks produce, chooses delivery or pickup, and enters their details.
2. The server re-prices the order from `src/lib/orderConfig.js`, saves it to Firestore in the
   **`Orders`** collection with status `pending_payment`, and sends the customer to Stripe Checkout.
3. After payment, Stripe notifies the site through a webhook and the order changes to `paid`.
   The confirmation page also double-checks this, as a backup.

There are four setup steps: **Firebase credentials → Stripe keys → Stripe webhook → Firestore rules.**

---

## 1. Firebase: create server credentials

Orders contain customers' names, addresses, and phone numbers, so they're written **only by the server**
using the Firebase Admin SDK. The public can't read or write them.

1. Go to the [Firebase console](https://console.firebase.google.com) → project **csa-registration-1ed70**.
2. ⚙️ **Project settings** → **Service accounts** → **Generate new private key** → **Generate key**.
   A JSON file downloads. Treat it like a password and don't put it in the repo.
3. Copy three values from it into `.env.local`:

   | JSON field     | Env variable            |
   |----------------|-------------------------|
   | `project_id`   | `FIREBASE_PROJECT_ID`   |
   | `client_email` | `FIREBASE_CLIENT_EMAIL` |
   | `private_key`  | `FIREBASE_PRIVATE_KEY` (wrap it in double quotes and keep the `\n`s) |

You **don't** need to create the `Orders` collection by hand. Firestore creates it automatically when the
first order arrives.

## 2. Stripe: API key

1. In the [Stripe Dashboard](https://dashboard.stripe.com), turn on **Test mode** (toggle at top right).
2. **Developers → API keys** → copy the **Secret key** (`sk_test_...`) into `STRIPE_SECRET_KEY`.
3. **Settings → Customer emails** → turn on **Successful payments** so customers get an emailed receipt.
4. **Settings → Business → Public details**: set your business name, logo, and support email/phone.
   These appear on the checkout page.

## 3. Stripe: webhook (marks orders as paid)

**On the live site:**
1. **Developers → Webhooks → Add endpoint**
2. Endpoint URL: `https://www.hometownharvestllc.com/api/stripe-webhook`
3. Select events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
   `checkout.session.async_payment_failed`, `checkout.session.expired`
4. Copy the **Signing secret** (`whsec_...`) into `STRIPE_WEBHOOK_SECRET`.

**For local testing,** install the [Stripe CLI](https://docs.stripe.com/stripe-cli) and run:
```bash
stripe login
stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed,checkout.session.expired --forward-to localhost:3000/api/stripe-webhook
```
It prints a `whsec_...` secret. Put it in `.env.local` while testing locally.

## 4. Firestore security rules

Open **Firestore Database → Rules** in the Firebase console and look at what's there now.

> ⚠️ If your rules contain a broad match like `match /{document=**} { allow read, write: if ... }`
> (Firebase's "test mode" default), then **anyone** can read every collection, including customer
> orders. In Firestore an `allow` anywhere wins, so adding a "deny" rule for Orders doesn't override it.

Replace that broad rule with specific ones. This example keeps the CSA registration form working
(it writes to `2026 Members` from the browser) and keeps Orders private:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // CSA registration form: the browser may submit, but not read others' data.
    match /{collection}/{memberId} {
      allow create, update: if collection == '2026 Members';
    }

    // Orders and Inventory are handled only by the server (Admin SDK bypasses rules).
    match /Orders/{orderId} {
      allow read, write: if false;
    }
    match /Inventory/{productId} {
      allow read, write: if false;
    }
  }
}
```

Click **Publish**. Then submit a test CSA registration to confirm it still works.

## 5. Add the variables to Vercel

Vercel → your project → **Settings → Environment Variables**. Add `STRIPE_SECRET_KEY`,
`STRIPE_WEBHOOK_SECRET`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
(paste values without surrounding quotes; for the private key, paste the whole `-----BEGIN ... END PRIVATE KEY-----\n` value with its `\n`s as-is), then **redeploy**.

## 6. Test, then go live

1. Place an order with test card `4242 4242 4242 4242`, any future expiry date, and any CVC.
2. In Firestore, check that the order appears under **Orders** with `status: "paid"`.
3. When it all works, switch Stripe to **live mode**, create a live webhook endpoint (step 3),
   and replace both Stripe variables in Vercel with the live `sk_live_...` / `whsec_...` values. Redeploy.

---

## 7. Confirmation emails (EmailJS)

When an order is paid, the site emails the customer a confirmation with their order details. Pickup
orders also get the address, directions, and pickup map. It's sent through the same EmailJS account as
the CSA signup form. It goes out once per order, even if the customer closes their browser.

1. **Allow server sending:** [EmailJS dashboard](https://dashboard.emailjs.com) → **Account → Security** →
   turn on **"Allow EmailJS API for non-browser applications."**
2. **Get your private key:** **Account → API keys** → copy the **Private Key** into `EMAILJS_PRIVATE_KEY`.
3. **Create the template:** **Email Templates → Create New Template**, then set:
   - **Subject:** `{{subject}}`
   - **To Email:** `{{to_email}}`
   - **From Name:** `Hometown Harvest`
   - **Reply To:** `paul@hometownharvestllc.com`
   - **Bcc:** `{{owner_email}}` (optional, so you get a copy of every order)
   - **Content:** switch the editor to **code view** (`<>`) and replace everything with exactly
     `{{{message_html}}}`. Use **three** braces so the HTML isn't escaped.

   Save, and copy the template ID (`template_...`) into `EMAILJS_ORDER_TEMPLATE_ID`.
4. **Add the variables:** put `EMAILJS_SERVICE_ID`, `EMAILJS_ORDER_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`, and
   `EMAILJS_PRIVATE_KEY` in `.env.local` and in Vercel (see `.env.example`).

Each order records `confirmationEmail.status` (`sent` / `failed` with an `error`) in Firestore.
If the variables aren't set, orders still work and no email is sent.

The email's logo and map load from your **live** site (`SITE_URL` in `orderConfig.js`), so they show
up in test emails only after `pickup-map.jpg` has been deployed. Edit the pickup directions text in
`PICKUP_DIRECTIONS`.

## Working with orders

In Firestore → **Orders**, each document is named by its order number (e.g. `HH-7KQ4M`), which the
customer also sees. Useful fields:

| Field | Meaning |
|-------|---------|
| `status` | `pending_payment` → `paid`. Unpaid orders end as `canceled`, `checkout_expired`, `payment_failed`, or `checkout_failed`, and their stock goes back to Inventory. `payment_processing` means a slow payment method (like a bank transfer) is still clearing. Change it to `fulfilled` by hand once delivered, if you'd like. |
| `stockReservation` | Pounds this order took from Inventory, per product |
| `fulfillment` | `method` (delivery/pickup), `date`, `time` |
| `customer`, `address` | Contact and delivery info (`address` is null for pickup) |
| `items` | Each product, size, quantity, and line total |
| `subtotal`, `fulfillmentFee`, `total`, `amountPaid` | Dollars |
| `notes` | Customer's notes (gate code, etc.) |
| `stripePaymentIntentId` | Use it to find the payment in Stripe for refunds |

**Tip:** In the Firestore console, use **Filter → status == paid** to see your packing list.

Refunds: in Stripe → **Payments** → find the payment (search by email or order number) → **Refund**.

## Inventory

Stock levels live in Firestore in the **`Inventory`** collection, tracked in **pounds**. All sizes of
a product draw from the same pool, so a 25 lb bag takes 25 lb.

**Setup:** create one document per product. The **document ID must match the product's `id`** in
`orderConfig.js`, and each document needs one field:

| Document ID | Field | Type | Example |
|-------------|-------|------|---------|
| `sweet-potatoes-orange` | `poundsAvailable` | number | `400` |
| `sweet-potatoes-jap` | `poundsAvailable` | number | `150` |
| `onions` | `poundsAvailable` | number | `300` |

In the Firebase console: **Firestore Database → Start collection** → Collection ID `Inventory` →
Document ID `onions` → add field `poundsAvailable`, type **number** → Save. Repeat with
**Add document** for the other products.

A product **without** an inventory document shows as **Sold out**. That's on purpose, so a typo can
never mean unlimited sales.

**How it works:**
- When a customer starts checkout, their pounds are subtracted right away, in one transaction, so two
  people can never buy the same last bag.
- They then have 30 minutes to pay. If they cancel, the checkout expires, or the payment fails, the pounds are
  added back automatically.
- The order page shows "In stock", "Only X lb left" (at 50 lb or less; set by `LOW_STOCK_POUNDS`),
  or "Sold out", and won't let customers add more than what's left.

**Managing inventory from the terminal** (uses the credentials in `.env.local`):

```bash
npm run inventory                      # show stock for every product
npm run inventory -- sync              # create Inventory docs (at 0 lb) for products new in orderConfig.js
npm run inventory -- set onions 300    # set stock to exactly 300 lb
npm run inventory -- add onions 50     # restock: add 50 lb (negative number removes)
```

Adding a new product: add it to `PRODUCTS` in `orderConfig.js` → `npm run inventory -- sync` →
`npm run inventory -- set <id> <lb>`. Prefer `add` over `set` while orders are coming in, since
`add` can't overwrite a sale that happens at the same moment.

**Restocking or correcting a count:** edit `poundsAvailable` in the console at any time. The number
you see is what's still available to sell; pounds held by in-progress checkouts are already subtracted.
To stop selling something without changing the count, set `available: false` in `orderConfig.js`.

## Day-to-day edits (all in `src/lib/orderConfig.js`)

- **Prices and sizes:** `DEFAULT_SIZES`
- **Products:** `PRODUCTS`. Copy a block to add one, or set `available: false` to show "Sold out".
- **Delivery/pickup dates:** `FULFILLMENT_OPTIONS`. Each option disappears automatically after its `orderCutoff`.
- **Delivery fee:** `fee` on each option (delivery is currently $5), with `freeOver` waiving it
  once the produce subtotal reaches that amount (currently $50). Remove `freeOver` to always charge the fee.
- **Delivery area:** `DELIVERY_ZIP_CODES` lists the ZIPs you deliver to (other ZIPs are refused and
  pointed to pickup; an empty `{}` accepts any address). Update `DELIVERY_AREA_NOTE` to match.

**Photos:** put them in `public/products/` named `sweet-potatoes.jpg` and `onions.jpg` (or change
the `image` paths). Landscape photos (4:3, about 1200×900) look best. Until a photo exists, the card
shows a "Photo coming soon" placeholder.

The "What to Know" text (delivery, pickup, storage, refunds) is in `src/app/order/OrderForm.js`.
Review it and edit it to match your actual policies.

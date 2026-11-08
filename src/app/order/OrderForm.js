"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./order.module.css";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  DELIVERY_AREA_NOTE,
  DELIVERY_ZIP_CODES,
  FULFILLMENT_OPTIONS,
  LOW_STOCK_POUNDS,
  PICKUP_MAP_IMAGE,
  MAX_QTY_PER_LINE,
  PRODUCTS,
  findProduct,
  findSize,
  formatPrice,
  getFulfillmentFee,
  isDeliveryZipAllowed,
  pricePerPound,
} from "@/lib/orderConfig";

// e.g. "$5 · Free on orders $50+"
function feeLabel(option) {
  if (!option.fee) return "Free";
  return option.freeOver
    ? `${formatPrice(option.fee)} · Free on orders ${formatPrice(option.freeOver)}+`
    : `+${formatPrice(option.fee)}`;
}

export const DRAFT_STORAGE_KEY = "hh-order-draft";

const EMPTY_CUSTOMER = { firstName: "", lastName: "", email: "", phone: "" };
const EMPTY_ADDRESS = { street: "", unit: "", city: "", zipCode: "" };

function formatPhone(value) {
  const d = value.replace(/\D/g, "").slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

// ── Product photo with a tasteful placeholder until a photo is added ─────────
function ProductImage({ src, alt }) {
  const [failed, setFailed] = useState(!src);
  const imgRef = useRef(null);

  // Catch images that failed to load before React hydrated.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) {
    return (
      <div className={styles.imagePlaceholder} role="img" aria-label={`${alt} (photo coming soon)`}>
        <img src="/Hometown Harvest Logo (transparent background).png" alt="" />
        <span>Photo coming soon</span>
      </div>
    );
  }
  return <img ref={imgRef} className={styles.productImage} src={src} alt={alt} onError={() => setFailed(true)} />;
}

function QuantityStepper({ value, onChange, label, disabled, canIncrease = true }) {
  return (
    <div className={styles.stepper} aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={disabled || value === 0}
        aria-label={`Remove one ${label}`}
      >
        −
      </button>
      <span aria-live="polite">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(MAX_QTY_PER_LINE, value + 1))}
        disabled={disabled || !canIncrease || value >= MAX_QTY_PER_LINE}
        aria-label={`Add one ${label}`}
      >
        +
      </button>
    </div>
  );
}

// inventory: { [productId]: poundsAvailable } from Firestore, or null if it couldn't be loaded.
export default function OrderForm({ canceled, openOptionIds, inventory }) {
  const router = useRouter();
  const openOptions = FULFILLMENT_OPTIONS.filter((o) => openOptionIds.includes(o.id));

  // quantities: { "sweet-potatoes:5lb": 2, ... }
  const [quantities, setQuantities] = useState({});
  const [fulfillmentId, setFulfillmentId] = useState("");
  const [customer, setCustomer] = useState(EMPTY_CUSTOMER);
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [draftLoaded, setDraftLoaded] = useState(false);

  // Restore a saved draft (e.g. after returning from Stripe with "Back").
  useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) || "null");
      if (draft) {
        setQuantities(draft.quantities || {});
        if (openOptionIds.includes(draft.fulfillmentId)) setFulfillmentId(draft.fulfillmentId);
        setCustomer({ ...EMPTY_CUSTOMER, ...draft.customer });
        setAddress({ ...EMPTY_ADDRESS, ...draft.address });
        setNotes(draft.notes || "");
      }
    } catch {}
    setDraftLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!draftLoaded) return;
    localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({ quantities, fulfillmentId, customer, address, notes })
    );
  }, [draftLoaded, quantities, fulfillmentId, customer, address, notes]);

  const setQty = (productId, sizeId, qty) =>
    setQuantities((prev) => {
      const next = { ...prev };
      if (qty > 0) next[`${productId}:${sizeId}`] = qty;
      else delete next[`${productId}:${sizeId}`];
      return next;
    });

  const lineItems = useMemo(
    () =>
      Object.entries(quantities)
        .map(([key, quantity]) => {
          const [productId, sizeId] = key.split(":");
          const product = findProduct(productId);
          const size = findSize(product, sizeId);
          if (!product?.available || !size || quantity < 1) return null;
          return { key, productId, sizeId, product, size, quantity, total: size.price * quantity };
        })
        .filter(Boolean),
    [quantities]
  );

  // Stock per product, accounting for what's already in the cart.
  const stockInfo = (product) => {
    const stock = inventory ? inventory[product.id] ?? 0 : Infinity;
    const inCart = lineItems
      .filter((l) => l.productId === product.id)
      .reduce((s, l) => s + l.size.pounds * l.quantity, 0);
    const smallestSize = Math.min(...product.sizes.map((s) => s.pounds));
    return {
      stock,
      inCart,
      remaining: stock - inCart,
      soldOut: !product.available || stock < smallestSize,
      overLimit: inCart > stock,
    };
  };
  const overLimitProducts = PRODUCTS.filter((p) => stockInfo(p).overLimit);

  const selectedOption = openOptions.find((o) => o.id === fulfillmentId);
  const isDelivery = selectedOption?.method === "delivery";
  const subtotal = lineItems.reduce((s, l) => s + l.total, 0);
  const fee = getFulfillmentFee(selectedOption, subtotal);
  const total = subtotal + fee;
  // How much more produce would make delivery free (0 if not applicable).
  const amountToFreeDelivery =
    selectedOption?.fee && selectedOption.freeOver && fee > 0 ? selectedOption.freeOver - subtotal : 0;
  const zipEntered = /^\d{5}$/.test(address.zipCode.trim());
  const zipOutOfArea = isDelivery && zipEntered && !isDeliveryZipAllowed(address.zipCode.trim());
  const totalPounds = lineItems.reduce((s, l) => s + l.size.pounds * l.quantity, 0);

  const missing = [];
  if (!lineItems.length) missing.push("add at least one item");
  for (const p of overLimitProducts) {
    const { stock } = stockInfo(p);
    missing.push(stock > 0 ? `reduce ${p.name} to ${stock} lb or less` : `remove ${p.name} (sold out)`);
  }
  if (!selectedOption) missing.push("choose delivery or pickup");
  if (!customer.firstName.trim() || !customer.lastName.trim()) missing.push("enter your name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) missing.push("enter a valid email");
  if (customer.phone.replace(/\D/g, "").length < 10) missing.push("enter your phone number");
  if (isDelivery && (!address.street.trim() || !address.city.trim() || !zipEntered)) {
    missing.push("enter your delivery address");
  }
  if (zipOutOfArea) missing.push("choose garden pickup (your ZIP is outside our delivery area)");
  const canSubmit = missing.length === 0 && !submitting;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lineItems.map(({ productId, sizeId, quantity }) => ({ productId, sizeId, quantity })),
          fulfillmentId,
          customer,
          address: isDelivery ? address : null,
          notes,
        }),
      });
      const data = await res.json().catch(() => ({}));
      // Someone else just bought the stock: reload availability (the cart is kept).
      if (data.inventoryChanged) router.refresh();
      if (!res.ok || !data.url) throw new Error(data.error || "Something went wrong. Please try again.");
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          ← Home
        </Link>
        <div className={styles.hero}>
          <img
            className={styles.heroLogo}
            src="/Hometown Harvest Logo (transparent background).png"
            alt="Hometown Harvest"
          />
          <div>
            <h1 className={styles.heroTitle}>Place an Order</h1>
            <p className={styles.heroSubtitle}>Fresh from our garden in Dexter, MI</p>
          </div>
        </div>
        <ul className={styles.highlights}>
          <li>Grown without synthetic fertilizers or pesticides</li>
          <li>Home delivery or garden pickup</li>
          <li>Secure checkout with Stripe</li>
        </ul>
      </header>

      {canceled && (
        <div className={styles.notice} role="status">
          Checkout was canceled and you haven't been charged. Your order is saved below, so you can pick up where
          you left off.
        </div>
      )}

      <form className={styles.layout} onSubmit={handleSubmit} noValidate>
        <div className={styles.mainColumn}>
          {/* ── Step 1: Products ─────────────────────────────────── */}
          <section className={styles.step}>
            <h2 className={styles.stepTitle}>
              <span className={styles.stepNumber}>1</span> Choose your produce
            </h2>
            <p className={styles.stepIntro}>
              Fall storage crops, sold in bulk so you can stock up for the season. Mix and match sizes and
              quantities.
            </p>
            <div className={styles.productGrid}>
              {PRODUCTS.map((product) => {
                const { stock, remaining, soldOut, overLimit } = stockInfo(product);
                return (
                <article
                  key={product.id}
                  className={`${styles.productCard} ${soldOut ? styles.soldOut : ""}`}
                >
                  <div className={styles.imageWrap}>
                    <ProductImage src={product.image} alt={product.name} />
                    {soldOut && <span className={styles.soldOutBadge}>Sold out</span>}
                  </div>
                  <div className={styles.productBody}>
                    <h3 className={styles.productName}>{product.name}</h3>
                    {product.tagline && <p className={styles.productTagline}>{product.tagline}</p>}
                    {!soldOut && Number.isFinite(stock) && (
                      <p className={`${styles.stockLevel} ${stock <= LOW_STOCK_POUNDS ? styles.stockLow : ""}`}>
                        {stock <= LOW_STOCK_POUNDS ? `Only ${stock} lb left` : "In stock"}
                      </p>
                    )}
                    <p className={styles.productDescription}>{product.description}</p>
                    {overLimit && (
                      <p className={styles.stockWarning} role="alert">
                        {stock > 0
                          ? `Only ${stock} lb available. Please reduce your quantity.`
                          : "This just sold out. Please remove it from your order."}
                      </p>
                    )}
                    <ul className={styles.sizeList}>
                      {product.sizes.map((size) => {
                        const qty = quantities[`${product.id}:${size.id}`] || 0;
                        return (
                          <li key={size.id} className={`${styles.sizeRow} ${qty > 0 ? styles.sizeRowActive : ""}`}>
                            <div className={styles.sizeInfo}>
                              <span className={styles.sizeLabel}>
                                {size.label}
                                {size.badge && <span className={styles.badge}>{size.badge}</span>}
                              </span>
                              <span className={styles.sizePrice}>
                                {formatPrice(size.price)}
                                <span className={styles.perPound}>{pricePerPound(size)}</span>
                              </span>
                            </div>
                            <QuantityStepper
                              value={qty}
                              label={`${size.label} ${product.name}`}
                              disabled={!product.available}
                              canIncrease={size.pounds <= remaining}
                              onChange={(v) => setQty(product.id, size.id, v)}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </article>
                );
              })}
            </div>
          </section>

          {/* ── Step 2: Delivery or pickup ──────────────────────── */}
          <section className={styles.step}>
            <h2 className={styles.stepTitle}>
              <span className={styles.stepNumber}>2</span> Delivery or pickup
            </h2>
            {openOptions.length === 0 ? (
              <p className={styles.closedMessage}>
                Ordering is closed for now. Check back soon for the next delivery and pickup dates, or reach out at{" "}
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
              </p>
            ) : (
              <div className={styles.fulfillmentGrid} role="radiogroup" aria-label="Delivery or pickup">
                {openOptions.map((option) => {
                  const selected = option.id === fulfillmentId;
                  return (
                    <label
                      key={option.id}
                      className={`${styles.fulfillmentCard} ${selected ? styles.fulfillmentSelected : ""}`}
                    >
                      <input
                        type="radio"
                        name="fulfillment"
                        value={option.id}
                        checked={selected}
                        onChange={() => setFulfillmentId(option.id)}
                      />
                      <img src={selected ? option.icon : option.iconInactive} alt="" width="64" height="64" />
                      <span className={styles.fulfillmentTitle}>{option.title}</span>
                      <span className={styles.fulfillmentDate}>{option.dateLabel}</span>
                      <span className={styles.fulfillmentTime}>{option.timeLabel}</span>
                      <span className={styles.fulfillmentFee}>{feeLabel(option)}</span>
                      {option.method === "delivery" && Object.keys(DELIVERY_ZIP_CODES).length > 0 && (
                        <span className={styles.fulfillmentArea}>{DELIVERY_AREA_NOTE}</span>
                      )}
                      <span className={styles.fulfillmentCutoff}>{option.cutoffLabel}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── Step 3: Details ─────────────────────────────────── */}
          <section className={styles.step}>
            <h2 className={styles.stepTitle}>
              <span className={styles.stepNumber}>3</span> Your details
            </h2>
            <div className="row g-3">
              <div className="col-sm-6">
                <label className={styles.fieldLabel} htmlFor="firstName">First name</label>
                <input
                  id="firstName"
                  className="form-control"
                  autoComplete="given-name"
                  value={customer.firstName}
                  onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })}
                />
              </div>
              <div className="col-sm-6">
                <label className={styles.fieldLabel} htmlFor="lastName">Last name</label>
                <input
                  id="lastName"
                  className="form-control"
                  autoComplete="family-name"
                  value={customer.lastName}
                  onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })}
                />
              </div>
              <div className="col-sm-7">
                <label className={styles.fieldLabel} htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  autoComplete="email"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                />
              </div>
              <div className="col-sm-5">
                <label className={styles.fieldLabel} htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  className="form-control"
                  autoComplete="tel"
                  placeholder="(734) 555-0123"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: formatPhone(e.target.value) })}
                />
              </div>
            </div>

            {isDelivery && (
              <div className={styles.addressBlock}>
                <h3 className={styles.subheading}>Delivery address</h3>
                <p className={styles.helpText}>
                  {DELIVERY_AREA_NOTE}
                  {Object.keys(DELIVERY_ZIP_CODES).length > 0 &&
                    ` Delivery ZIP codes: ${Object.keys(DELIVERY_ZIP_CODES).join(", ")}.`}
                </p>
                <div className="row g-3">
                  <div className="col-sm-8">
                    <label className={styles.fieldLabel} htmlFor="street">Street address</label>
                    <input
                      id="street"
                      className="form-control"
                      autoComplete="address-line1"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    />
                  </div>
                  <div className="col-sm-4">
                    <label className={styles.fieldLabel} htmlFor="unit">Apt / unit <span className={styles.optional}>(optional)</span></label>
                    <input
                      id="unit"
                      className="form-control"
                      autoComplete="address-line2"
                      value={address.unit}
                      onChange={(e) => setAddress({ ...address, unit: e.target.value })}
                    />
                  </div>
                  <div className="col-7 col-sm-8">
                    <label className={styles.fieldLabel} htmlFor="city">City</label>
                    <input
                      id="city"
                      className="form-control"
                      autoComplete="address-level2"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    />
                  </div>
                  <div className="col-5 col-sm-4">
                    <label className={styles.fieldLabel} htmlFor="zipCode">ZIP code</label>
                    <input
                      id="zipCode"
                      className={`form-control ${zipOutOfArea ? "is-invalid" : ""}`}
                      inputMode="numeric"
                      autoComplete="postal-code"
                      maxLength={5}
                      value={address.zipCode}
                      aria-describedby={zipOutOfArea ? "zipError" : undefined}
                      onChange={(e) => setAddress({ ...address, zipCode: e.target.value.replace(/\D/g, "") })}
                    />
                  </div>
                </div>
                {zipOutOfArea && (
                  <div id="zipError" className={styles.stockWarning} role="alert" style={{ marginTop: 12 }}>
                    Sorry, we don't deliver to {address.zipCode} yet.{" "}
                    {openOptions.some((o) => o.method === "pickup") && (
                      <>
                        You're welcome to{" "}
                        <button
                          type="button"
                          className={styles.inlineLinkBtn}
                          onClick={() => setFulfillmentId(openOptions.find((o) => o.method === "pickup").id)}
                        >
                          switch to garden pickup
                        </button>{" "}
                        instead.
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className={styles.notesBlock}>
              <label className={styles.fieldLabel} htmlFor="notes">
                Order notes <span className={styles.optional}>(optional)</span>
              </label>
              <textarea
                id="notes"
                className="form-control"
                rows={3}
                maxLength={1000}
                placeholder={isDelivery ? "Where should we leave your order? Gate codes, etc." : "Anything we should know?"}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </section>
        </div>

        {/* ── Order summary ───────────────────────────────────────── */}
        <aside className={styles.summaryColumn}>
          <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>Your Order</h2>
            {lineItems.length === 0 ? (
              <p className={styles.emptyCart}>No items yet. Choose a size and quantity to get started.</p>
            ) : (
              <ul className={styles.summaryItems}>
                {lineItems.map((line) => (
                  <li key={line.key}>
                    <div>
                      <span className={styles.summaryItemName}>{line.product.name}</span>
                      <span className={styles.summaryItemMeta}>
                        {line.size.label} × {line.quantity}
                      </span>
                    </div>
                    <div className={styles.summaryItemRight}>
                      <span>{formatPrice(line.total)}</span>
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => setQty(line.productId, line.sizeId, 0)}
                        aria-label={`Remove ${line.size.label} ${line.product.name}`}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <dl className={styles.totals}>
              <div>
                <dt>Subtotal{totalPounds > 0 && <span className={styles.summaryItemMeta}> ({totalPounds} lb)</span>}</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div>
                <dt>{selectedOption ? selectedOption.title : "Delivery / pickup"}</dt>
                <dd>
                  {!selectedOption ? (
                    "—"
                  ) : fee ? (
                    formatPrice(fee)
                  ) : selectedOption.fee ? (
                    <>
                      <s className={styles.summaryItemMeta}>{formatPrice(selectedOption.fee)}</s> Free
                    </>
                  ) : (
                    "Free"
                  )}
                </dd>
              </div>
              {amountToFreeDelivery > 0 && (
                <div className={styles.freeDeliveryNudge}>
                  <dt>Add {formatPrice(amountToFreeDelivery)} more for free delivery</dt>
                </div>
              )}
              {selectedOption && (
                <div className={styles.summaryDate}>
                  <dt>{selectedOption.dateLabel}</dt>
                </div>
              )}
              <div className={styles.grandTotal}>
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>

            {error && (
              <div className={styles.error} role="alert">
                {error}
              </div>
            )}

            <button type="submit" className={`btn btn-dark ${styles.checkoutBtn}`} disabled={!canSubmit}>
              {submitting ? "Redirecting to payment…" : `Continue to Payment${total ? ` · ${formatPrice(total)}` : ""}`}
            </button>
            {missing.length > 0 && !submitting && (
              <p className={styles.missingHint}>To continue, please {missing.join(", ")}.</p>
            )}
            <p className={styles.secureNote}>
              🔒 Payments are processed securely by Stripe. We never see or store your card details.
            </p>
          </div>
        </aside>
      </form>

      {/* ── Good to know ──────────────────────────────────────────── */}
      <section className={styles.infoSection}>
        <h2 className={styles.sectionTitle}>What to Know</h2>
        <div className={styles.infoGrid}>
          <div>
            <h3>Delivery</h3>
            <p>
              Deliveries go out in the afternoon on the scheduled day. You don't need to be home. We'll leave your
              order at your front door and send a text when it arrives.
            </p>
          </div>
          <div>
            <h3>Garden Pickup</h3>
            <p>
              Pick up at the garden (5185 Zeeb Rd, just north of Daly Rd) during the pickup window. Your order will be
              bagged and labeled with your name. Can't make it? Let us know and we'll work something out.{" "}
              <a href={PICKUP_MAP_IMAGE} target="_blank" rel="noopener noreferrer">
                View the pickup map
              </a>
            </p>
          </div>
          <div>
            <h3>Storage Tips</h3>
            <p>
              Optimal storage for root vegetables is cold, but above freezing and humid. Onions like it cold and dry. Sweet Potatoes prefer it 55-60 degrees and humid and never in the fridge.
            </p>
          </div>
          <div>
            <h3>Changes &amp; Refunds</h3>
            <p>
              Need to change or cancel? Email us before the order cutoff for a full refund.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.contact}>
        <h2 className={styles.sectionTitle}>Questions?</h2>
        <p>
          Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or call/text{" "}
          <a href={`tel:${CONTACT_PHONE.replace(/\D/g, "")}`}>{CONTACT_PHONE}</a>.
        </p>
      </section>
    </div>
  );
}

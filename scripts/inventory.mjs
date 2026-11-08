// Manage the Firestore Inventory collection from the command line.
//
//   npm run inventory                      Show stock for every product
//   npm run inventory -- sync              Create missing Inventory docs (at 0 lb) for new products
//   npm run inventory -- set onions 300    Set a product's stock to exactly 300 lb
//   npm run inventory -- add onions 50     Add 50 lb (restock). Use a negative number to remove.
//
// Products come from src/lib/orderConfig.js. Credentials come from .env.local.

import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(root, "package.json"));
require("@next/env").loadEnvConfig(root, true, { info: () => {}, error: console.error });

const { FieldValue } = await import("firebase-admin/firestore");
const { getAdminDb } = await import("../src/lib/server/firebaseAdmin.js");
const { PRODUCTS, INVENTORY_COLLECTION, LOW_STOCK_POUNDS } = await import("../src/lib/orderConfig.js");

const db = getAdminDb();
const col = db.collection(INVENTORY_COLLECTION);
const [command = "list", productId, amountArg] = process.argv.slice(2);

function requireProduct(id) {
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) {
    console.error(`Unknown product "${id ?? ""}". Products in orderConfig.js:\n  ${PRODUCTS.map((p) => p.id).join("\n  ")}`);
    process.exit(1);
  }
  return product;
}

function requireAmount(arg, { allowNegative }) {
  const n = Number(arg);
  if (arg === undefined || !Number.isFinite(n) || (!allowNegative && n < 0)) {
    console.error(`Please give a ${allowNegative ? "" : "non-negative "}number of pounds, e.g. "npm run inventory -- ${command} ${productId ?? "onions"} 100"`);
    process.exit(1);
  }
  return n;
}

async function list() {
  const snaps = await db.getAll(...PRODUCTS.map((p) => col.doc(p.id)));
  console.log(`\n${"Product".padEnd(26)}${"Stock".padStart(10)}   Status`);
  console.log("─".repeat(60));
  snaps.forEach((snap, i) => {
    const p = PRODUCTS[i];
    const lbs = snap.exists ? Number(snap.get("poundsAvailable")) || 0 : null;
    const status =
      lbs === null ? "No Inventory doc (shows Sold out). Run: npm run inventory -- sync"
      : !p.available ? "Hidden as sold out (available: false in orderConfig.js)"
      : lbs < Math.min(...p.sizes.map((s) => s.pounds)) ? "Sold out"
      : lbs <= LOW_STOCK_POUNDS ? "Low stock"
      : "In stock";
    console.log(`${p.id.padEnd(26)}${(lbs === null ? "—" : `${lbs} lb`).padStart(10)}   ${status}`);
  });

  const known = new Set(PRODUCTS.map((p) => p.id));
  const orphans = (await col.listDocuments()).filter((d) => !known.has(d.id));
  if (orphans.length) {
    console.log(`\nIn Firestore but not in orderConfig.js (ignored by the site): ${orphans.map((d) => d.id).join(", ")}`);
  }
  console.log();
}

async function sync() {
  const snaps = await db.getAll(...PRODUCTS.map((p) => col.doc(p.id)));
  const missing = PRODUCTS.filter((_, i) => !snaps[i].exists);
  if (!missing.length) {
    console.log("All products already have Inventory docs.");
  } else {
    const batch = db.batch();
    for (const p of missing) {
      batch.create(col.doc(p.id), { name: p.name, poundsAvailable: 0, updatedAt: FieldValue.serverTimestamp() });
    }
    await batch.commit();
    console.log(`Created ${missing.map((p) => p.id).join(", ")} at 0 lb. Set stock with: npm run inventory -- set <product> <lb>`);
  }
  await list();
}

async function set() {
  const p = requireProduct(productId);
  const lbs = requireAmount(amountArg, { allowNegative: false });
  await col.doc(p.id).set({ name: p.name, poundsAvailable: lbs, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  console.log(`${p.name}: set to ${lbs} lb.`);
  await list();
}

async function add() {
  const p = requireProduct(productId);
  const lbs = requireAmount(amountArg, { allowNegative: true });
  // increment() is safe even while customers are checking out.
  await col.doc(p.id).set(
    { name: p.name, poundsAvailable: FieldValue.increment(lbs), updatedAt: FieldValue.serverTimestamp() },
    { merge: true }
  );
  console.log(`${p.name}: ${lbs >= 0 ? "added" : "removed"} ${Math.abs(lbs)} lb.`);
  await list();
}

const commands = { list, sync, set, add };
if (!commands[command]) {
  console.error(`Unknown command "${command}". Use: list, sync, set, or add.`);
  process.exit(1);
}
await commands[command]();
process.exit(0);

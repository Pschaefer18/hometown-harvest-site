// Server-only Firestore access using the Firebase Admin SDK.
// The Admin SDK bypasses security rules, which lets the Orders collection be
// locked down completely to the public while the server can still write to it.
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp() {
  if (getApps().length) return getApps()[0];

  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    throw new Error(
      "Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY (see ORDERING_SETUP.md)."
    );
  }

  // Tolerate values pasted with surrounding quotes or a trailing comma (e.g. copied
  // from the JSON file or into Vercel's dashboard, which stores values verbatim).
  const tidy = (v) => v.trim().replace(/,$/, "").replace(/^"(.*)"$/s, "$1");

  return initializeApp({
    credential: cert({
      projectId: tidy(FIREBASE_PROJECT_ID),
      clientEmail: tidy(FIREBASE_CLIENT_EMAIL),
      // Env vars store the key's line breaks as literal "\n"; restore them.
      privateKey: tidy(FIREBASE_PRIVATE_KEY).replace(/\\n/g, "\n"),
    }),
  });
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

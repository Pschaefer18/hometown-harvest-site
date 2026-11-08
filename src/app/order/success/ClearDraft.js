"use client";

import { useEffect } from "react";
import { DRAFT_STORAGE_KEY } from "../OrderForm";

// Clears the saved cart once an order is paid so the next visit starts fresh.
export default function ClearDraft({ enabled }) {
  useEffect(() => {
    if (enabled) localStorage.removeItem(DRAFT_STORAGE_KEY);
  }, [enabled]);
  return null;
}

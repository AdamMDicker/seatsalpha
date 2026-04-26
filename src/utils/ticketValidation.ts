import { z } from "zod";

/**
 * Validates a ticket quantity update against business rules:
 *  - Must be a positive integer (1–10000)
 *  - Cannot drop below quantity_sold (would create negative availability / oversell)
 *  - Cannot exceed a sane upper bound (10000)
 *
 * Returns { ok: true, quantity } on success or { ok: false, error } with a
 * user-friendly message on failure.
 */
export const ticketQuantitySchema = z
  .number({ invalid_type_error: "Quantity must be a number" })
  .int({ message: "Quantity must be a whole number" })
  .min(1, { message: "Quantity must be at least 1" })
  .max(10000, { message: "Quantity cannot exceed 10,000" });

export const ticketPriceSchema = z
  .number({ invalid_type_error: "Price must be a number" })
  .positive({ message: "Price must be greater than 0" })
  .max(100000, { message: "Price cannot exceed $100,000" });

export const ticketSectionSchema = z
  .string()
  .trim()
  .min(1, { message: "Section is required" })
  .max(50, { message: "Section must be 50 characters or fewer" });

export type QuantityValidationResult =
  | { ok: true; quantity: number; error?: undefined }
  | { ok: false; quantity?: undefined; error: string };

export function validateTicketQuantityUpdate(params: {
  rawQuantity: string | number;
  currentQuantitySold: number;
}): QuantityValidationResult {
  const num =
    typeof params.rawQuantity === "number"
      ? params.rawQuantity
      : Number(params.rawQuantity);

  const parsed = ticketQuantitySchema.safeParse(num);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid quantity" };
  }

  if (parsed.data < params.currentQuantitySold) {
    return {
      ok: false,
      error: `Quantity cannot be lower than tickets already sold (${params.currentQuantitySold}). Refund or release sold seats first.`,
    };
  }

  return { ok: true, quantity: parsed.data };
}

export type PriceValidationResult =
  | { ok: true; price: number; error?: undefined }
  | { ok: false; price?: undefined; error: string };

export function validateTicketPrice(rawPrice: string | number): PriceValidationResult {
  const num = typeof rawPrice === "number" ? rawPrice : Number(rawPrice);
  const parsed = ticketPriceSchema.safeParse(num);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid price" };
  }
  return { ok: true, price: parsed.data };
}

export type SectionValidationResult =
  | { ok: true; section: string; error?: undefined }
  | { ok: false; section?: undefined; error: string };

export function validateTicketSection(rawSection: string): SectionValidationResult {
  const parsed = ticketSectionSchema.safeParse(rawSection);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid section" };
  }
  return { ok: true, section: parsed.data };
}

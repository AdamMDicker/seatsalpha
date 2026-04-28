// Centralized pricing configuration for seats.ca.
// Update values here to roll out price changes across the entire UI.

export const MEMBERSHIP_PRICE = 59.99;
export const MEMBERSHIP_PRICE_ORIGINAL = 99.99;
export const MEMBERSHIP_DISCOUNT_PCT = 40;

export const SELLER_SIGNUP_PRICE = 99.99;
export const SELLER_SIGNUP_PRICE_ORIGINAL = 199.99;
export const SELLER_SIGNUP_DISCOUNT_PCT = 50;

// Credit awarded to a seller when a buyer adds the membership upgrade
// at checkout while purchasing one of the seller's tickets.
export const SELLER_MEMBERSHIP_REFERRAL_BONUS = 20;

export const formatPrice = (amount: number) =>
  `$${amount.toFixed(2)}`;

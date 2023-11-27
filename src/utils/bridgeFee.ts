import { Decimal } from "decimal.js";

export const BRIDGE_MIN = new Decimal(100);
export const BRIDGE_MAX = new Decimal(50000);
export const BASE_RATE = new Decimal(0.01);
export const SURCHARGE_RATE = new Decimal(0.02);
export const FIXED_THRESHOLD = new Decimal(1000);
export const SURCHARGE_THRESHOLD = new Decimal(10000);

export const base = (amount: Decimal) => {
  if (amount.lt(FIXED_THRESHOLD)) return new Decimal(10);
  return amount.mul(BASE_RATE);
};
export const surcharge = (amount: Decimal) => {
  if (amount.lte(SURCHARGE_THRESHOLD)) return new Decimal(0);
  return amount.minus(SURCHARGE_THRESHOLD).mul(SURCHARGE_RATE);
};
export const totalFee = (amount: Decimal) =>
  base(amount).plus(surcharge(amount));

export const NCGtoWNCG = (amount: Decimal) =>
  amount.minus(totalFee(amount)).toDecimalPlaces(2);

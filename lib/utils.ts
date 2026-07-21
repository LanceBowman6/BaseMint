import { clsx, type ClassValue } from "clsx";
import { isAddress } from "viem";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function shortAddress(address?: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatNumber(value?: bigint | number) {
  if (typeof value === "bigint") return new Intl.NumberFormat("en-US").format(value);
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

export function normalizeRef(ref: string | null, currentWallet?: string) {
  if (!ref || !isAddress(ref)) return undefined;
  if (currentWallet && ref.toLowerCase() === currentWallet.toLowerCase()) return undefined;
  return ref as `0x${string}`;
}

export function todayChainDay() {
  return BigInt(Math.floor(Date.now() / 1000 / 86_400));
}

export const APP_NAME = "BaseMint";
export const BASE_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 8453);
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ??
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const DAILY_POINTS = 10;
export const INVITER_POINTS = 20;
export const INVITEE_POINTS = 10;
export const MAX_SUPPLY = 100_000;

export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

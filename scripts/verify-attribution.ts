import "dotenv/config";
import { Attribution } from "ox/erc8021";
import { createPublicClient, http, isHex } from "viem";
import { base } from "viem/chains";

const hash = process.argv[2];
const builderCode = process.env.NEXT_PUBLIC_BUILDER_CODE?.trim();

if (!hash || !isHex(hash)) {
  throw new Error("Usage: npx tsx scripts/verify-attribution.ts <transactionHash>");
}

if (!builderCode) {
  throw new Error("NEXT_PUBLIC_BUILDER_CODE is required.");
}

const client = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL),
});

const tx = await client.getTransaction({ hash });
const suffix = Attribution.toDataSuffix({ codes: [builderCode] });
const hasAttribution = tx.input.toLowerCase().endsWith(suffix.toLowerCase().slice(2));

console.log({
  hash,
  to: tx.to,
  inputLength: tx.input.length,
  builderCode,
  suffix,
  hasAttribution,
});

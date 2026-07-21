import { kv } from "@vercel/kv";

import { todayKey } from "@/lib/constants";

export type OwnedNft = {
  tokenId: string;
  image: string;
  mintedAt: string;
  txHash: string;
};

export type UserRecord = {
  wallet: string;
  mintCount: number;
  rewardPoints: number;
  referral?: string;
  dailyClaim?: string;
  streak: number;
  ownedNfts: OwnedNft[];
  createdAt: string;
  updatedAt: string;
};

const memoryStore = new Map<string, UserRecord>();

const hasKv = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

function key(wallet: string) {
  return `basemint:user:${wallet.toLowerCase()}`;
}

function emptyRecord(wallet: string): UserRecord {
  const now = new Date().toISOString();
  return {
    wallet: wallet.toLowerCase(),
    mintCount: 0,
    rewardPoints: 0,
    streak: 0,
    ownedNfts: [],
    createdAt: now,
    updatedAt: now,
  };
}

export async function getUser(wallet: string) {
  const storageKey = key(wallet);
  if (hasKv) {
    const stored = await kv.get<UserRecord>(storageKey);
    return stored ?? emptyRecord(wallet);
  }

  return memoryStore.get(storageKey) ?? emptyRecord(wallet);
}

export async function saveUser(user: UserRecord) {
  const next = { ...user, updatedAt: new Date().toISOString() };
  if (hasKv) {
    await kv.set(key(user.wallet), next);
    return next;
  }

  memoryStore.set(key(user.wallet), next);
  return next;
}

export async function recordMint(params: {
  wallet: string;
  tokenId: string;
  txHash: string;
  referrer?: string;
}) {
  const user = await getUser(params.wallet);
  const firstReferral = !user.referral && params.referrer;
  const alreadyClaimedToday = user.dailyClaim === todayKey();

  const imageId = Number(BigInt(params.tokenId) % 6n) + 1;
  const ownedNft: OwnedNft = {
    tokenId: params.tokenId,
    txHash: params.txHash,
    mintedAt: new Date().toISOString(),
    image: `/nft-${imageId}.svg`,
  };

  const next: UserRecord = {
    ...user,
    referral: firstReferral ? params.referrer?.toLowerCase() : user.referral,
    dailyClaim: todayKey(),
    mintCount: user.mintCount + (alreadyClaimedToday ? 0 : 1),
    rewardPoints: user.rewardPoints + (firstReferral ? 20 : 10),
    streak: alreadyClaimedToday ? user.streak : user.streak + 1,
    ownedNfts: [ownedNft, ...user.ownedNfts].slice(0, 100),
  };

  await saveUser(next);

  if (firstReferral && params.referrer) {
    const referrer = await getUser(params.referrer);
    await saveUser({
      ...referrer,
      rewardPoints: referrer.rewardPoints + 20,
    });
  }

  return next;
}

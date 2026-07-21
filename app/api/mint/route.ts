import { NextResponse } from "next/server";
import { isAddress, isHash } from "viem";

import { recordMint } from "@/lib/storage";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    wallet?: string;
    tokenId?: string;
    txHash?: string;
    referrer?: string;
  };

  if (!body.wallet || !isAddress(body.wallet)) {
    return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
  }

  if (!body.txHash || !isHash(body.txHash)) {
    return NextResponse.json({ error: "Invalid transaction hash" }, { status: 400 });
  }

  if (!body.tokenId || !/^\d+$/.test(body.tokenId)) {
    return NextResponse.json({ error: "Invalid token id" }, { status: 400 });
  }

  if (body.referrer && !isAddress(body.referrer)) {
    return NextResponse.json({ error: "Invalid referrer" }, { status: 400 });
  }

  const user = await recordMint({
    wallet: body.wallet,
    tokenId: body.tokenId,
    txHash: body.txHash,
    referrer: body.referrer,
  });

  return NextResponse.json(user);
}

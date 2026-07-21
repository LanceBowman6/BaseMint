import { NextResponse } from "next/server";
import { isAddress } from "viem";

import { getUser } from "@/lib/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ address: string }> },
) {
  const { address } = await params;
  if (!isAddress(address)) {
    return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
  }

  const user = await getUser(address);
  return NextResponse.json(user);
}

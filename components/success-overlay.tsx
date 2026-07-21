"use client";

import { CheckCircle2, X } from "lucide-react";

import { shortAddress } from "@/lib/utils";

export function SuccessOverlay({
  image,
  points,
  txHash,
  tokenId,
  onClose,
}: {
  image: string;
  points: number;
  txHash: `0x${string}`;
  tokenId?: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020712]/80 p-4 backdrop-blur">
      <div className="glass relative w-full max-w-sm rounded-lg p-5 text-center shadow-glow">
        <button
          aria-label="Close success"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-2 text-slate-300 hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
          <span className="absolute h-full w-full rounded-full bg-base-blue/40 animate-pulseRing" />
          <CheckCircle2 className="relative h-14 w-14 text-cyan-200" />
        </div>
        <img src={image} alt="Minted BaseMint NFT" className="mx-auto mt-4 aspect-square w-44 rounded-lg border border-cyan-200/20 animate-float" />
        <h2 className="mt-4 text-2xl font-black">Mint Successful</h2>
        <p className="mt-1 text-sm text-slate-300">BaseMint #{tokenId ?? "new"} added to your collection</p>
        <div className="mt-4 rounded-lg border border-cyan-200/15 bg-white/[0.04] p-3">
          <p className="text-sm font-bold text-cyan-100">+{points} reward points</p>
          <p className="mt-1 text-xs text-slate-400">Tx {shortAddress(txHash)}</p>
        </div>
      </div>
    </div>
  );
}

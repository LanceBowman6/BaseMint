"use client";

import { Suspense, useMemo, useState } from "react";
import {
  Gift,
  Home,
  ImageIcon,
  Loader2,
  Medal,
  Share2,
  Sparkles,
  User,
  Wallet,
} from "lucide-react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContracts,
  useSendTransaction,
} from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { concatHex, encodeFunctionData, isAddress } from "viem";
import { useSearchParams } from "next/navigation";

import { baseMintAbi } from "@/lib/abi";
import {
  CONTRACT_ADDRESS,
  DAILY_POINTS,
  INVITEE_POINTS,
  MAX_SUPPLY,
  ZERO_ADDRESS,
} from "@/lib/constants";
import { formatNumber, normalizeRef, shortAddress, todayChainDay } from "@/lib/utils";
import { BottomNav } from "@/components/bottom-nav";
import { Panel } from "@/components/panel";
import { Stat } from "@/components/stat";
import { SuccessOverlay } from "@/components/success-overlay";
import { useUserRecord } from "@/components/use-user-record";
import { builderDataSuffix, wagmiConfig } from "@/lib/wagmi";

const views = [
  { id: "home", label: "Home", icon: Home },
  { id: "collection", label: "My Collection", icon: ImageIcon },
  { id: "rewards", label: "Rewards", icon: Medal },
  { id: "invite", label: "Invite", icon: Share2 },
  { id: "profile", label: "Profile", icon: User },
] as const;

type ViewId = (typeof views)[number]["id"];

const walletLabels = new Map([
  ["base account", "Base App"],
  ["baseaccount", "Base App"],
  ["base", "Base App"],
  ["coinbase wallet", "Coinbase Wallet"],
  ["coinbase wallet sdk", "Coinbase Wallet"],
  ["coinbasewalletsdk", "Coinbase Wallet"],
  ["coinbasewallet", "Coinbase Wallet"],
  ["coinbase", "Coinbase Wallet"],
  ["metamask", "MetaMask"],
  ["okxwallet", "OKX Wallet"],
  ["okx wallet", "OKX Wallet"],
]);

export default function Page() {
  return (
    <Suspense fallback={<main className="mx-auto min-h-screen w-full max-w-md px-4 pt-6 text-white">Loading BaseMint...</main>}>
      <HomePage />
    </Suspense>
  );
}

function HomePage() {
  const [activeView, setActiveView] = useState<ViewId>("home");
  const [success, setSuccess] = useState<{
    txHash: `0x${string}`;
    image: string;
    tokenId?: string;
    points: number;
  }>();
  const [isConfirming, setIsConfirming] = useState(false);
  const [walletError, setWalletError] = useState<string>();

  const searchParams = useSearchParams();
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { sendTransactionAsync, isPending: isWriting } = useSendTransaction();
  const user = useUserRecord(address);

  const referrer = normalizeRef(searchParams.get("ref"), address);
  const contractReady = CONTRACT_ADDRESS !== ZERO_ADDRESS && isAddress(CONTRACT_ADDRESS);
  const walletConnectors = connectors
    .map((connector) => {
      const normalizedName = connector.name.toLowerCase();
      const normalizedId = connector.id.toLowerCase();
      const label = walletLabels.get(normalizedName) ?? walletLabels.get(normalizedId);
      return label ? { connector, label } : undefined;
    })
    .filter((item): item is { connector: (typeof connectors)[number]; label: string } => Boolean(item))
    .filter(
      (item, index, list) =>
        list.findIndex((candidate) => candidate.label === item.label) === index,
    );

  const { data: reads, refetch } = useReadContracts({
    contracts: [
      { address: CONTRACT_ADDRESS, abi: baseMintAbi, functionName: "remainingSupply" },
      { address: CONTRACT_ADDRESS, abi: baseMintAbi, functionName: "totalSupply" },
      {
        address: CONTRACT_ADDRESS,
        abi: baseMintAbi,
        functionName: "rewardPoints",
        args: [address ?? ZERO_ADDRESS],
      },
      {
        address: CONTRACT_ADDRESS,
        abi: baseMintAbi,
        functionName: "walletMintCount",
        args: [address ?? ZERO_ADDRESS],
      },
      {
        address: CONTRACT_ADDRESS,
        abi: baseMintAbi,
        functionName: "lastMintDay",
        args: [address ?? ZERO_ADDRESS],
      },
      {
        address: CONTRACT_ADDRESS,
        abi: baseMintAbi,
        functionName: "mintStreak",
        args: [address ?? ZERO_ADDRESS],
      },
    ],
    query: { enabled: contractReady && Boolean(address) },
  });

  const remainingSupply = (reads?.[0].result as bigint | undefined) ?? BigInt(MAX_SUPPLY);
  const totalMinted = (reads?.[1].result as bigint | undefined) ?? 0n;
  const chainPoints = (reads?.[2].result as bigint | undefined) ?? 0n;
  const chainMintCount = (reads?.[3].result as bigint | undefined) ?? 0n;
  const lastMintDay = (reads?.[4].result as bigint | undefined) ?? 0n;
  const streak = (reads?.[5].result as bigint | undefined) ?? BigInt(user.data?.streak ?? 0);
  const mintedToday = lastMintDay >= todayChainDay();

  const nftImage = useMemo(() => {
    const nextId = Number((totalMinted + 1n) % 6n) + 1;
    return `/nft-${nextId}.svg`;
  }, [totalMinted]);

  async function handleMint() {
    if (!address || !contractReady) return;

    setIsConfirming(true);
    try {
      const functionName = referrer ? "dailyMint" : "mint";
      const callData = encodeFunctionData({
        abi: baseMintAbi,
        functionName,
        args: referrer ? [referrer] : undefined,
      });
      const data = builderDataSuffix ? concatHex([callData, builderDataSuffix]) : callData;
      const hash = await sendTransactionAsync({
        to: CONTRACT_ADDRESS,
        data,
      });

      const receiptResult = await waitForTransactionReceipt(wagmiConfig, { hash });
      if (receiptResult.status !== "success") {
        throw new Error("Mint transaction was not confirmed successfully.");
      }

      const nextTokenId = totalMinted.toString();
      const points = referrer ? DAILY_POINTS + INVITEE_POINTS : DAILY_POINTS;
      await fetch("/api/mint", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          wallet: address,
          tokenId: nextTokenId,
          txHash: hash,
          referrer,
        }),
      });

      setSuccess({ txHash: hash, image: nftImage, tokenId: nextTokenId, points });
      await Promise.all([refetch(), user.refetch()]);
    } finally {
      setIsConfirming(false);
    }
  }

  async function handleConnect(connector: (typeof connectors)[number]) {
    setWalletError(undefined);

    try {
      await connect({ connector });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Wallet connection failed.";
      setWalletError(
        message.toLowerCase().includes("provider")
          ? `${connector.name} is not available in this browser.`
          : message,
      );
    }
  }

  const primaryDisabled = !contractReady || !isConnected || mintedToday || isWriting;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-32 pt-4 sm:max-w-2xl">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
            Daily Base NFT
          </p>
          <h1 className="mt-1 text-3xl font-black text-white">BaseMint</h1>
        </div>
        {isConnected ? (
          <button
            className="rounded-full border border-cyan-300/25 px-3 py-2 text-xs font-bold text-cyan-100"
            onClick={() => disconnect()}
          >
            {shortAddress(address)}
          </button>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-base-blue">
            <Wallet className="h-5 w-5" />
          </div>
        )}
      </header>

      <section className="mt-5">
        {activeView === "home" && (
          <div className="space-y-4">
            <Panel className="overflow-hidden p-3 sm:p-4">
              <div className="relative mx-auto aspect-square max-w-[14rem] overflow-hidden rounded-lg border border-cyan-200/20 bg-[#081828] shadow-glow sm:max-w-[18rem]">
                <img src={nftImage} alt="BaseMint daily NFT preview" className="h-full w-full" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <p className="text-sm font-bold text-cyan-100">Today&apos;s collectible</p>
                  <p className="text-xs text-slate-300">Mint refreshes every UTC day</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3">
                <Stat label="Remaining Supply" value={formatNumber(remainingSupply)} />
                <Stat label="Total Minted" value={formatNumber(totalMinted)} />
                <Stat label="Reward Points" value={formatNumber(chainPoints || BigInt(user.data?.rewardPoints ?? 0))} />
                <Stat label="Daily Status" value={mintedToday ? "Claimed" : "Ready"} />
              </div>
            </Panel>

            {!isConnected ? (
              <Panel className="grid grid-cols-3 gap-2 p-3 sm:gap-3 sm:p-4">
                {walletConnectors.map(({ connector, label }) => (
                  <button
                    key={connector.uid}
                    onClick={() => void handleConnect(connector)}
                    className="flex h-16 w-full flex-col items-center justify-center gap-1 rounded-lg border border-cyan-200/15 bg-white/[0.04] px-2 text-center text-[11px] font-bold leading-tight text-white sm:h-14 sm:flex-row sm:justify-between sm:px-4 sm:text-sm"
                  >
                    <span>{label}</span>
                    {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                  </button>
                ))}
                {walletError && (
                  <p className="col-span-3 rounded-lg border border-amber-300/25 bg-amber-300/10 p-2 text-xs text-amber-100">
                    {walletError}
                  </p>
                )}
              </Panel>
            ) : (
              <button
                onClick={handleMint}
                disabled={primaryDisabled}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-base-blue text-base font-black text-white shadow-glow transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-600 disabled:shadow-none"
              >
                {isWriting || isConfirming ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                {mintedToday ? "Mint Available Tomorrow" : "Mint Free NFT"}
              </button>
            )}

            {!contractReady && (
              <p className="rounded-lg border border-amber-300/25 bg-amber-300/10 p-3 text-sm text-amber-100">
                Set `NEXT_PUBLIC_CONTRACT_ADDRESS` after deploying the ERC721A contract.
              </p>
            )}
          </div>
        )}

        {activeView === "collection" && (
          <Panel className="p-4">
            <ViewTitle icon={ImageIcon} title="My Collection" subtitle={`${formatNumber(chainMintCount)} daily NFTs minted`} />
            <div className="mt-4 grid grid-cols-2 gap-3">
              {(user.data?.ownedNfts.length ? user.data.ownedNfts : [{ tokenId: "Next", image: nftImage, txHash: "", mintedAt: "" }]).map((nft) => (
                <div key={`${nft.tokenId}-${nft.txHash}`} className="rounded-lg border border-cyan-200/15 bg-white/[0.04] p-2">
                  <img src={nft.image} alt={`BaseMint NFT ${nft.tokenId}`} className="aspect-square w-full rounded-md" />
                  <p className="mt-2 text-sm font-bold">BaseMint #{nft.tokenId}</p>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {activeView === "rewards" && (
          <Panel className="p-4">
            <ViewTitle icon={Medal} title="Rewards" subtitle="Daily mints and referrals build your score" />
            <div className="mt-4 grid gap-3">
              <Stat label="Total Points" value={formatNumber(chainPoints || BigInt(user.data?.rewardPoints ?? 0))} />
              <Stat label="Mint Streak" value={`${formatNumber(streak)} day${streak === 1n ? "" : "s"}`} />
              <Stat label="Daily Mint Reward" value="+10 points" />
              <Stat label="Referral Bonus" value="+20 inviter / +10 invitee" />
            </div>
          </Panel>
        )}

        {activeView === "invite" && (
          <Panel className="p-4">
            <ViewTitle icon={Share2} title="Invite" subtitle="Share your wallet referral link" />
            <div className="mt-4 rounded-lg border border-cyan-200/15 bg-white/[0.04] p-3 text-sm text-cyan-50">
              {address ? `/?ref=${address}` : "Connect a wallet to generate your invite link."}
            </div>
          </Panel>
        )}

        {activeView === "profile" && (
          <Panel className="p-4">
            <ViewTitle icon={User} title="Profile" subtitle={address ? shortAddress(address) : "Wallet not connected"} />
            <div className="mt-4 grid gap-3">
              <Stat label="Network" value={chainId ? `Base ${chainId}` : "Not connected"} />
              <Stat label="Wallet Mints" value={formatNumber(chainMintCount)} />
              <Stat label="Stored Referral" value={user.data?.referral ? shortAddress(user.data.referral) : "None"} />
              <Stat label="Last Daily Claim" value={user.data?.dailyClaim ?? "None"} />
            </div>
          </Panel>
        )}
      </section>

      <BottomNav items={views} active={activeView} onChange={setActiveView} />
      {success && <SuccessOverlay {...success} onClose={() => setSuccess(undefined)} />}
    </main>
  );
}

function ViewTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Gift;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-base-blue">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-xl font-black">{title}</h2>
        <p className="text-sm text-slate-300">{subtitle}</p>
      </div>
    </div>
  );
}

"use client";

import { QueryClient } from "@tanstack/react-query";
import { createConfig, http } from "wagmi";
import { coinbaseWallet } from "wagmi/connectors/coinbaseWallet";
import { injected } from "wagmi/connectors/injected";
import { metaMask } from "wagmi/connectors/metaMask";
import { base, baseSepolia } from "wagmi/chains";
import { defineChain } from "viem";
import { Attribution } from "ox/erc8021";

import { APP_NAME, BASE_CHAIN_ID } from "@/lib/constants";

const selectedChain =
  BASE_CHAIN_ID === 84532
    ? baseSepolia
    : BASE_CHAIN_ID === 8453
      ? base
      : defineChain({
          id: BASE_CHAIN_ID,
          name: "Custom Base Chain",
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: {
            default: { http: ["https://mainnet.base.org"] },
          },
        });

const builderCode = process.env.NEXT_PUBLIC_BUILDER_CODE;
const dataSuffix = builderCode
  ? Attribution.toDataSuffix({ codes: [builderCode] })
  : undefined;

export const wagmiConfig = createConfig({
  chains: [selectedChain],
  connectors: [
    coinbaseWallet({
      appName: APP_NAME,
    }),
    metaMask(),
    injected({ target: "okxWallet" as "okxWallet" }),
    injected(),
  ],
  transports: {
    [selectedChain.id]: http(),
  },
  ssr: true,
  // ERC-8021 Base Builder Code attribution. Keep writeContract calls under this config.
  dataSuffix,
});

export const queryClient = new QueryClient();

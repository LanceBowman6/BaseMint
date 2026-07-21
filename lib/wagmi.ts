"use client";

import { QueryClient } from "@tanstack/react-query";
import { createConfig, http } from "wagmi";
import { baseAccount } from "wagmi/connectors/baseAccount";
import { coinbaseWallet } from "wagmi/connectors/coinbaseWallet";
import { injected, type InjectedParameters } from "wagmi/connectors/injected";
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

const builderCode = process.env.NEXT_PUBLIC_BUILDER_CODE?.trim();
const dataSuffix = builderCode
  ? Attribution.toDataSuffix({ codes: [builderCode] })
  : undefined;

type OkxTarget = Extract<NonNullable<InjectedParameters["target"]>, { id: string }>;
type OkxProvider = Extract<OkxTarget["provider"], (...args: never[]) => unknown>;
type OkxInjectedProvider = ReturnType<OkxProvider>;
type OkxWindow = Parameters<OkxProvider>[0] &
  typeof globalThis & {
    ethereum?: (OkxInjectedProvider & { providers?: OkxInjectedProvider[] }) | undefined;
    okxWallet?: OkxInjectedProvider | { ethereum?: OkxInjectedProvider };
    okxwallet?: OkxInjectedProvider | { ethereum?: OkxInjectedProvider };
  };

function getOkxProvider(window?: Parameters<OkxProvider>[0]) {
  const okxWindow = window as OkxWindow | undefined;
  const directProvider = okxWindow?.okxwallet ?? okxWindow?.okxWallet;

  if (directProvider && "request" in directProvider) {
    return directProvider;
  }

  if (directProvider && "ethereum" in directProvider) {
    return directProvider.ethereum;
  }

  const ethereum = okxWindow?.ethereum;
  const providers = ethereum?.providers ?? [];
  const provider = providers.find(
    (item) => "isOkxWallet" in item || "isOKExWallet" in item,
  );

  if (provider) {
    return provider;
  }

  if (ethereum && ("isOkxWallet" in ethereum || "isOKExWallet" in ethereum)) {
    return ethereum;
  }

  return undefined;
}

export const wagmiConfig = createConfig({
  chains: [selectedChain],
  connectors: [
    baseAccount({
      appName: APP_NAME,
    }),
    coinbaseWallet({
      appName: APP_NAME,
    }),
    metaMask(),
    injected({
      target: {
        id: "okxWallet",
        name: "OKX Wallet",
        provider: getOkxProvider,
      },
      unstable_shimAsyncInject: 1_000,
    }),
  ],
  transports: {
    [selectedChain.id]: http(),
  },
  ssr: true,
  // ERC-8021 Base Builder Code attribution. Keep writeContract calls under this config.
  dataSuffix,
});

export const queryClient = new QueryClient();

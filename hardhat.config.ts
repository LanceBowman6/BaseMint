import { config as loadEnv } from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import hardhatToolboxViem from "@nomicfoundation/hardhat-toolbox-viem";

loadEnv({ path: ".env.local" });
loadEnv();

const deployerKey = process.env.DEPLOYER_PRIVATE_KEY;
const accounts = deployerKey ? [deployerKey] : [];

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViem],
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 500,
      },
    },
  },
  networks: {
    base: {
      type: "http",
      url: process.env.BASE_RPC_URL ?? "https://mainnet.base.org",
      accounts,
      chainId: 8453,
    },
    baseSepolia: {
      type: "http",
      url: process.env.BASE_SEPOLIA_RPC_URL ?? "https://sepolia.base.org",
      accounts,
      chainId: 84532,
    },
  },
};

export default config;

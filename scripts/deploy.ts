import hre from "hardhat";

async function main() {
  const initialBaseUri =
    process.env.NFT_BASE_URI ?? "https://basemint.example/api/metadata/";
  const connection = await hre.network.create();
  const [deployer] = await connection.viem.getWalletClients();

  console.log(`Deploying BaseMint from ${deployer.account.address}`);

  const contract = await connection.viem.deployContract("BaseMint", [initialBaseUri]);

  console.log(`BaseMint deployed to ${contract.address}`);
  console.log("Set NEXT_PUBLIC_CONTRACT_ADDRESS to this address before deploying the app.");
  await connection.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

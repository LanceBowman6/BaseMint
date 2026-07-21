import assert from "node:assert/strict";
import { describe, it } from "node:test";
import hre from "hardhat";

describe("BaseMint", function () {
  async function deployFixture() {
    const connection = await hre.network.create();
    const [owner, minter, referrer] = await connection.viem.getWalletClients();
    const contract = await connection.viem.deployContract("BaseMint", [
      "https://example.com/metadata/",
    ]);

    return { connection, contract, owner, minter, referrer };
  }

  it("allows one free daily mint and awards points", async function () {
    const { connection, contract, minter } = await deployFixture();

    try {
      await contract.write.mint({ account: minter.account });

      assert.equal(await contract.read.walletMintCount([minter.account.address]), 1n);
      assert.equal(await contract.read.rewardPoints([minter.account.address]), 10n);

      await assert.rejects(
        contract.write.mint({ account: minter.account }),
        "already minted today",
      );
    } finally {
      await connection.close();
    }
  });

  it("stores referral only on the first referred mint", async function () {
    const { connection, contract, minter, referrer } = await deployFixture();

    try {
      await contract.write.dailyMint([referrer.account.address], {
        account: minter.account,
      });

      assert.equal(
        (await contract.read.referralOf([minter.account.address])).toLowerCase(),
        referrer.account.address.toLowerCase(),
      );
      assert.equal(await contract.read.rewardPoints([minter.account.address]), 20n);
      assert.equal(await contract.read.rewardPoints([referrer.account.address]), 20n);
    } finally {
      await connection.close();
    }
  });
});

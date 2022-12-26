import { describe, it, assert } from "vitest";
import { Tx } from "src/main/headless/tx";
import { HEADLESS_PATH } from "src/constant";
import path from "path";
import fs from "fs";

describe("Tx", function () {
  const tx = new Tx(HEADLESS_PATH);

  describe("Sign", function () {
    const privateKey =
      "9c1c8da789b5c83f459c9d5034446af4a050ee14117c2a68d2439a3ed3b98f0a";
    const genesisHash =
      "4582250d0da33b06779a8475d283d5dd210c683b9b999d74d03fac4f58fa6bce";
    const timeStamp = "2021-09-14T00:00:00Z";
    describe("without action", function () {
      it("It returns error", function () {
        const sign = tx.Sign(
          privateKey,
          1,
          genesisHash,
          new Date(timeStamp).toISOString(),
          ""
        );
        assert.isNotEmpty(sign.stderr);
        assert.isEmpty(sign.stdout);
      });
    });
    describe("with actions", function () {
      const actions = [
        "activate_account",
        "monster_collect",
        "claim_monster_collection_reward",
        "transfer_asset",
      ];
      actions.forEach((action) => {
        const actionPath = path.join(
          __dirname,
          "..",
          "..",
          "fixture",
          `${action}.txt`
        );
        const txPath = path.join(
          __dirname,
          "..",
          "..",
          "fixture",
          `tx_${action}.txt`
        );
        it(`It returns dumped tx with ${action}`, function () {
          const sign = tx.Sign(
            privateKey,
            1,
            genesisHash,
            new Date(timeStamp).toISOString(),
            actionPath
          );
          assert.isNotEmpty(sign.stdout);
          assert.isEmpty(sign.stderr);
          const result = sign.stdout;
          const expected = fs.readFileSync(txPath, "utf-8");
          assert.equal(result, expected);
        });
      });
    });
  });
});

import { assert } from "chai";
import { Tx } from "../../../src/main/headless/tx";
import { HEADLESS_PATH } from "../../constant";
import path from "path";
import fs from "fs";

describe("Tx", function () {
  const tx = new Tx(HEADLESS_PATH);

  describe("Sign", function () {
    const privateKey = "9c1c8da789b5c83f459c9d5034446af4a050ee14117c2a68d2439a3ed3b98f0a";
    const genesisHash = "4582250d0da33b06779a8475d283d5dd210c683b9b999d74d03fac4f58fa6bce";
    const timeStamp = "2021-09-14T09:00:00";
    context("without action", function () {
      it("It returns error", function () {
        let sign = tx.Sign(privateKey, 1, genesisHash, new Date(timeStamp).toISOString(), "");
        assert.isNotEmpty(sign.stderr);
        assert.isEmpty(sign.stdout)
      });
    })
    context("with ActivateAccount action", function () {
      const actionPath = path.join(__dirname, "..", "..", "fixture", "activate_account.txt");
      const txPath = path.join(__dirname, "..", "..", "fixture", "tx_activate_account.txt");
      it("It returns dumped tx", function () {
        let sign = tx.Sign(privateKey, 1, genesisHash, new Date(timeStamp).toISOString(), actionPath);
        assert.isNotEmpty(sign.stdout);
        assert.isEmpty(sign.stderr)
        let result = sign.stdout;
        const expected = fs.readFileSync(txPath, "utf-8");
        assert.equal(result, expected);
      });
    });
  });
});

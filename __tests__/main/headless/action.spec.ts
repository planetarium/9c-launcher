import { assert } from "chai";
import { Action } from "../../../src/main/headless/action";
import { HEADLESS_PATH } from "../../constant";
import { tmpNameSync } from "tmp-promise";
import fs from "fs";
import path from "path";

describe("Action", function () {
  const action = new Action(HEADLESS_PATH);

  describe("ActivateAccount", function () {
    context("with valid params", function () {
      const invitationKey = "9c1c8da789b5c83f459c9d5034446af4a050ee14117c2a68d2439a3ed3b98f0a/2ec7ad8114d8eaf4c3621384a652305a57a71def";
      const fileName = tmpNameSync();
      const filePath = path.join(__dirname, "..", "..", "fixture", "activate_account.txt");
      it(`It returns true & dump file with "${invitationKey}"`, function () {
          assert.isTrue(action.ActivateAccount(invitationKey, "00", fileName));
          assert.isTrue(fs.existsSync(fileName));
          const contents = fs.readFileSync(fileName, "base64");
          const expected = fs.readFileSync(filePath, "base64");
          assert.equal(contents, expected);
      });
    });
  });
});

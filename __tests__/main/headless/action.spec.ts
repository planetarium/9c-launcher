import { describe, it, assert } from "vitest";
import { Action } from "src/main/headless/action";
import { HEADLESS_PATH } from "src/constant";
import { tmpNameSync } from "tmp-promise";
import fs from "fs";
import path from "path";

describe("Action", function () {
  const action = new Action(HEADLESS_PATH);

  describe("ActivateAccount", function () {
    describe("with valid params", function () {
      const invitationKey =
        "9c1c8da789b5c83f459c9d5034446af4a050ee14117c2a68d2439a3ed3b98f0a/2ec7ad8114d8eaf4c3621384a652305a57a71def";
      const fileName = tmpNameSync();
      const filePath = path.join(
        __dirname,
        "..",
        "..",
        "fixture",
        "activate_account.txt"
      );
      it(`It returns true & dump file with "${invitationKey}"`, function () {
        assert.isTrue(action.ActivateAccount(invitationKey, "00", fileName));
        assert.isTrue(action.ActivateAccount(invitationKey, "00", fileName));
        assert.isTrue(fs.existsSync(fileName));
        const contents = fs.readFileSync(fileName, "base64");
        const expected = fs.readFileSync(filePath, "base64");
        assert.equal(contents, expected);
      });
    });
  });

  describe("MonsterCollect", function () {
    describe("with valid params", function () {
      const fileName = tmpNameSync();
      it("It returns true & dump file with level 1", function () {
        assert.isTrue(action.MonsterCollect(1, fileName));
        assert_action("MonsterCollect", fileName);
      });
    });
    describe("with invalid params", function () {
      const fileName = tmpNameSync();
      const levels = [-1, 8];
      levels.forEach((level) => {
        it(`It returns false with "${level}"`, function () {
          assert.isFalse(action.MonsterCollect(level, fileName));
          assert.isFalse(fs.existsSync(fileName));
        });
      });
    });
  });

  describe("ClaimMonsterCollectionReward", function () {
    describe("with valid params", function () {
      const fileName = tmpNameSync();
      const avatarAddress = "Fb90278C67f9b266eA309E6AE8463042f5461449";
      it(`It returns true & dump file with "${avatarAddress}"`, function () {
        assert.isTrue(
          action.ClaimMonsterCollectionReward(avatarAddress, fileName)
        );
        assert_action("ClaimMonsterCollectionReward", fileName);
      });
    });
  });

  describe("TransferAsset", function () {
    describe("with valid params", function () {
      const fileName = tmpNameSync();
      const senderAddress = "FdD1161598BF981d4c350C9d77C0CAd9B82c29c9";
      const recipientAddress = "643c6e7F37A0CCc87Da562235F2fE36AD93bcE5D";
      const amount = 10;
      const memo = "transfer asset test.";
      it(`It returns true & dump file with
        "${senderAddress}",
        "${recipientAddress}",
        "${amount}",
        "${memo}"`, function () {
        assert.isTrue(
          action.TransferAsset(
            senderAddress,
            recipientAddress,
            amount,
            memo,
            fileName
          )
        );
        assert_action("TransferAsset", fileName);
      });
    });
  });

  function assert_action(actionName: string, fileName: string) {
    assert.isTrue(fs.existsSync(fileName));
    const decoded = Buffer.from(
      fs.readFileSync(fileName, "utf-8"),
      "base64"
    ).toString();
    assert.isTrue(decoded.includes(actionName));
  }
});

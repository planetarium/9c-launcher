import { assert } from "chai";
import { Validation } from "../../../src/main/headless/validation";
import { HEADLESS_PATH } from "../../constant";

describe("Validation", function () {
  const validation = new Validation(HEADLESS_PATH);

  describe("isValidPrivateKey", function () {
    context("with invalid private key", function () {
      it("It returns false with empty input", function () {
        assert.isFalse(validation.isValidPrivateKey(""));
      });

      it("It returns false with odd-length input", function () {
        assert.isFalse(validation.isValidPrivateKey("a"));
        assert.isFalse(validation.isValidPrivateKey("abc"));
        assert.isFalse(validation.isValidPrivateKey("1"));
        assert.isFalse(validation.isValidPrivateKey("111"));
      });
    });

    context("with valid private key", function () {
      const validPrivateKeys = [
        "ed5eba446d4c7cb50d7d5eb72c732773d89ee336f1880ee237b07589ed2387fc",
        "243389a88fcb6956aa3fb23acd3b770fb05bcdb993b326c19b1e40918f03155a",
        "872ea540fe284f18f52221b0422954d864600661e5990f9fd3c6988583fd583f",
      ];
      validPrivateKeys.forEach((validPrivateKey) => {
        it(`It returns true with "${validPrivateKey}"`, function () {
          assert.isTrue(validation.isValidPrivateKey(validPrivateKey));
        });
      });
    });
  });
});

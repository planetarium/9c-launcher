import { assert } from "chai";
import { KeyStore, ProtectedPrivateKey } from "src/main/headless/key-store";
import { HEADLESS_PATH } from "../../constant";

describe("KeyStore", function () {
  this.timeout(2 * 1000);

  const keyStore = new KeyStore(HEADLESS_PATH);

  beforeEach(function cleanUpKeyStore(done) {
    for (const protectedPrivateKey of keyStore.list()) {
      keyStore.revokeProtectedPrivateKey(protectedPrivateKey.keyId);
    }

    done();
  });

  describe("revokeProtectedPrivateKey", function () {
    context("with invalid key id", function () {
      it("It throws an error with empty input", function () {
        assert.throw(function () {
          keyStore.revokeProtectedPrivateKey("");
        });
      });

      it("It throws an error with invalid length input", function (done) {
        ["a", "abc", "1", "111"].forEach((keyId) => {
          assert.throw(function () {
            keyStore.revokeProtectedPrivateKey(keyId);
          });
        });
        done();
      });
    });

    context("with valid key id", function () {
      it("It should success", function () {
        const protectedPrivateKey = keyStore.createProtectedPrivateKey("");
        assert.doesNotThrow(() =>
          keyStore.revokeProtectedPrivateKey(protectedPrivateKey.keyId)
        );
      });
    });
  });

  describe("unprotectPrivateKey", function () {
    const passphrase = "4EuJsrjo@_rVheG.";
    let protectedPrivateKey: ProtectedPrivateKey;

    beforeEach(function initializeProtectedPrivateKey() {
      protectedPrivateKey = keyStore.createProtectedPrivateKey(passphrase);
    });

    context("with invalid passphrase", function () {
      it("It should throw an error", function () {
        assert.throw(() =>
          keyStore.unprotectPrivateKey(protectedPrivateKey.keyId, "")
        );
      });
    });

    context("with valid pasphrase", function () {
      it("It should success", function () {
        assert.doesNotThrow(() =>
          keyStore.unprotectPrivateKey(protectedPrivateKey.keyId, passphrase)
        );
      });
    });
  });

  describe("importPrivateKey", function () {
    context("with invalid private key", function () {
      it("It throws an error with odd-length private key", function () {
        assert.throw(() => keyStore.importPrivateKey("1", ""));
        assert.throw(() => keyStore.importPrivateKey("123", ""));
        assert.throw(() => keyStore.importPrivateKey("afd", ""));
        assert.throw(() => keyStore.importPrivateKey("a1d", ""));
      });

      it("It throws an error with empty private key", function () {
        assert.throw(() => keyStore.importPrivateKey("", ""));
      });
    });

    context("with valid private key", function () {
      const validPrivateKeys = [
        "ed5eba446d4c7cb50d7d5eb72c732773d89ee336f1880ee237b07589ed2387fc",
        "243389a88fcb6956aa3fb23acd3b770fb05bcdb993b326c19b1e40918f03155a",
        "11",
      ];

      const passphrases = ["a", "SHAT_sler0zauk6gih", "THZZg.4vKg!e.6D4"];
      passphrases.forEach((passphrase) => {
        it(`It should success with "${passphrase}" passphrase`, function (done) {
          for (const privateKey of validPrivateKeys) {
            assert.doesNotThrow(() =>
              keyStore.importPrivateKey(privateKey, passphrase)
            );
          }

          done();
        });
      });
    });
  });

  describe("list", function () {
    context("with empty key store", function () {
      it("It should return emtpy list", function () {
        assert.isEmpty(keyStore.list());
      });
    });

    context("with non-empty key store", function () {
      const privateKeyCount = 5;

      beforeEach(function createPrivateKeys(done) {
        for (const _ of Array(privateKeyCount).keys()) {
          keyStore.createProtectedPrivateKey("a");
        }

        done();
      });

      it(`It should return ${privateKeyCount}-length protected private keys`, function () {
        assert.lengthOf(keyStore.list(), privateKeyCount);
      });
    });
  });

  describe("createProtectedPrivateKey", function () {
    context("with empty key store", function () {
      it("It should create private key", function () {
        assert.isEmpty(keyStore.list());
        const protectedPrivateKey = keyStore.createProtectedPrivateKey("");
        assert.lengthOf(protectedPrivateKey.address, 42);
        assert.lengthOf(protectedPrivateKey.keyId, 36);
        assert.lengthOf(keyStore.list(), 1);
      });
    });
  });

  describe("convertPrivateKey", function () {
    context('with "address" format', function () {
      it("It should return 40-length converted address", function () {
        assert.equal(
          "E66077dc4a583472cE0752653Fa2a85A69d03830",
          keyStore.convertPrivateKey(
            "8eb4c6fad3b221bdd2e8a79fede5ff1034bd56f2504292474c004c6f77a9f5ab",
            "address"
          )
        );
      });
    });

    context('with "public-key" format', function () {
      it("It should return 66-length converted public key", function () {
        assert.equal(
          "029c8e70a5ded17d2dec87da1cdaee52acbee69cb1a0b3925f8a2f64e42bc2d65a",
          keyStore.convertPrivateKey(
            "8eb4c6fad3b221bdd2e8a79fede5ff1034bd56f2504292474c004c6f77a9f5ab",
            "public-key"
          )
        );
      });
    });
  });
});

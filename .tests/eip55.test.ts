import { keccak_256 } from "@noble/hashes/sha3";
import { bytesToHex, randomBytes } from "@noble/hashes/utils";
import { describe, it, expect, beforeAll } from "vitest";
import fixtures from "./fixture/addresses.json";
import { verify, encode } from "src/utils/eip55";

const malform = (address: string): string => {
  const i = Math.floor(Math.random() * address.length);
  const c = address.charCodeAt(i);
  const s = String.fromCharCode(c + 1);

  return address.slice(0, i) + s + address.slice(i + 1);
};

// from https://github.com/ethereum/EIPs/blob/f3a591f6718035ba358d6a479cadabe313f6ed36/EIPS/eip-55.md#implementation
const referenceImpl = (address: string): string => {
  address = address.toLowerCase().replace("0x", "");
  const hash = bytesToHex(keccak_256.create().update(address).digest());
  let ret = "0x";

  for (let i = 0; i < address.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      ret += address[i].toUpperCase();
    } else {
      ret += address[i];
    }
  }

  return ret;
};

describe("EIP55 Address Encoding", () => {
  it("verifies each address", () => {
    let fail = 0;

    for (const address of fixtures) {
      const initial = address.toLowerCase();

      expect(encode(initial)).toBe(address);
      expect(verify(initial)).toBe(false);
      expect(verify(address)).toBe(true);

      const malformed = malform(address);
      if (verify(malformed)) {
        fail++;
      }
    }

    for (let i = 0; i < 1000; ++i) {
      const address = "0x" + bytesToHex(randomBytes(20));
      expect(referenceImpl(address)).toBe(encode(address));
    }

    expect(fail).toBeLessThan(3); // ~0.03% rate
  });

  describe("EIP55 Address Encoding", () => {
    it("verifies each address", () => {
      let fail = 0;

      for (const address of fixtures) {
        const initial = address.toLowerCase();

        expect(encode(initial)).toBe(address);
        expect(verify(initial)).toBe(false);
        expect(verify(address)).toBe(true);

        const malformed = malform(address);
        if (verify(malformed)) {
          fail++;
        }
      }

      for (let i = 0; i < 1000; ++i) {
        const address = "0x" + bytesToHex(randomBytes(20));
        expect(referenceImpl(address)).toBe(encode(address));
      }

      expect(fail).toBeLessThan(3); // ~0.03% rate
    });

    it("verifies edge cases", () => {
      // encode edge cases
      expect(() => encode(-34.23 as any)).toThrow("Bad address");
      expect(() =>
        encode("82c025c453c9ad2824a9b3710763d90d8f454760"),
      ).not.toThrow();

      expect(() => encode("82c025c453c9ad2824a9b3710763d90d8f4547")).toThrow(
        "Bad address",
      );
      expect(() => encode("0x82c025c453c9ad2824a9b3710763d90d8f4547")).toThrow(
        "Bad address",
      );
      expect(() => encode("z2c025c453c9ad2824a9b3710763d90d8f454760")).toThrow(
        "Bad address",
      );
      expect(() =>
        encode("0xz2c025c453c9ad2824a9b3710763d90d8f454760"),
      ).toThrow("Bad address");
      expect(() =>
        encode("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz"),
      ).toThrow("Bad address");

      // verify edge cases
      expect(verify("82C025c453C9aD2824A9b3710763D90D8F454760")).toBe(false);
      expect(verify("0x82c025c453c9ad2824a9b3710763d90d8f454760", true)).toBe(
        true,
      );
      expect(verify("0x82C025C453C9AD2824A9B3710763D90D8F454760", true)).toBe(
        true,
      );

      // The following checks should not throw and return false instead
      expect(() => verify(-34.23 as any)).not.toThrow();
      expect(verify(-34.23 as any)).toBe(false);
      expect(verify({} as any)).toBe(false);
      expect(verify("0x82c025c453c9ad2824a9b3710763d90d8f4547")).toBe(false);
      expect(verify("0xz2c025c453c9ad2824a9b3710763d90d8f454760")).toBe(false);
      expect(verify("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz")).toBe(false);
      expect(verify("0xzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz")).toBe(false);

      // EIP-1191 tests
      const flatAddress = "0xdbf03b407c01e7cd3cbea99509d93f8dddc8c6fb";
      const chainId30Addr = "0xDBF03B407c01E7CD3cBea99509D93F8Dddc8C6FB";
      const chainId31Addr = "0xdbF03B407C01E7cd3cbEa99509D93f8dDDc8C6fB";
      expect(encode(flatAddress, 30)).toBe(chainId30Addr);
      expect(encode(flatAddress, 31)).toBe(chainId31Addr);
      expect(() => encode(flatAddress, {} as any)).toThrow("Bad chainId");
      expect(() => encode(flatAddress, 30.4 as any)).toThrow("Bad chainId");
      expect(() => encode(flatAddress, 0)).toThrow("Bad chainId");
      expect(() => encode(flatAddress, -30)).toThrow("Bad chainId");
      expect(verify(chainId30Addr, false, 30)).toBe(true);
      expect(verify(chainId31Addr, false, 31)).toBe(true);
      expect(() => verify(chainId30Addr, false, {} as any)).toThrow(
        "Bad chainId",
      );
      expect(() => verify(chainId30Addr, false, 30.4 as any)).toThrow(
        "Bad chainId",
      );
      expect(() => verify(chainId30Addr, false, 0)).toThrow("Bad chainId");
      expect(() => verify(chainId30Addr, false, -30)).toThrow("Bad chainId");
    });
  });
});

import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { checkAndSaveFile } from "src/utils/qrDecode";

const SAMPLE_KEYSTORE = JSON.stringify({
  version: 3,
  id: "00000000-0000-0000-0000-000000000000",
  address: "0000000000000000000000000000000000000000",
});
const SAMPLE_UUID = "00000000-0000-0000-0000-000000000000";

describe("checkAndSaveFile", () => {
  let baseDir: string;

  beforeEach(() => {
    baseDir = fs.mkdtempSync(path.join(os.tmpdir(), "qr-decode-test-"));
  });

  afterEach(() => {
    fs.rmSync(baseDir, { recursive: true, force: true });
  });

  it("creates the keystore directory when it does not exist (PLD-1393)", async () => {
    // Simulate a PC that has never created an account: the keystore folder
    // does not exist yet.
    const keyStorePath = path.join(baseDir, "planetarium", "keystore");
    expect(fs.existsSync(keyStorePath)).toBe(false);

    await expect(
      checkAndSaveFile(keyStorePath, SAMPLE_KEYSTORE, SAMPLE_UUID),
    ).resolves.toBeUndefined();

    expect(fs.existsSync(keyStorePath)).toBe(true);
    const files = fs.readdirSync(keyStorePath);
    expect(files.some((f) => f.includes(SAMPLE_UUID))).toBe(true);
  });

  it("saves into an already-existing directory", async () => {
    await expect(
      checkAndSaveFile(baseDir, SAMPLE_KEYSTORE, SAMPLE_UUID),
    ).resolves.toBeUndefined();

    const files = fs.readdirSync(baseDir);
    expect(files.some((f) => f.includes(SAMPLE_UUID))).toBe(true);
  });

  it("rejects when a key with the same uuid already exists", async () => {
    await checkAndSaveFile(baseDir, SAMPLE_KEYSTORE, SAMPLE_UUID);

    await expect(
      checkAndSaveFile(baseDir, SAMPLE_KEYSTORE, SAMPLE_UUID),
    ).rejects.toThrow("This key already exists.");
  });
});

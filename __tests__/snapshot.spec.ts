import { describe, it, beforeAll, assert } from "vitest";
import fs, { readdirSync } from "fs";
import CancellationToken from "cancellationtoken";
import path from "path";
import {
  downloadMetadata,
  downloadSnapshot,
  extractSnapshot,
  getCurrentEpoch,
  getSnapshotDownloadTarget,
  validateMetadata,
} from "../src/main/snapshot";
import { BlockMetadata } from "src/interfaces/block-header";
import { MockedNineChroniclesMixpanel } from "./mock/MockNineChroniclesMixpanel";

const storePath = path.join(__dirname, "fixture", "store");
const baseUrl = "http://snapshots.nine-chronicles.com/partition-test";
const userDataPath = path.join(__dirname, "userData");
const emptyStore = path.join(storePath, "empty");
const nonEmptyStore = path.join(storePath, "non-empty");
const integrationStore = path.join(storePath, "integration");
const mockMixpanel = new MockedNineChroniclesMixpanel();

async function getMetadataFromFilename(filename: string) {
  const metadataPath = path.join(storePath, filename);
  const metadataString = await fs.promises.readFile(metadataPath, "utf-8");
  return JSON.parse(metadataString) as BlockMetadata;
}

describe("snapshot", function () {
  beforeAll(function () {
    if (!fs.existsSync(userDataPath)) fs.mkdirSync(userDataPath);
    if (!fs.existsSync(emptyStore)) fs.mkdirSync(emptyStore);
    if (!fs.existsSync(integrationStore)) fs.mkdirSync(integrationStore);
  });

  describe("get current epoch from store", function () {
    it("should be equal base epoch with empty store", async function () {
      const epoch = getCurrentEpoch(emptyStore);
      assert.equal(epoch.BlockEpoch, 0);
      assert.equal(epoch.TxEpoch, 0);
    });

    it("should be equal 3 more epoch then base epoch with non-empty store", async function () {
      const epoch = getCurrentEpoch(nonEmptyStore);
      assert.equal(epoch.BlockEpoch, 18688);
      assert.equal(epoch.TxEpoch, 18679);
    });
  });

  describe("get download target", function () {
    it("should be download all snapshot", async function () {
      const metadata = await getMetadataFromFilename(
        "snapshot-18698-18689.json"
      );
      const cancellation = CancellationToken.create();

      const target = await getSnapshotDownloadTarget(
        metadata,
        emptyStore,
        baseUrl,
        userDataPath,
        cancellation.token,
        mockMixpanel
      );

      assert.equal(target.length, 16);

      Array.from({ length: 16 }, (v, i) => i).forEach((x: number) => {
        const epoch = target[x];
        assert.equal(epoch.BlockEpoch, 18698 - x);
        assert.equal(epoch.TxEpoch, 18689 - x);
      });
    });

    it("should be download it needed", async function () {
      const metadata = await getMetadataFromFilename(
        "snapshot-18698-18689.json"
      );
      const cancellation = CancellationToken.create();

      const target = await getSnapshotDownloadTarget(
        metadata,
        nonEmptyStore,
        baseUrl,
        userDataPath,
        cancellation.token,
        mockMixpanel
      );

      assert.equal(target.length, 11);

      Array.from({ length: 11 }, (v, i) => i).forEach((x: number) => {
        const epoch = target[x];
        assert.equal(epoch.BlockEpoch, 18698 - x);
        assert.equal(epoch.TxEpoch, 18689 - x);
      });
    });
  });

  describe("download snapshot", function () {
    it("should be download all snapshot", async function () {
      const cancellation = CancellationToken.create();
      const metadata = await downloadMetadata(
        baseUrl,
        userDataPath,
        "latest.json",
        cancellation.token
      );

      const target = await getSnapshotDownloadTarget(
        metadata,
        emptyStore,
        baseUrl,
        userDataPath,
        cancellation.token,
        mockMixpanel
      );

      const result = await downloadSnapshot(
        baseUrl,
        target,
        userDataPath,
        (status) => {},
        cancellation.token,
        mockMixpanel
      );

      const snapshotZipList = readdirSync(userDataPath).filter(
        (file) => path.extname(file) === ".zip"
      );

      assert.equal(result.length, snapshotZipList.length);
    });
  });

  it("should be integrated", async function () {
    console.log(`Trying snapshot path: ${baseUrl}`);

    const cancellation = CancellationToken.create();
    const localMetadata = await getMetadataFromFilename("local-snapshot.json");

    const metadata = await downloadMetadata(
      baseUrl,
      userDataPath,
      "latest.json",
      cancellation.token
    );
    const needSnapshot = validateMetadata(
      metadata,
      localMetadata,
      integrationStore,
      cancellation.token
    );

    assert.isTrue(needSnapshot);

    const target = await getSnapshotDownloadTarget(
      metadata,
      integrationStore,
      baseUrl,
      userDataPath,
      cancellation.token,
      mockMixpanel
    );

    const snapshotPaths = await downloadSnapshot(
      baseUrl,
      target,
      userDataPath,
      (status) => {},
      cancellation.token,
      mockMixpanel
    );

    await extractSnapshot(
      snapshotPaths,
      integrationStore,
      (progress: number) => {
        if ((progress * 100) % 10 === 0) {
          console.log(progress * 100);
        }
      },
      cancellation.token,
      mockMixpanel
    );
    console.log("finish");
  }, 120000);
});

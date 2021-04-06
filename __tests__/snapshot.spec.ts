import fs, { readdirSync } from "fs";
import CancellationToken from "cancellationtoken";
import { assert } from "chai";
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

const storePath = path.join(__dirname, "fixture", "store");
const baseUrl = "https://download.nine-chronicles.com/partition-test";
const userDataPath = path.join(__dirname, "userData");
const emptyStore = path.join(storePath, "empty");
const nonEmptyStore = path.join(storePath, "non-empty");
const integrationStore = path.join(storePath, "integration");
const emptyMixpanelUUID = "";

async function getMetadataFromFilename(filename: string) {
  const metadataPath = path.join(storePath, filename);
  const metadataString = await fs.promises.readFile(metadataPath, "utf-8");
  return JSON.parse(metadataString) as BlockMetadata;
}

describe("snapshot", function () {
  before(function () {
    if (!fs.existsSync(userDataPath)) fs.mkdirSync(userDataPath);
    if (!fs.existsSync(emptyStore)) fs.mkdirSync(emptyStore);
    if (!fs.existsSync(integrationStore)) fs.mkdirSync(integrationStore);
  });

  describe("get current epoch from store", function () {
    it("should be equal base epoch with empty store", async function () {
      let epoch = getCurrentEpoch(emptyStore);
      assert.equal(epoch.BlockEpoch, 0);
      assert.equal(epoch.TxEpoch, 0);
    });

    it("should be equal 3 more epoch then base epoch with non-empty store", async function () {
      let epoch = getCurrentEpoch(nonEmptyStore);
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

      let target = await getSnapshotDownloadTarget(
        metadata,
        emptyStore,
        baseUrl,
        userDataPath,
        cancellation.token,
        null,
        emptyMixpanelUUID
      );

      assert.equal(target.length, 16);

      Array.from({ length: 16 }, (v, i) => i).forEach((x: number) => {
        let epoch = target[x];
        assert.equal(epoch.BlockEpoch, 18698 - x);
        assert.equal(epoch.TxEpoch, 18689 - x);
      });
    });

    it("should be download it needed", async function () {
      const metadata = await getMetadataFromFilename(
        "snapshot-18698-18689.json"
      );
      let cancellation = CancellationToken.create();

      let target = await getSnapshotDownloadTarget(
        metadata,
        nonEmptyStore,
        baseUrl,
        userDataPath,
        cancellation.token,
        null,
        emptyMixpanelUUID
      );

      assert.equal(target.length, 11);

      Array.from({ length: 11 }, (v, i) => i).forEach((x: number) => {
        let epoch = target[x];
        assert.equal(epoch.BlockEpoch, 18698 - x);
        assert.equal(epoch.TxEpoch, 18689 - x);
      });
    });
  });

  describe("download snapshot", function () {
    this.timeout(30 * 1000);
    it("should be download all snapshot", async function () {
      let cancellation = CancellationToken.create();
      let metadata = await downloadMetadata(
        baseUrl,
        userDataPath,
        "latest.json",
        cancellation.token,
        null,
        emptyMixpanelUUID
      );

      let target = await getSnapshotDownloadTarget(
        metadata,
        emptyStore,
        baseUrl,
        userDataPath,
        cancellation.token,
        null,
        emptyMixpanelUUID
      );

      let result = await downloadSnapshot(
        baseUrl,
        target,
        userDataPath,
        (status) => {},
        cancellation.token,
        null,
        emptyMixpanelUUID
      );

      let snapshotZipList = readdirSync(userDataPath).filter(
        (file) => path.extname(file) === ".zip"
      );

      assert.equal(result.length, snapshotZipList.length);
    });
  });

  it("should be integrated", async function () {
    this.timeout(120000);
    console.log(`Trying snapshot path: ${baseUrl}`);

    let cancellation = CancellationToken.create();
    const localMetadata = await getMetadataFromFilename("local-snapshot.json");

    let metadata = await downloadMetadata(
      baseUrl,
      userDataPath,
      "latest.json",
      cancellation.token,
      null,
      emptyMixpanelUUID
    );
    let needSnapshot = validateMetadata(
      metadata,
      localMetadata,
      integrationStore,
      cancellation.token
    );

    assert.isTrue(needSnapshot);

    let target = await getSnapshotDownloadTarget(
      metadata,
      integrationStore,
      baseUrl,
      userDataPath,
      cancellation.token,
      null,
      emptyMixpanelUUID
    );

    let snapshotPaths = await downloadSnapshot(
      baseUrl,
      target,
      userDataPath,
      (status) => {},
      cancellation.token,
      null,
      emptyMixpanelUUID
    );

    await extractSnapshot(
      snapshotPaths,
      integrationStore,
      (progress: number) => {
        if ((progress * 100) % 10 === 0) {
          console.log(progress * 100);
        }
      },
      cancellation.token
    );
    console.log("finish");
  });
});

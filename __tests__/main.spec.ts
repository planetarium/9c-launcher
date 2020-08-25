import path from "path";

import { Application } from "spectron";
import electron from "electron";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import assert from "assert";

// @ts-ignore
process.env.ELECTRON_IS_DEV = 0;

chai.use(chaiAsPromised);

describe("test", function () {
  this.timeout(10000);

  let app: Application;

  beforeEach(function () {
    app = new Application({
      path: (electron as unknown) as string,
      args: [path.join(__dirname, "..", "dist")],
    });
    // @ts-ignore
    chaiAsPromised.transferPromiseness = app.transferPromiseness;
    return app.start();
  });

  afterEach(function () {
    if (app?.isRunning()) {
      app.mainProcess.exit(0);
    }
  });

  it("shows an initial window", async function () {
    const count = await app.client.getWindowCount();
    assert.strictEqual(count, 1);
  });

  it("capture log on main process", async function () {
    await app.client.waitUntilWindowLoaded(10000);
    const logs = await app.client.getMainProcessLogs();
    logs.forEach(console.log);
  });
});

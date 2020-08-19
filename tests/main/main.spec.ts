import { Application } from "spectron";
import electron from "electron";

import path from "path";

const app = new Application({
  // Your electron path can be any binary
  // i.e for OSX an example path could be '/Applications/MyApp.app/Contents/MacOS/MyApp'
  // But for the sake of the example we fetch it from our node_modules.
  path: electron,
  args: [path.join(__dirname, "..", "dist")],
});

describe("Application launch", () => {
  beforeEach(() => {
    app.start();
  });
  afterEach((done) => {
    if (app.isRunning()) {
      app.stop();
      done();
    }
  });
  it("shows an initial window", (done) => {
    app.client.getWindowCount().then((count) => {
      assert.equal(count, 1);
      done();
    });
  });
});

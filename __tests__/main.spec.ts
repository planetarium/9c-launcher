import path from "path";

import { Application, SpectronWebContents } from "spectron";
import electron from "electron";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import assert from "assert";

import "dotenv/config";

// @ts-ignore
process.env.ELECTRON_IS_DEV = 0;
const { PASSWORD } = process.env;

if (PASSWORD === undefined) throw Error("failed to load password from .env");

chai.use(chaiAsPromised);

describe("test", function () {
  this.timeout(10000);

  let app: Application;

  before(function () {
    app = new Application({
      path: (electron as unknown) as string,
      args: [path.join(__dirname, "..", "dist")],
    });
    // @ts-ignore
    chaiAsPromised.transferPromiseness = app.transferPromiseness;
    return app.start();
  });

  afterEach(function () {
    return app.client.waitUntil(
      async function () {
        const pathname = await app.webContents.executeJavaScript(
          "location.pathname"
        );
        return typeof pathname === "string" && pathname !== "/error";
      },
      { timeoutMsg: "오류가 일어났습니다." }
    );
  });

  it("로그인 하기", async function () {
    const inputPassword = await app.client.$('input[type="password"]');
    await inputPassword.setValue(PASSWORD);

    const submitButton = await app.client.$('button[type="submit"]');
    await submitButton.click();
  });

  it("마이닝 끄기", async function () {
    const miningOffButton = await app.client.$("#mining-off");
    await miningOffButton.click();
  });

  it("로비 뷰에서 실행 버튼 기다리기", async function () {
    const timeout = 1800000;
    this.timeout(timeout);

    let submitButton = await app.client.$("body");

    await app.client.waitUntil(
      async function () {
        try {
          submitButton = await app.client.$("#start-game");
        } catch {
          return false;
        }
        const text = await submitButton.getText();
        return text === "Start Game";
      },
      { timeout, timeoutMsg: "실행 버튼이 나오지 않았습니다." }
    );
    await submitButton.click();
  });

  after(function () {
    if (app?.isRunning()) {
      app.mainProcess.exit(0);
    }
  });
});

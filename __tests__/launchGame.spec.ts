import path from "path";

import { Application } from "spectron";
import "dotenv/config";
import { expect } from "chai";

import { startApp, checkPath } from "./utils";

const isWindows = process.platform === "win32";

// @ts-ignore
process.env.ELECTRON_IS_DEV = 0;

const { PASSWORD } = process.env;

if (PASSWORD === undefined) throw Error("failed to load password from .env");

describe("로그인하고 게임 실행까지 가기", function () {
  this.timeout(10000);

  let app: Application;
  const history: string[] = [];

  before(async function () {
    app = await startApp();
  });

  const lastPath = "/lobby";
  afterEach(() => checkPath({ app, lastPath, history, isWindows })());

  it("로그인 하기", async function () {
    const passwordInput = await app.client.$('input[type="password"]');
    await passwordInput.setValue(PASSWORD);

    const submitButton = await app.client.$('button[type="submit"]');
    await submitButton.click();
  });

  it("마이닝 끄기", async function () {
    const miningOffButton = await app.client.$("#mining-off");
    await miningOffButton.click();
  });

  it("로비 뷰에서 실행 버튼 기다리기", async function () {
    const submitButton = await app.client.$("#start-game");
    const text = await submitButton.getText();
    expect(text).to.equal("NOW RUNNING...");
  });

  after(function () {
    if (app?.isRunning()) {
      return app.mainProcess.exit(0);
    }
  });
});

import path from "path";

import { Application } from "spectron";
import electron from "electron";

import { expect } from "chai";

// @ts-ignore
process.env.ELECTRON_IS_DEV = 0;

const { PASSWORD } = process.env;

if (PASSWORD === undefined) throw Error("failed to load password from .env");

describe("test", function () {
  this.timeout(10000);

  let app: Application;

  before(function () {
    app = new Application({
      path: (electron as unknown) as string,
      args: [path.join(__dirname, "..", "dist")],
    });
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

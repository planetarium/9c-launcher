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

describe("키 관리하기", function () {
  this.timeout(10000);

  let app: Application;
  before(async function () {
    app = await startApp();
  });

  function quitApp() {
    if (app?.isRunning()) {
      return app.mainProcess.exit(0);
    }
  }

  let privateKey: string;
  const newPassword = PASSWORD + "CHANGED";

  describe("계정 만들기", async function () {
    const lastPath = "/account/create/copy";
    const history: string[] = [];

    const checkPathForCreateAccount = checkPath({
      app,
      lastPath,
      history,
      isWindows,
    });

    it("경로 이동 확인", checkPathForCreateAccount);

    it("환영 페이지 건너 뛰기", async function () {
      const submitButton = await app.client.$(".contents button");
      await submitButton.click();
    });

    it("경로 이동 확인", checkPathForCreateAccount);

    it("비밀번호 정하기", async function () {
      const passwordInput = await app.client.$("#password-input");
      await passwordInput.setValue(PASSWORD);

      const passwordConfirmInput = await app.client.$(
        "#password-confirm-input"
      );
      await passwordConfirmInput.setValue(PASSWORD);

      const submitButton = await app.client.$('button[type="submit"]');
      await submitButton.click();
    });

    it("경로 이동 확인", checkPathForCreateAccount);

    it("개인키 복사하기", async function () {
      const copyPrivateKeyButton = await app.client.$("#copy-private-key");
      await copyPrivateKeyButton.click();

      privateKey = await app.client.getClipboard();
    });

    it("경로 이동 확인", checkPathForCreateAccount);
  });

  describe("앱 종료하고 다시 실행하기", async function () {
    quitApp();
    app = await startApp();
  });

  async function goToResetPasswordPage(this: Mocha.Context, done: Mocha.Done) {
    const resetPasswordButton = await app.client.$("#reset-password");
    await resetPasswordButton.click();
  }

  describe("비밀번호 바꾸기", async function () {
    const history: string[] = [];
    const checkPathForPasswordChange = checkPath({ app, history, isWindows });

    it("경로 이동 확인", checkPathForPasswordChange);

    it("로그인 페이지에서 비밀번호 변경 페이지로 가기", goToResetPasswordPage);

    it("경로 이동 확인", checkPathForPasswordChange);

    it("개인키 입력하기", async function () {
      const privateKeyInput = await app.client.$("#privateKey-input");
      await privateKeyInput.setValue(privateKey);

      const submitButton = await app.client.$("#submit");
      await submitButton.click();
    });

    it("경로 이동 확인", checkPathForPasswordChange);

    it("새로운 비밀번호 입력", async function () {
      const passwordInput = await app.client.$('input[name="password"]');
      await passwordInput.setValue(newPassword);

      const passwordConfirmInput = await app.client.$(
        'input[name="passwordConfirm"]'
      );
      await passwordConfirmInput.setValue(newPassword);

      const submitButton = await app.client.$('button[type="submit"]');
      await submitButton.click();
    });

    it("경로 이동 확인", checkPathForPasswordChange);

    it("새로운 비밀번호로 로그인하기", async function () {
      const passwordInput = await app.client.$('input[type="password"]');
      await passwordInput.setValue(newPassword);

      const submitButton = await app.client.$('button[type="submit"]');
      await submitButton.click();
    });

    it("경로 이동 확인", checkPathForPasswordChange);
  });

  describe("앱 종료하고 다시 실행하기", async function () {
    quitApp();
    app = await startApp();
  });

  describe("키 무효화하기", async function () {
    const lastPath = "/main";
    const history: string[] = [];
    const checkPathForRevokeKey = checkPath({
      app,
      lastPath,
      history,
      isWindows,
    });

    it("로그인 페이지에서 비밀번호 변경 페이지로 가기", goToResetPasswordPage);

    it("키 무효화 페이지로 이동하기", async function () {
      const revokeKeyButton = await app.client.$("#revoke-key");
      await revokeKeyButton.click();
    });

    it("키 무효화 동의하기", async function () {
      const submitButton = await app.client.$("#revoke-key");
      await submitButton.click();
    });
  });

  it("환영 페이지로 갔는지 확인하기", async function () {
    const pathname = await app.webContents.executeJavaScript(
      "location.pathname"
    );
    if (typeof pathname !== "string")
      throw Error("현재 경로를 가져오지 못했습니다");

    expect(pathname).to.include("/main");
  });

  after("앱 종료하기", quitApp);
});

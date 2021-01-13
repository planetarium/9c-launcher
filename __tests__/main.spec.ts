import path from "path";
import fs from "fs";

import { Application } from "spectron";
import electron from "electron";

import "dotenv/config";
import { expect } from "chai";

const isWindows = process.platform === "win32";
const lastPath = "/lobby";
const snapshotDir = path.join(__dirname, "snapshots");
const logsDir = path.join(__dirname, "logs");

if (!fs.existsSync(snapshotDir)) fs.mkdirSync(snapshotDir);
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

// @ts-ignore
process.env.ELECTRON_IS_DEV = 0;

const { PASSWORD } = process.env;

if (PASSWORD === undefined) throw Error("failed to load password from .env");

describe("test", function () {
  this.timeout(30 * 1000);

  let app: Application;
  const history: string[] = [];

  before(function () {
    app = new Application({
      path: (electron as unknown) as string,
      args: [path.join(__dirname, "..", "dist")],
    });
    return app.start();
  });

  afterEach(async function () {
    const pathname = await app.webContents.executeJavaScript(
      "location.pathname"
    );
    if (typeof pathname !== "string")
      throw Error("현재 경로를 가져오지 못했습니다");

    if (pathname.includes("/error"))
      throw Error(
        `오류 페이지로 이동이 되었습니다. 이동한 오류 페이지 경로는 "${pathname}" 입니다.`
      );

    if (history.length === 0) {
      history.push(pathname);
      return;
    }

    const perviousPath = history[history.length - 1];

    if (perviousPath.includes(lastPath) && pathname.includes(lastPath)) return;

    if (perviousPath === pathname)
      throw Error(
        `"${
          isWindows ? pathname.slice(3) : pathname
        }"에서 다음 페이지로 이동에 실패했습니다.`
      );

    history.push(pathname);
  });

  it("로그인 하기", async function () {
    await app.client.saveScreenshot(path.join(snapshotDir, `login.png`));

    const inputPassword = await app.client.$('input[type="password"]');
    await inputPassword.setValue(PASSWORD);

    const submitButton = await app.client.$('button[type="submit"]');
    await submitButton.click();
  });

  it("마이닝 끄기", async function () {
    const miningOffButton = await app.client.$("#mining-off");

    await app.client.saveScreenshot(path.join(snapshotDir, `mining.png`));
    await miningOffButton.click();
  });

  it("로비 뷰에서 실행 버튼 기다리기", async function () {
    await app.client.saveScreenshot(path.join(snapshotDir, `lobby.png`));

    const submitButton = await app.client.$("#start-game");
    const text = await submitButton.getText();
    expect(text).to.equal("NOW RUNNING...");
  });

  after(async function () {
    if (app?.isRunning()) {
      const mainLogFile = await fs.promises.open(
        path.join(logsDir, "main.log"),
        "w"
      );
      const rendererLogFile = await fs.promises.open(
        path.join(logsDir, "render.log"),
        "w"
      );

      for (const log of await app.client.getMainProcessLogs()) {
        mainLogFile.write(log);
        mainLogFile.write("\n");
      }

      type Log = {
        level: unknown;
        message: string;
        source: string;
        timestamp: unknown;
      };

      for (const log of (await app.client.getRenderProcessLogs()) as Log[]) {
        rendererLogFile.write(`[${log.level}] ${log.message}`);
        rendererLogFile.write("\n");
      }

      return app.mainProcess.exit(0);
    }
  });
});

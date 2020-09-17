import path from "path";

import { Application } from "spectron";
import electron from "electron";

export async function startApp() {
  const app = new Application({
    path: (electron as unknown) as string,
    args: [path.join(__dirname, "..", "dist")],
  });
  await app.start();
  return app;
}

interface CheckPathProps {
  app: Application;
  lastPath?: string;
  history: string[];
  isWindows: boolean;
}

export function checkPath({
  app,
  lastPath,
  history,
  isWindows,
}: CheckPathProps) {
  return async function () {
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

    if (
      lastPath &&
      perviousPath.includes(lastPath) &&
      pathname.includes(lastPath)
    )
      return;

    if (perviousPath === pathname)
      throw Error(
        `"${
          isWindows ? pathname.slice(3) : pathname
        }"에서 다음 페이지로 이동에 실패했습니다.`
      );

    history.push(pathname);
  };
}

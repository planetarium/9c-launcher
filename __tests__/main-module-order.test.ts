import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import ts from "typescript";

/**
 * src/main/main.ts 는 모듈 평가 중에 initializeConfig() 등을 바로 호출한다
 * (requestSingleInstanceLock 블록). 그 호출보다 아래에 선언된 최상위 const/let 을
 * 초기화 경로에서 읽으면 첫 실행에서 TDZ ReferenceError 가 난다.
 * 2.8.8 인터널: "Cannot access 'Xt' before initialization" — Retry 해야만 진입되던 회귀.
 *
 * 함수 선언은 호이스팅되므로 상관없고, 최상위 변수 선언만 호출보다 위에 있어야 한다.
 */

const MAIN_TS = path.join(__dirname, "../src/main/main.ts");

function topLevelStatements() {
  const source = ts.createSourceFile(
    MAIN_TS,
    fs.readFileSync(MAIN_TS, "utf-8"),
    ts.ScriptTarget.Latest,
    true,
  );
  return { source, statements: source.statements };
}

describe("src/main/main.ts module order", () => {
  it("모듈 평가 중 initializeConfig() 를 호출하는 최상위 문보다 아래에 최상위 변수 선언이 없다", () => {
    const { source, statements } = topLevelStatements();

    const initIndex = statements.findIndex(
      (s) =>
        !ts.isFunctionDeclaration(s) &&
        /\binitializeConfig\(\)/.test(s.getText(source)),
    );
    expect(initIndex).toBeGreaterThanOrEqual(0);

    const lateVariables = statements
      .slice(initIndex + 1)
      .filter(ts.isVariableStatement)
      .map((s) => s.getText(source).split("\n")[0]);

    expect(lateVariables).toEqual([]);
  });
});

import { execSync } from "child_process";

export class StandaloneSubcommand {
  private readonly _executablePath: string;

  constructor(executablePath: string) {
    this._executablePath = executablePath;
  }

  protected execSync(...args: string[]): string {
    return execSync([`"${this._executablePath}"`, ...args].join(" "), {
      encoding: "utf-8",
    });
  }
}

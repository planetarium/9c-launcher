import { execFileSync } from "child_process";
import { dirname, basename } from "path";

export class StandaloneSubcommand {
  private readonly _executablePath: string;

  constructor(executablePath: string) {
    this._executablePath = executablePath;
  }

  protected execSync(...args: string[]): string {
    return execFileSync(basename(this._executablePath), args, {
      encoding: "utf-8",
      cwd: dirname(this._executablePath),
    });
  }
}

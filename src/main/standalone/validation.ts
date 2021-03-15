import { execSync } from "child_process";

export class Validation {
  private readonly _headlessPath: string;

  constructor(headlessPath: string) {
    this._headlessPath = headlessPath;
  }

  public isValidPrivateKey(privateKeyHex: string): boolean {
    try {
      this.execSync(["validation", "private-key", `"${privateKeyHex}"`]);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  private execSync(args: string[]): string {
    return execSync(`"${this._headlessPath}" ${args.join(" ")}`, {
      encoding: "utf-8",
    });
  }
}

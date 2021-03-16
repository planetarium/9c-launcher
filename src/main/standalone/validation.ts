import { execSync } from "child_process";
import { StandaloneSubcommand } from "./subcommand";

export class Validation extends StandaloneSubcommand {
  public isValidPrivateKey(privateKeyHex: string): boolean {
    try {
      this.execSync("validation", "private-key", `"${privateKeyHex}"`);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}

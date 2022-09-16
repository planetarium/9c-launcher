import { IApv } from "src/interfaces/apv";
import { StandaloneSubcommand } from "./subcommand";

export class Apv extends StandaloneSubcommand {
  public query(peerInfo: string): string | null {
    try {
      return this.execSync("apv", "query", peerInfo);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public analyze(apvToken: string): IApv {
    const raw = JSON.parse(this.execSync("apv", "analyze", "--json", apvToken));
    return {
      raw: apvToken.replace("\r\n", ""),
      version: parseInt(raw["version"]),
      signature: raw["signature"],
      signer: raw["signer"],
      extra: Object.keys(raw).reduce((result, item) => {
        if (item.startsWith("extra.")) {
          result[item.replace("extra.", "")] = raw[item];
        }
        return result;
      }, {} as { [k: string]: string }),
    };
  }

  public verify(publicKeys: string[], apvToken: string): boolean {
    try {
      this.execSync(
        ...[
          "apv",
          "verify",
          publicKeys.map((k) => ["-p", k]).flat(),
          apvToken,
        ].flat()
      );
      return true;
    } catch {
      return false;
    }
  }
}

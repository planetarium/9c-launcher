import { StandaloneSubcommand } from "./subcommand";

export class Tx extends StandaloneSubcommand {
  public Sign(
    privateKeyHex: string,
    nonce: number,
    genesisHash: string,
    timeStamp: string,
    actions: string
  ) {
    return this.spawnSync(
      "tx",
      privateKeyHex,
      String(nonce),
      genesisHash,
      timeStamp,
      "-a",
      `${actions}`
    );
  }
}

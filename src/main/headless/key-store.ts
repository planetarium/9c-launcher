import { StandaloneSubcommand } from "./subcommand";

const parseProtectedPrivateKeyLine = (line: string): ProtectedPrivateKey => {
  const splited = line.trimRight().split(" ");
  if (splited.length !== 2) {
    throw new RangeError();
  }

  return {
    keyId: splited[0],
    address: splited[1],
  };
};

function parseRawPrivateKeyLine(line: string): RawPrivateKey {
  const splited = line.trimRight().split(" ");
  if (splited.length !== 2) {
    throw new RangeError();
  }

  return {
    privateKey: splited[0],
    address: splited[1],
  };
}

export type KeyId = string;
export type Address = string;
export type PrivateKey = string;

export type ProtectedPrivateKey = { keyId: KeyId; address: Address };
export type RawPrivateKey = { privateKey: string; address: Address };

export class KeyStore extends StandaloneSubcommand {
  list(): ProtectedPrivateKey[] {
    try {
      return this.execSync("key")
        .trimRight()
        .split("\n")
        .map(parseProtectedPrivateKeyLine);
    } catch (error) {
      if (error instanceof RangeError) {
        return [];
      }

      throw error;
    }
  }

  unprotectPrivateKey(keyId: KeyId, passphrase: string): PrivateKey {
    return this.execSync(
      "key",
      "export",
      keyId,
      "--passphrase",
      passphrase
    ).trimRight();
  }

  createProtectedPrivateKey(passphrase: string): ProtectedPrivateKey {
    return parseProtectedPrivateKeyLine(
      this.execSync("key", "create", "--passphrase", passphrase).trimRight()
    );
  }

  generateRawKey(): RawPrivateKey {
    return parseRawPrivateKeyLine(this.execSync("key", "generate").trimRight());
  }

  importPrivateKey(privateKey: PrivateKey, passphrase: string): void {
    this.execSync("key", "import", "--passphrase", passphrase, privateKey);
  }

  revokeProtectedPrivateKey(keyId: KeyId): void {
    this.execSync("key", "remove", keyId, "--no-passphrase");
  }

  convertPrivateKey(
    privateKey: PrivateKey,
    targetType: "address" | "public-key"
  ) {
    return this.execSync(
      "key",
      "convert",
      `--${targetType}`,
      privateKey
    ).trim();
  }
}

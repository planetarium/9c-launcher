import { execSync } from "child_process";

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

export type KeyId = string;
export type Address = string;
export type PrivateKey = string;

export type ProtectedPrivateKey = { keyId: KeyId; address: Address };

export class KeyStore {
  private readonly _executablePath: string;

  constructor(executablePath: string) {
    console.log("executablePath", executablePath);
    this._executablePath = executablePath;
  }

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
      `key export ${keyId} --passphrase "${passphrase}"`
    ).trimRight();
  }

  createProtectedPrivateKey(passphrase: string): ProtectedPrivateKey {
    return parseProtectedPrivateKeyLine(
      this.execSync(`key create --passphrase "${passphrase}"`).trimRight()
    );
  }

  revokeProtectedPrivateKey(keyId: KeyId): void {
    this.execSync(`key remove ${keyId} --no-passphrase`);
  }

  private execSync(...args: string[]): string {
    return execSync([`"${this._executablePath}"`, ...args].join(" "), {
      encoding: "utf-8",
    });
  }
}

import {
  Address,
  ExportableAccount,
  PublicKey,
  RawPrivateKey,
} from "@planetarium/account";
import {
  KeyId,
  PassphraseEntry,
  Web3Account,
  Web3KeyStore,
  getDefaultWeb3KeyStorePath,
} from "@planetarium/account-web3-secret-storage";
// FIXME these imports cause matter since file-system related features aren't
// possible on some targets (e.g., browser). thus we should extract them from
// this store to the dedicated backend, and inject that into this.
import fs from "fs";
import path from "path";
import { action, observable, computed, makeAutoObservable } from "mobx";
import { app } from "@electron/remote";
import { RootStore } from "src/utils/useStore";

export interface ILoginSession {
  address: Address;
  publicKey: PublicKey;
  privateKey: RawPrivateKey;
}

export async function getKeyStorePath(): Promise<string> {
  const keyStorePath = getDefaultWeb3KeyStorePath();

  if (process.platform === "darwin") {
    // macOS: Migrate the keystore from the legacy path to the new path.
    //   legacy path: $HOME/Library/Application Support/planetarium/keystore
    //   new path:    $XDG_DATA_HOME/planetarium/keystore
    const legacyPath = path.join(
      app.getPath("appData"),
      "planetarium",
      "keystore",
    );

    // If the legacy keystore directory exists but is already migrated,
    // just use the new keystore directory:
    try {
      await fs.promises.stat(path.join(legacyPath, "__MIGRATED__"));
      return keyStorePath;
    } catch (e) {
      if (typeof e !== "object" || e.code !== "ENOENT") throw e;
    }

    let dir: fs.Dir;
    try {
      dir = await fs.promises.opendir(legacyPath);
    } catch (e) {
      if (typeof e === "object" && e.code === "ENOENT") {
        return keyStorePath;
      }

      throw e;
    }

    const pattern =
      /^(?:UTC--([0-9]{4}-[0-9]{2}-[0-9]{2})T([0-9]{2}-[0-9]{2}-[0-9]{2})Z--)?([0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12})(?:.json)?$/i;
    for await (const dirEntry of dir) {
      if (!dirEntry.isFile()) continue;
      const match = pattern.exec(dirEntry.name);
      if (match === null) continue;
      await fs.promises.copyFile(
        path.join(legacyPath, dirEntry.name),
        path.join(keyStorePath, dirEntry.name),
      );
    }

    // Mark the keystore as migrated:
    await fs.promises.writeFile(
      path.join(legacyPath, "__MIGRATED__"),
      `All key files in this directory are migrated to the new path.
This file is used to prevent the keystore from being migrated again.
See also: ${keyStorePath}
Migrated at: ${new Date().toISOString()}\n`,
    );
  }

  return keyStorePath;
}

export default class AccountStore {
  private _privateKeyToRecovery: RawPrivateKey | null = null;
  rootStore: RootStore;

  @action
  async getKeyStore(passphrase: string | undefined): Promise<Web3KeyStore> {
    const passphraseEntry: PassphraseEntry = {
      authenticate(keyId: string, firstAttempt: boolean): Promise<string> {
        if (passphrase === undefined) throw new Error("No passphrase given.");
        if (firstAttempt) return Promise.resolve(passphrase);
        throw new Error("Incorrect passphrase.");
      },
      configurePassphrase(): Promise<string> {
        if (passphrase === undefined) throw new Error("No passphrase given.");
        return Promise.resolve(passphrase);
      },
    };
    return new Web3KeyStore({ passphraseEntry, path: await getKeyStorePath() });
  }

  @computed
  public get isLogin(): boolean {
    return this.loginSession != null;
  }

  @observable
  public activationCode: string = "";

  @observable
  public loginSession: ILoginSession | null = null;

  @observable
  public addresses: Address[] = [];

  @observable
  public isInitialized: boolean = false;

  constructor(RootStore: RootStore) {
    this.getKeyStore(undefined).then(async (keyStore) => {
      for await (const keyMetadata of keyStore.list()) {
        const address = keyMetadata.metadata.address;
        if (address == null) continue;
        this.addresses.push(address);
      }
      this.isInitialized = true;
    });
    makeAutoObservable(this);
    this.rootStore = RootStore;
  }

  @action
  login = async (account: ExportableAccount, password: string) => {
    const privateKey = await account.exportPrivateKey();
    const publicKey = await privateKey.getPublicKey();
    this.loginSession = {
      privateKey,
      publicKey,
      address: Address.deriveFrom(publicKey),
    };
  };

  getAccount = async (
    address: string | Address,
    passphrase: string,
  ): Promise<RawPrivateKey | undefined> => {
    const keyId = await this.findKeyIdByAddress(address);
    if (keyId == null) return undefined;
    const keyStore = await this.getKeyStore(passphrase);
    const result = await keyStore.get(keyId);
    if (result.result === "keyNotFound") return undefined;
    else if (result.result === "error") {
      console.error(result.message);
      return undefined;
    }
    return await result.account.exportPrivateKey();
  };

  @action
  public addAddress = (address: Address) => {
    this.addresses.push(address);
  };

  @action
  removeKeyByAddress = async (address: Address) => {
    const keyId = await this.findKeyIdByAddress(address);
    if (keyId != null) {
      const keyStore = await this.getKeyStore(undefined);
      await keyStore.delete(keyId);
      this.addresses = this.addresses.filter((a) => !a.equals(address));
    }
  };

  @action
  setActivationCode = (activationCode: string) => {
    this.activationCode = activationCode;
  };

  isEmpty = async (): Promise<boolean> => {
    const keyStore = await this.getKeyStore(undefined);
    for await (const _ of keyStore.list()) return false;
    return true;
  };

  findKeyIdByAddress = async (
    address: string | Address,
  ): Promise<KeyId | undefined> => {
    if (typeof address === "string") {
      try {
        address = Address.fromHex(address, true);
      } catch (e) {
        // Invalid address
        return undefined;
      }
    }
    const keyStore = await this.getKeyStore(undefined);
    for await (const entry of keyStore.list()) {
      if (entry.metadata.address?.equals(address)) return entry.keyId;
    }
    return undefined;
  };

  //TODO: This function solely depending on behavior that
  //addV3 push to end of the array, we need to fix that.
  @action
  importRaw = async (
    privateKeyHex: string | RawPrivateKey,
    passphrase: string,
  ): Promise<Web3Account> => {
    const keyStore = await this.getKeyStore(passphrase);
    const privateKey =
      typeof privateKeyHex === "string"
        ? RawPrivateKey.fromHex(privateKeyHex)
        : privateKeyHex;
    const result = await keyStore.import(privateKey);
    if (result.result === "error") {
      throw new Error(result.message);
    }
    const account = await keyStore.get(result.keyId);
    if (account.result !== "success") {
      // Must be unreachable
      throw new Error(
        account.result === "error"
          ? account.message
          : "Key not found; something went wrong",
      );
    }
    this.addAddress(await account.account.getAddress());
    return account.account;
  };

  isValidPrivateKey = (privateKeyHex: string): boolean => {
    try {
      RawPrivateKey.fromHex(privateKeyHex);
    } catch (e) {
      return false;
    }
    return true;
  };

  beginRecovery = (privateKey: string | RawPrivateKey) => {
    if (this._privateKeyToRecovery) {
      throw new Error("There is another recovery in progress.");
    }

    this._privateKeyToRecovery =
      typeof privateKey === "string"
        ? RawPrivateKey.fromHex(privateKey)
        : privateKey;
  };

  completeRecovery = async (passphrase: string): Promise<Web3Account> => {
    if (!this._privateKeyToRecovery) {
      throw new Error("There is no recovery in progress.");
    }

    const address = await Address.deriveFrom(this._privateKeyToRecovery);
    const existingKeyId = await this.findKeyIdByAddress(address);
    const account = await this.importRaw(
      this._privateKeyToRecovery,
      passphrase,
    );

    if (existingKeyId != null) {
      const keyStore = await this.getKeyStore(undefined);
      await keyStore.delete(existingKeyId);
    }

    this._privateKeyToRecovery = null;
    return account;
  };

  @action
  exportKeystore = async () => {
    if (this.isLogin) {
      const address = this.loginSession!.address.toHex();
      const keyId = await this.findKeyIdByAddress(address);
      const dir = await getKeyStorePath();
      try {
        if (typeof keyId !== "string") {
          throw Error("Failed to get keyId from address");
        }
        const files = await fs.promises.readdir(dir);

        for (const file of files) {
          if (file.includes(keyId)) {
            const filePath = path.join(dir, file);
            const data = JSON.stringify(
              JSON.parse(await fs.promises.readFile(filePath, "ascii")),
            ); // parse -> stringify trip to minimize.
            return data;
          }
        }
        throw Error("No matching keyFile exists in keystore.");
      } catch (err) {
        console.error("Failed to load Web3 Secret Storage: ", err);
      }
    } else {
      console.error("Not logged in.");
    }
  };
}

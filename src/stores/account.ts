import {
  decipherV3,
  getAccountFromFile,
  listKeystoreFiles,
  rawPrivateKeyToV3,
  sanitizeKeypath,
  getDefaultKeystorePath,
  V3Keystore,
} from "@planetarium/account-local";
import { createAccount } from "@planetarium/account-raw";
import { Account, deriveAddress } from "@planetarium/sign";
import fs from "fs";
import path from "path";
import { action, observable } from "mobx";
import { Address, ProtectedPrivateKey } from "src/interfaces/keystore";
import { utils } from "@noble/secp256k1";

interface ILoginSession {
  account: Account;
  publicKey: string;
  address: string;
  privateKey: string;
}

export interface IAccountStore {
  keyring: ProtectedPrivateKey[];
  activationKey: string;
  loginSession: ILoginSession | null;
}

export default class AccountStore implements IAccountStore {
  private _privateKeyToRecovery: string | null = null;

  // Referenced mobxjs/mobx#669-comments
  // https://git.io/JJv8j
  @observable
  public readonly keyring = observable<ProtectedPrivateKey>([]);

  @observable
  public isLogin: boolean = false;

  @observable
  public activationKey: string = "";

  @observable
  public loginSession: ILoginSession | null = null;

  constructor() {
    this.setKeys(this.listKeyFiles());
  }

  @action
  login = async (account: Account, password: string) => {
    const bs = await account.getPublicKey(false);
    const address = await deriveAddress(account);

    this.loginSession = {
      account,
      publicKey: utils.bytesToHex(bs),
      address,
      privateKey: await this.loadPrivateKeyFromAddress(address, password),
    };
  };

  @action
  getAccount = (address: Address, passphrase: string): Promise<Account> => {
    return this.findKeyByAddress(address).then((key) => {
      return getAccountFromFile(key.keyId, passphrase);
    });
  };

  @action
  addKey = (protectedPrivateKey: ProtectedPrivateKey) => {
    this.keyring.push(protectedPrivateKey);
  };

  @action
  removeKey = (protectedPrivateKey: ProtectedPrivateKey) => {
    fs.rmSync(protectedPrivateKey.path);
    //Is Key Object comparable?
    this.keyring.remove(protectedPrivateKey);
  };

  @action
  removeKeyByAddress = (address: Address) => {
    this.keyring.forEach((key) => {
      if (key.address.replace("0x", "") === address) {
        this.removeKey(key);
      }
    });
  };

  @action
  setKeys = (keys: ProtectedPrivateKey[]) => {
    this.keyring.replace(keys);
  };

  @action
  setLoginStatus = (status: boolean) => {
    this.isLogin = status;
  };

  @action
  setActivationKey = (activationKey: string) => {
    this.activationKey = activationKey;
  };

  @action
  listKeyFiles = (): ProtectedPrivateKey[] => {
    try {
      return listKeystoreFiles().map((keyId: string) => {
        const key: V3Keystore = JSON.parse(
          fs.readFileSync(path.resolve(sanitizeKeypath(), keyId), "utf8")
        );
        const ppk: ProtectedPrivateKey = {
          keyId: key.id,
          address: key.address,
          path: path.resolve(sanitizeKeypath(), keyId),
        };
        return ppk;
      });
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  @action
  findKeyByAddress = (address: Address): Promise<ProtectedPrivateKey> => {
    return new Promise<ProtectedPrivateKey>((resolve, reject) => {
      const key = this.keyring.find((key) => {
        return (
          key.address.replace("0x", "") ===
          address.replace("0x", "").toLowerCase()
        );
      });
      if (key !== undefined) {
        resolve(key);
      } else {
        reject(
          Error(`No key file found matching with provided address: ${address}`)
        );
      }
    });
  };

  //TODO: This function solely depending on behavior that
  //addV3 push to end of the array, we need to fix that.
  @action
  importRaw = async (privateKey: string, passphrase: string) => {
    const keystorePath = getDefaultKeystorePath(process.platform);

    if (!fs.existsSync(keystorePath)) {
      await fs.promises.mkdir(keystorePath, { recursive: true });
    }

    const v3 = await rawPrivateKeyToV3(privateKey, passphrase);

    if (v3 !== undefined) {
      const filePath = path.resolve(
        keystorePath,
        [
          "UTC--",
          new Date().toJSON().replace(/:/g, "-").slice(0, -5),
          "Z",
          "--",
          v3.id,
        ].join("")
      );
      await fs.promises.writeFile(filePath, JSON.stringify(v3));
      this.addKey({
        keyId: v3.id,
        address: v3.address,
        path: filePath,
      });
      return await getAccountFromFile(v3.id, passphrase);
    } else {
      throw Error("Importing raw private key to V3 file failed.");
    }
  };

  @action
  isValidPrivateKey = (privateKey: string): boolean => {
    try {
      createAccount(privateKey);
    } catch (e) {
      return false;
    }
    return true;
  };

  loadPrivateKeyFromAddress = async (
    address: Address,
    password: string
  ): Promise<string> => {
    const key = await this.findKeyByAddress(address);
    const raw = decipherV3(
      await fs.promises.readFile(key.path, "utf8"),
      password
    ).getPrivateKey();

    return utils.bytesToHex(raw);
  };

  beginRecovery = (privateKey: string) => {
    if (this._privateKeyToRecovery) {
      throw new Error("There is another recovery in progress.");
    }

    this._privateKeyToRecovery = privateKey;
  };

  completeRecovery = async (passphrase: string) => {
    if (!this._privateKeyToRecovery) {
      throw new Error("There is no recovery in progress.");
    }

    return await this.importRaw(this._privateKeyToRecovery, passphrase);
  };
}

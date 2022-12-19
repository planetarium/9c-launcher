import {
  decipherV3,
  getAccountFromFile,
  listKeystoreFiles,
  rawPrivateKeyToV3,
  sanitizeKeypath,
  V3Keystore,
} from "@planetarium/account-local";
import { createAccount, isValidPrivateKey } from "@planetarium/account-raw";
import { Account } from "@planetarium/sign";
import fs from "fs";
import path from "path";
import { Buffer } from "buffer";
import { action, observable } from "mobx";
import { Address, ProtectedPrivateKey } from "src/interfaces/keystore";
import { utils } from "@noble/secp256k1";

export interface IAccountStore {
  keyring: ProtectedPrivateKey[];
  account: Account;
  address: Address;
  isLogin: boolean;
  activationKey: string;
}

export default class AccountStore implements IAccountStore {
  // WE SHOULD NOT STORE PRIVATE KEY NOT EVEN MOMENTARILY.
  private privateKey: Buffer = Buffer.alloc(32, "0");

  // Referenced mobxjs/mobx#669-comments
  // https://git.io/JJv8j
  @observable
  public readonly keyring = observable<ProtectedPrivateKey>([]);

  @observable
  public account: Account = createAccount();

  @observable
  public address: Address = "";

  @observable
  public isLogin: boolean = false;

  @observable
  public activationKey: string = "";

  constructor() {
    this.setKeys(this.listKeyFiles());
  }

  @action
  setAccount = (account: Account) => {
    this.account = account;
  };

  @action
  getAccount = (address: Address, passphrase: string): Promise<Account> => {
    return this.findKeyByAddress(address).then((key) => {
      this.address = address;
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
  toggleLogin = () => {
    this.isLogin = !this.isLogin;
  };

  @action
  setActivationKey = (activationKey: string) => {
    this.activationKey = activationKey;
  };

  @action
  listKeyFiles = (): ProtectedPrivateKey[] => {
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
  importRaw = (privateKey: string, passphrase: string) => {
    return rawPrivateKeyToV3(privateKey, passphrase).then((v3) => {
      if (v3 !== undefined) {
        const filePath = path.resolve(
          sanitizeKeypath(),
          [
            "UTC--",
            new Date().toJSON().replace(/:/g, "-").slice(0, -5),
            "Z",
            "--",
            v3.id,
          ].join("")
        );
        fs.writeFileSync(filePath, JSON.stringify(v3));
        this.addKey({
          keyId: v3.id,
          address: v3.address,
          path: filePath,
        });
        this.address = v3.address;
        getAccountFromFile(v3.id, passphrase).then((account) =>
          this.setAccount(account)
        );
      } else {
        throw Error("Importing raw private key to V3 file failed.");
      }
    });
  };

  @action
  generatePrivateKey = () => {
    this.setPrivateKey(utils.bytesToHex(utils.randomPrivateKey()));
  };

  @action
  setPrivateKey = (privateKeyHex: string) => {
    if (isValidPrivateKey(privateKeyHex)) {
      this.privateKey = Buffer.from(privateKeyHex, "hex");
    }
  };

  @action
  setPrivateKeyFromAddress = (address: Address, password: string) => {
    this.findKeyByAddress(address).then((key) => {
      this.privateKey = decipherV3(
        fs.readFileSync(key.path, "utf8"),
        password
      ).getPrivateKey();
    });
  };

  // NO. REMOVE. THIS.
  @action
  getPrivateKeyAndForget = () => {
    return new Promise<string>((resolve, reject) => {
      if (this.privateKey.toString("hex") === "0".repeat(64)) {
        reject();
      } else {
        resolve(this.privateKey.toString("hex"));
      }
    }).finally(() => (this.privateKey = Buffer.alloc(32, "0")));
  };
}

import {
  getAccountFromFile,
  listKeystoreFiles,
  rawPrivateKeyToV3,
  sanitizeKeypath,
  V3Keystore,
} from "@planetarium/account-local";
import { createAccount } from "@planetarium/account-raw";
import { Account, deriveAddress } from "@planetarium/sign";
import fs from "fs";
import path from "path";
import { Buffer } from "buffer";
import { action, observable } from "mobx";
import { Address, ProtectedPrivateKey } from "src/interfaces/keystore";
import { utils } from "@noble/secp256k1";
import { decipherV3 } from "@planetarium/account-local/dist/v3";

export interface IAccountStore {
  V3Keys: ProtectedPrivateKey[];
  selectedAddress: Address;
  isLogin: boolean;
  activationKey: string;
}

export default class AccountStore implements IAccountStore {
  // WE SHOULD NOT STORE PRIVATE KEY NOT EVEN MOMENTARILY.
  private privateKey: Buffer = Buffer.alloc(32, "0");
  private password: Buffer = Buffer.from("", "base64");

  // Referenced mobxjs/mobx#669-comments
  // https://git.io/JJv8j
  @observable
  public readonly V3Keys = observable<ProtectedPrivateKey>([]);

  @observable
  public selectedAddress: Address = "";

  @observable
  public isLogin: boolean = false;

  @observable
  public activationKey: string = "";

  constructor() {
    this.setV3s(this.listV3());
    if (this.selectedAddress.length !== 0) {
      this.selectedAddress = this.V3Keys[0].address;
    }
  }

  @action
  setSelectedAddress = (address: Address) => {
    this.selectedAddress = address;
  };

  @action
  addV3 = (protectedPrivateKey: ProtectedPrivateKey) => {
    this.V3Keys.push(protectedPrivateKey);
  };

  @action
  removeV3 = (protectedPrivateKey: ProtectedPrivateKey) => {
    fs.rmSync(protectedPrivateKey.path);
    //Is V3Key Object comparable?
    this.V3Keys.remove(protectedPrivateKey);
  };

  @action
  removeV3ByAddress = (address: Address) => {
    this.V3Keys.forEach((key) => {
      if (key.address.replace("0x", "") === address) {
        this.removeV3(key);
      }
    });
  };

  @action
  setV3s = (V3s: ProtectedPrivateKey[]) => {
    this.V3Keys.replace(V3s);
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
  listV3 = (): ProtectedPrivateKey[] => {
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
  getAccount = (address: Address, passphrase: string): Promise<Account> => {
    const key = this.V3Keys.find(
      (key) => key.address.replace("0x", "") === address
    );
    if (!key) {
      throw Error("No key file found matching with provided address");
    }
    return getAccountFromFile(key.path, passphrase);
  };

  //TODO: This function solely depending on behavior that
  //addV3 push to end of the array, we need to fix that.
  @action
  importRaw = (privateKey: string, passphrase: string) => {
    return rawPrivateKeyToV3(privateKey, passphrase).then((v3) => {
      if (v3 !== undefined) {
        const temp: V3Keystore = JSON.parse(v3.data);
        const filePath = path.resolve(sanitizeKeypath(), v3.filename);
        fs.writeFileSync(filePath, v3.data);
        this.addV3({
          keyId: temp.id,
          address: temp.address,
          path: filePath,
        });
        this.setSelectedAddress(temp.address);
      } else {
        throw Error("Importing raw private key to V3 file failed.");
      }
    });
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

  @action
  generatePrivateKey = () => {
    this.setPrivateKey(utils.bytesToHex(utils.randomPrivateKey()));
  };

  @action
  setPrivateKey = async (privateKeyHex: string) => {
    if (this.isValidPrivateKey(privateKeyHex)) {
      this.privateKey = Buffer.from(privateKeyHex, "hex");
    }
    this.setSelectedAddress(await deriveAddress(createAccount(privateKeyHex)));
  };

  // NO. REMOVE. THIS. 1
  @action
  setPassword = (password: string) => {
    this.password = Buffer.from(password, "base64");
  };

  // NO. REMOVE. THIS. 2
  @action
  getPassword = () =>
    new Promise<string>((resolve) =>
      resolve(this.password.toString("base64"))
    ).finally(() => this.password.fill("0"));

  // NO. REMOVE. THIS. 3
  @action
  getSelectedKeyAndForget = () => {
    const key = this.V3Keys.find((key) => key.address === this.selectedAddress);
    this.privateKey = decipherV3(
      fs.readFileSync(key!.path, "utf8"),
      this.getPassword()
    ).getPrivateKey();
    return this.getPrivateKeyAndForget();
  };

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

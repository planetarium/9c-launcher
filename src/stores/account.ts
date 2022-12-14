import fs from "fs";
import path from "path";
import { createAccount } from "@planetarium/account-raw";
import {
  listKeystoreFiles,
  sanitizeKeypath,
  V3Keystore,
  rawPrivateKeyToV3,
} from "@planetarium/account-local";
import { deriveAddress } from "@planetarium/sign";
import {
  Address,
  PrivateKey,
  ProtectedPrivateKey,
} from "src/interfaces/keystore";
import { observable, action } from "mobx";

export interface IAccountStore {
  addresses: Address[];
  privateKey: PrivateKey;
  selectedAddress: Address;
  isLogin: boolean;
  activationKey: string;
}

export default class AccountStore implements IAccountStore {
  // Referenced mobxjs/mobx#669-comments
  // https://git.io/JJv8j
  public readonly addresses = observable<string>([]);

  @observable
  public privateKey: string = "";

  @observable
  public selectedAddress: string = "";

  @observable
  public isLogin: boolean = false;

  @observable
  public activationKey: string = "";

  @action
  setPrivateKey = (privateKey: string) => {
    this.privateKey = privateKey;
  };

  @action
  setSelectedAddress = (address: string) => {
    this.selectedAddress = address;
  };

  @action
  addAddress = (address: string) => {
    this.addresses.push(address);
  };

  @action
  removeAddress = (address: string) => {
    this.addresses.remove(address);
  };

  @action
  setAddresses = (addresses: string[]) => {
    this.addresses.replace(addresses);
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
  changeAddress = (index: number) => {
    if (index >= 0 && index < this.addresses.length) {
      this.selectedAddress = this.addresses[index];
    }
  };

  @action
  setActivationKey = (activationKey: string) => {
    this.activationKey = activationKey;
  };

  @action
  listPPK = (): ProtectedPrivateKey[] => {
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
  removePPK = (address: Address) => {
    const keyList: ProtectedPrivateKey[] = this.listPPK();
    keyList.forEach((key) => {
      if (key.address.replace("0x", "") === address) {
        fs.rmSync(key.path);
      }
    });
  };

  @action
  rawPPKToAddress = (privateKeyHex: PrivateKey): Promise<string> => {
    return deriveAddress(createAccount(privateKeyHex));
  };

  @action
  importV3 = (privateKey: PrivateKey, passphrase: string) => {
    const v3 = rawPrivateKeyToV3(privateKey, passphrase);
    fs.writeFileSync(path.resolve(sanitizeKeypath(), v3.filename), v3.data);
  };

  @action
  isValidPrivateKey = (privateKeyHex: PrivateKey): boolean => {
    try {
      createAccount(privateKeyHex);
    } catch (e) {
      return false;
    }
    return true;
  };
}

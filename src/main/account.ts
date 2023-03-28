import {
  decipherV3,
  getAccountFromFile,
  listKeystoreFiles,
  rawPrivateKeyToV3,
  sanitizeKeypath,
  getDefaultKeystorePath,
  V3Keystore,
} from "@planetarium/account-local";
import { SigningKey, Wallet } from "ethers";
import { createAccount } from "@planetarium/account-raw";
import { Account, deriveAddress } from "@planetarium/sign";
// FIXME these imports cause matter since file-system related features aren't
// possible on some targets (e.g., browser). thus we should extract them from
// this store to the dedicated backend, and inject that into this.
import fs from "fs";
import path from "path";
import { Address, ProtectedPrivateKey } from "src/interfaces/keystore";
import { V3toRaw } from "src/utils/web3key";
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
  private _privateKeyToRecovery: Buffer | null = null;

  // Referenced mobxjs/mobx#669-comments
  // https://git.io/JJv8j
  public keyring: ProtectedPrivateKey[] = [];

  public isLogin: boolean = false;

  public activationKey: string = "";

  public loginSession: ILoginSession | null = null;

  constructor() {
    this.setKeys(this.listKeyFiles());
  }

  public login = async (account: Account, password: string) => {
    const bs = await account.getPublicKey(false);
    const address = await deriveAddress(account);

    this.loginSession = {
      account,
      publicKey: utils.bytesToHex(bs),
      address,
      privateKey: (
        await this.loadPrivateKeyFromAddress(address, password)
      ).toString("hex"),
    };
  };

  public popKey = () => {
    if (this.keyring.length < 0) return;
    return this.keyring.pop();
  };

  public addKey = (protectedPrivateKey: ProtectedPrivateKey) => {
    this.keyring.push(protectedPrivateKey);
  };

  public removeKey = (protectedPrivateKey: ProtectedPrivateKey) => {
    fs.rmSync(protectedPrivateKey.path, { force: true });
    //Is Key Object comparable?
    this.keyring.remove(protectedPrivateKey);
  };

  public getAccount = async (
    address: Address,
    passphrase: string
  ): Promise<Account> => {
    const key = await this.findKeyByAddress(address);
    // Padding the existing key with the short length, created by Libplanet's previous bug.
    // see also: https://github.com/planetarium/9c-launcher/issues/2107
    await this.padShortKey(key, passphrase);
    return getAccountFromFile(key.keyId, passphrase);
  };

  removeKeyByAddress = (address: Address) => {
    this.keyring.forEach((key) => {
      if (
        key.address.replace("0x", "").toLowerCase() ===
        address.replace("0x", "").toLowerCase()
      ) {
        this.removeKey(key);
      }
    });
  };

  public setKeys = (keys: ProtectedPrivateKey[]) => {
    this.keyring = (keys);
  };

  public setLoginStatus = (status: boolean) => {
    this.isLogin = status;
  };

  public setActivationKey = (activationKey: string) => {
    this.activationKey = activationKey;
  };

  public listKeyFiles = (): ProtectedPrivateKey[] => {
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

  public findKeyByAddress = (
    address: Address
  ): Promise<ProtectedPrivateKey> => {
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
  public importRaw = async (privateKey: string, passphrase: string) => {
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

  public isValidPrivateKey = (privateKey: string): boolean => {
    try {
      createAccount(privateKey);
    } catch (e) {
      return false;
    }
    return true;
  };

  public loadPrivateKeyFromAddress = async (
    address: Address,
    password: string
  ): Promise<Buffer> => {
    const key = await this.findKeyByAddress(address);
    return decipherV3(
      await fs.promises.readFile(key.path, "utf8"),
      password
    ).getPrivateKey();
  };

  public beginRecovery = (privateKey: string) => {
    if (this._privateKeyToRecovery) {
      throw new Error("There is another recovery in progress.");
    }

    this._privateKeyToRecovery = Buffer.from(privateKey, "hex");
  };

  public completeRecovery = async (passphrase: string) => {
    if (!this._privateKeyToRecovery) {
      throw new Error("There is no recovery in progress.");
    }

    const account = await this.importRaw(
      this._privateKeyToRecovery.toString("hex"),
      passphrase
    );
    const address = await deriveAddress(account);
    if (this.keyring.length <= 0) {
      throw new Error("There's no key in keyring despite we just generated.");
    }

    const importedKey = this.popKey();
    this.removeKeyByAddress(address);
    this.addKey(importedKey!);

    // Wipe Buffer
    this._privateKeyToRecovery.fill(0);
    this._privateKeyToRecovery = null;
    return account;
  };

  // This function Basically Opens V3, Pad If Key Is Short, Switch V3 File Content Seamlessly With Padded Privkey.
  // 1. Decipher V3, Length Check.
  // 2. If Key Is Short, Zero-Pad Left Of Deciphered Key To Fill 32 byte.
  // 3. Generate New V3 With Padded Key and Previous Passphrase,
  // 4. Modify UUID of Newly Generated V3 to Previous UUID.
  // 5. Write Newly Padded, Same Passworded V3 to Original Path.
  public padShortKey = async (v: ProtectedPrivateKey, passphrase: string) => {
    const key = V3toRaw(await fs.promises.readFile(v.path, "utf8"), passphrase);
    if (key.length < 32) {
      fs.promises.writeFile(
        v.path,
        (
          await new Wallet(
            new SigningKey(
              Buffer.concat([Buffer.alloc(32 - key.length), key], 32)
            )
          ).encrypt(passphrase)
        )
          .replace(/"id":"[0-9A-z-]*"/, `"id":"${v.keyId}"`)
          .replace("Crypto", "crypto")
      );
      // Wipe Buffer for security concerns.
      // See also: https://github.com/planetarium/9c-launcher/pull/2112#discussion_r1128982145
      key.fill(0);
    }
  };
}

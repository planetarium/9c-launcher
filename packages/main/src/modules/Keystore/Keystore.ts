import {Address, ExportableAccount, PublicKey, RawPrivateKey} from '@planetarium/account';
import {
  getDefaultWeb3KeyStorePath,
  KeyId,
  PassphraseEntry,
  Web3Account,
  Web3KeyStore,
} from '@planetarium/account-web3-secret-storage';
import fs from 'fs';
import path from 'path';
import {homedir} from 'os';
import {getKeyStorePath} from '/@/constants/os';
import {BrowserWindow} from 'electron/main';
/**
 * Shim for same function in @planetarium/account-web3-secret-storage, due to node:os import issue.
 * Determines the default key store path.  It depends on the platform:
 */
export function getDefaultWeb3KeyStorePath(): string {
  const baseDir =
    process.platform === 'win32'
      ? process.env.AppData || path.join(homedir(), 'AppData', 'Roaming')
      : process.env.XDG_CONFIG_HOME || path.join(homedir(), '.config');
  // Note that it's not necessary to explicitly choose one of `path.win32` or
  // `path.posix` here, but it makes unit tests less dependent on mocks:
  return (process.platform === 'win32' ? path.win32 : path.posix).join(
    baseDir,
    'planetarium',
    'keystore',
  );
}

export interface ILoginSession {
  address: Address;
  publicKey: PublicKey;
  privateKey: RawPrivateKey;
}

export default class Keystore {
  private _hasLoginSession: boolean = false;
  private _addresses: Address[] = [];
  private _account: ExportableAccount | null = null;
  private _window: BrowserWindow;
  private _keyv: Keyv;
  public loginSession: ILoginSession | null = null;
  public isKeystoreInitialized: boolean = false;

  constructor(window: BrowserWindow, keyv: Keyv) {
    this._window = window;
    this._keyv = keyv;
    this.getKeyStore(undefined).then(async keyStore => {
      for await (const keyMetadata of keyStore.list()) {
        const address = keyMetadata.metadata.address;
        if (address == null) continue;
        this._addresses.push(address);
      }
      this.isKeystoreInitialized = true;

      console.log(
        'get-keys fired',
        this._addresses.map(v => {
          return v.toString();
        }),
      );
      this._window.webContents.on('did-finish-load', () => {
        window.webContents.send(
          'get-keys',
          this._addresses.map(v => {
            return v.toString();
          }),
        );
      });
    });
  }

  private async getKeyStore(passphrase: string | undefined): Promise<Web3KeyStore> {
    const passphraseEntry: PassphraseEntry = {
      authenticate(keyId: string, firstAttempt: boolean): Promise<string> {
        if (passphrase === undefined) throw new Error('No passphrase given.');
        if (firstAttempt) return Promise.resolve(passphrase);
        throw new Error('Incorrect passphrase.');
      },
      configurePassphrase(): Promise<string> {
        if (passphrase === undefined) throw new Error('No passphrase given.');
        return Promise.resolve(passphrase);
      },
    };
    return new Web3KeyStore({
      passphraseEntry,
      path: getDefaultWeb3KeyStorePath(),
      allowWeakPrivateKey: true,
    });
  }

  public async getAccount(
    address: string | Address,
    passphrase: string,
  ): Promise<RawPrivateKey | undefined> {
    const keyId = await this.findKeyIdByAddress(address);
    if (keyId == null) return undefined;
    const keyStore = await this.getKeyStore(passphrase);
    const result = await keyStore.get(keyId);
    if (result.result === 'keyNotFound') return undefined;
    else if (result.result === 'error') {
      console.error(result.message);
      return undefined;
    }
    return await result.account.exportPrivateKey();
  }

  public async login() {
    try {
      if (this._account == null) {
        throw new Error('Account not found.');
      }
      const privateKey = await this._account.exportPrivateKey();
      const publicKey = await this._account.getPublicKey();
      const address = Address.deriveFrom(publicKey);

      this.loginSession = {
        privateKey,
        publicKey,
        address,
      };
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  public findKeyIdByAddress = async (address: string | Address): Promise<KeyId | undefined> => {
    if (typeof address === 'string') {
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

  public removeKeyByAddress = async (address: Address) => {
    const keyId = await this.findKeyIdByAddress(address);
    if (keyId != null) {
      const keyStore = await this.getKeyStore(undefined);
      await keyStore.delete(keyId);
      this._addresses = this._addresses.filter(a => !a.equals(address));
    }
  };

  //TODO: This function solely depending on behavior that
  //addV3 push to end of the array, we need to fix that.
  public importRaw = async (
    privateKeyHex: string | RawPrivateKey,
    passphrase: string,
  ): Promise<Web3Account> => {
    const keyStore = await this.getKeyStore(passphrase);
    const privateKey =
      typeof privateKeyHex === 'string' ? RawPrivateKey.fromHex(privateKeyHex) : privateKeyHex;
    const result = await keyStore.import(privateKey);
    if (result.result === 'error') {
      throw new Error(result.message);
    }
    const account = await keyStore.get(result.keyId);
    if (account.result !== 'success') {
      // Must be unreachable
      throw new Error(
        account.result === 'error' ? account.message : 'Key not found; something went wrong',
      );
    }
    this._addresses.push(await account.account.getAddress());
    return account.account;
  };

  public exportKeystore = async () => {
    if (this._hasLoginSession) {
      const address = this.loginSession!.address.toHex();
      const keyId = await this.findKeyIdByAddress(address);
      const dir = await getKeyStorePath();
      try {
        if (typeof keyId !== 'string') {
          throw Error('Failed to get keyId from address');
        }
        const files = await fs.promises.readdir(dir);

        for (const file of files) {
          if (file.includes(keyId)) {
            const filePath = path.join(dir, file);
            const data = JSON.stringify(JSON.parse(await fs.promises.readFile(filePath, 'ascii'))); // parse -> stringify trip to minimize.
            return data;
          }
        }
        throw Error('No matching keyFile exists in keystore.');
      } catch (err) {
        console.error('Failed to load Web3 Secret Storage: ', err);
      }
    } else {
      console.error('Not logged in.');
    }
  };

  public isValidPrivateKey = (privateKeyHex: string): boolean => {
    try {
      RawPrivateKey.fromHex(privateKeyHex);
    } catch (e) {
      return false;
    }
    return true;
  };

  private registerEvents = (): void => {};
}

import { ChildProcess, execFileSync } from "child_process";
import { ipcMain } from "electron";
import { basename, dirname } from "path";
import { CUSTOM_SERVER } from "../../config";
import { execute, sleep } from "../../utils";
import { BlockMetadata } from "src/interfaces/block-header";
import { KeyStore } from "./key-store";
import { Validation } from "./validation";
import { Apv } from "./apv";
import { Tx } from "./tx";
import { Action } from "./action";

export const retryOptions = {
  delay: 100,
  factor: 1.5,
  maxAttempts: 100,
  timeout: 30000,
  jitter: true,
  minDelay: 100,
};

interface NodeStatus {
  Node: ChildProcess | null;
  QuitRequested: boolean;
  ExitCode: number | null;
}

export const NODESTATUS: NodeStatus = {
  Node: null,
  QuitRequested: false,
  ExitCode: null,
};

class Headless {
  constructor(path: string) {
    this._path = path;
    this._running = false;
    this._genesisHash = undefined;
    this._exitListeners = [];

    ipcMain.on(
      "standalone/set-signer-private-key",
      async (event, privateKey: string) => {
        const ret = await this.setSignerPrivateKey(privateKey).catch(
          () => false
        );
        console.log(`set-signer-private-key: ${ret}`);
        event.returnValue = ret;
      }
    );

    ipcMain.on(
      "activate-account",
      async (event, activationKey: string, nonce: string, filePath: string) => {
        console.log("activate-account");
        event.returnValue = this.action.ActivateAccount(
          activationKey,
          nonce,
          filePath
        );
      }
    );

    ipcMain.on(
      "monster-collect",
      async (event, level: number, filePath: string) => {
        console.log("monster-collect");
        event.returnValue = this.action.MonsterCollect(level, filePath);
      }
    );

    ipcMain.on(
      "claim-monster-collection-reward",
      async (event, avatarAddress: string, filePath: string) => {
        console.log("claim-monster-collection-reward");
        event.returnValue = this.action.ClaimMonsterCollectionReward(
          avatarAddress,
          filePath
        );
      }
    );

    ipcMain.on("stake", async (event, amount: string, filePath: string) => {
      console.log("stake");
      event.returnValue = this.action.Stake(amount, filePath);
    });

    ipcMain.on(
      "claim-stake-reward",
      async (event, avatarAddress: string, filePath: string) => {
        console.log("claim-stake-reward");
        event.returnValue = this.action.ClaimStakeReward(
          avatarAddress,
          filePath
        );
      }
    );

    ipcMain.on(
      "migrate-monster-collection",
      async (event, avatarAddress: string, filePath: string) => {
        console.log("migrate-monster-collection");
        event.returnValue = this.action.MigrateMonsterCollection(
          avatarAddress,
          filePath
        );
      }
    );

    ipcMain.on(
      "transfer-asset",
      async (
        event,
        sender: string,
        recipient: string,
        amount: number,
        memo: string,
        filePath: string
      ) => {
        console.log("transfer-asset");
        event.returnValue = this.action.TransferAsset(
          sender,
          recipient,
          amount,
          memo,
          filePath
        );
      }
    );

    ipcMain.on("set-genesis-hash", (event, hash: string) => {
      this._genesisHash = hash;
    });

    ipcMain.on(
      "sign-tx",
      async (event, nonce: number, timeStamp: string, filePath: string) => {
        console.log("sign-tx");
        if (!this._signerPrivateKey || !this._genesisHash) {
          throw new Error("set signer private key and genesis hash first.");
        }
        event.returnValue = this.tx.Sign(
          this._signerPrivateKey,
          nonce,
          this._genesisHash,
          timeStamp,
          filePath
        );
      }
    );
  }

  private _path: string;
  private _running: boolean;
  private _privateKey: string | undefined;
  private _signerPrivateKey: string | undefined;
  private _genesisHash: string | undefined;
  private _exitListeners: (() => void)[];

  // execute-kill
  public get alive(): boolean {
    return NODESTATUS.Node !== null || CUSTOM_SERVER;
  }

  // run-stop
  public get running(): boolean {
    return this._running;
  }

  public get exitCode(): number | null {
    return NODESTATUS.ExitCode;
  }

  public get version() {
    return "Not implemented";
  }

  public async execute(args: string[]): Promise<void> {
    const argsString: string = "\n  " + args.join("\n  ");
    if (CUSTOM_SERVER) {
      console.log("Connecting to the custom headless server...");
      console.log(
        "If the connection is not successful, check if the headless server " +
          `is executed with the following options:${argsString}`
      );
    } else {
      console.log(
        "Executing the headless server:" + `\n  ${this._path}${argsString}`
      );
      if (NODESTATUS.Node !== null) {
        throw new Error(
          "Cannot spawn a new headless process when there's already alive one."
        );
      }

      const node = execute(this._path, args);
      node.addListener("exit", this.exitedHandler.bind(this));
      NODESTATUS.Node = node;
    }
  }

  public async kill(): Promise<void> {
    if (NODESTATUS.QuitRequested) return;

    console.log("Killing standalone.");
    if (NODESTATUS.Node === null) {
      console.log("Standalone is not alive.");
      return;
    }

    NODESTATUS.QuitRequested = true;

    const pid: number = NODESTATUS.Node.pid;
    process.kill(pid, "SIGINT");

    console.log("Wait for standalone quit...");
    while (NODESTATUS.Node !== null) {
      await sleep(100);
    }

    NODESTATUS.QuitRequested = false;
    console.log("Standalone killed successfully.");
  }

  public async setSignerPrivateKey(privateKey: string): Promise<boolean> {
    this._signerPrivateKey = privateKey;
    return true;
  }

  public get keyStore(): KeyStore {
    return new KeyStore(this._path);
  }

  public get validation(): Validation {
    return new Validation(this._path);
  }

  public get apv(): Apv {
    return new Apv(this._path);
  }

  public get tx(): Tx {
    return new Tx(this._path);
  }

  public get action(): Action {
    return new Action(this._path);
  }

  public getTip(storeType: string, storePath: string): BlockMetadata | null {
    try {
      console.log(
        `cmd: [${basename(this._path)} chain tip ${storeType} ${storePath}]`
      );
      console.log(`cwd: [${dirname(this._path)}]`);

      const output = execFileSync(
        basename(this._path),
        ["chain", "tip", storeType, storePath],
        {
          encoding: "utf-8",
          cwd: dirname(this._path),
        }
      );

      console.log(`output: [${output}]`);

      return JSON.parse(output) as BlockMetadata;
    } catch (error) {
      // FIXME: define a new interface or research the type exists.
      if (
        error instanceof Object &&
        Object.prototype.hasOwnProperty.call(error, "status") &&
        error.status !== 0
      ) {
        return null;
      }

      throw error;
    }
  }

  public once(event: string | symbol, listener: (...args: any[]) => void) {
    if (event !== "exit")
      console.log("not supported event: " + event.toString());
    this._exitListeners.push(listener);
  }

  private exitedHandler(code: number | null): void {
    console.error(`Standalone exited with exit code: ${code}`);

    NODESTATUS.Node = null;
    NODESTATUS.ExitCode = code;

    if (!NODESTATUS.QuitRequested) {
      console.error("Headless exited unexpectedly.");
      this._exitListeners.forEach((listener) => listener());
      this._exitListeners = [];
    }
  }
}

export default Headless;

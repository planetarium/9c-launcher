import { ChildProcess, execFileSync } from "child_process";
import { ipcMain } from "electron";
import { basename, dirname } from "path";
import { CUSTOM_SERVER, LOCAL_SERVER_URL, userConfigStore } from "../../config";
import { retry } from "@lifeomic/attempt";
import { FetchError, HeadlessExitedError } from "../../errors";
import { execute, sleep } from "../../utils";
import fetch, { Response } from "electron-fetch";
import { EventEmitter } from "ws";
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
  QuitRequested: Boolean;
  ExitCode: number | null;
}

export const NODESTATUS: NodeStatus = {
  Node: null,
  QuitRequested: false,
  ExitCode: null,
};

const eventEmitter = new EventEmitter();

class Headless {
  constructor(path: string) {
    this._path = path;
    this._running = false;

    ipcMain.on(
      "standalone/set-private-key",
      async (event, privateKey: string) => {
        let ret = await this.login(privateKey);
        console.log(`set-private-key: ${ret}`);
        event.returnValue = ret;
      }
    );

    ipcMain.on(
      "standalone/set-signer-private-key",
      async (event, privateKey: string) => {
        let ret = await this.setSignerPrivateKey(privateKey);
        console.log(`set-signer-private-key: ${ret}`);
        event.returnValue = ret;
      }
    );

    ipcMain.on("standalone/set-mining", async (event, mining: boolean) => {
      let ret = await this.miningOption(mining);
      console.log(`set-mining: ${ret}`);
      event.returnValue = ret;
    });

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

    ipcMain.on(
      "sign-tx",
      async (event, nonce: number, timeStamp: string, filePath: string) => {
        console.log("sign-tx");
        if (this._signerPrivateKey == undefined || "") {
          throw new Error("set signer private key first.");
        }
        event.returnValue = this.tx.Sign(
          this._signerPrivateKey,
          nonce,
          "4582250d0da33b06779a8475d283d5dd210c683b9b999d74d03fac4f58fa6bce",
          timeStamp,
          filePath
        );
      }
    );
  }

  private _path: string;
  private _running: boolean;
  private _privateKey: string | undefined;
  private _mining: boolean | undefined;
  private _signerPrivateKey: string | undefined;

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

      let node = execute(this._path, args);
      node.addListener("exit", this.exitedHandler);
      NODESTATUS.Node = node;
    }

    if (this._privateKey !== undefined) {
      await this.setPrivateKey(this._privateKey);
    }
    if (this._mining !== undefined) {
      await this.setMining(this._mining);
    }
  }

  public async setPrivateKey(privateKey: string): Promise<boolean> {
    console.log("Setting private key.");
    const body = JSON.stringify({
      PrivateKeyString: privateKey,
    });
    return this.retriableFetch("set-private-key", body);
  }

  public async setMining(mine: boolean): Promise<boolean> {
    console.log(`Setting mining: ${mine}`);
    userConfigStore.set("NoMiner", !mine);
    const body = JSON.stringify({
      Mine: mine,
    });
    return this.retriableFetch("set-mining", body);
  }

  public async kill(): Promise<void> {
    if (NODESTATUS.QuitRequested) return;

    console.log("Killing standalone.");
    if (NODESTATUS.Node === null) {
      console.log("Standalone is not alive.");
      return;
    }

    NODESTATUS.QuitRequested = true;

    let pid: number = NODESTATUS.Node.pid;
    process.kill(pid, "SIGINT");

    console.log("Wait for standalone quit...");
    while (NODESTATUS.Node !== null) {
      await sleep(100);
    }

    NODESTATUS.QuitRequested = false;
    console.log("Standalone killed successfully.");
  }

  public async login(privateKey: string): Promise<boolean> {
    this._privateKey = privateKey;
    if (this.alive) return await this.setPrivateKey(privateKey);
    return true;
  }

  public async miningOption(mining: boolean): Promise<boolean> {
    this._mining = mining;
    if (this.alive) return await this.setMining(mining);
    return true;
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
        (error as Object).hasOwnProperty("status") &&
        error.status !== 0
      ) {
        return null;
      }

      throw error;
    }
  }

  public once(event: string | symbol, listener: (...args: any[]) => void) {
    eventEmitter.once(event, listener);
  }

  private exitedHandler(code: number | null): void {
    console.error(`Standalone exited with exit code: ${code}`);

    NODESTATUS.Node = null;
    NODESTATUS.ExitCode = code;

    if (!NODESTATUS.QuitRequested) {
      console.error("Headless exited unexpectedly.");
      eventEmitter.emit("exit");
    }
  }

  private retriableFetch(addr: string, body: string): Promise<boolean> {
    console.log(`Retriable fetch ${addr}`);
    return retry(async (context) => {
      if (!this.alive) {
        console.log("Standalone is not alive. Abort...");
        context.abort();
        throw new HeadlessExitedError("Headless is exited during fetching.");
      }

      try {
        let response = await fetch(`http://${LOCAL_SERVER_URL}/${addr}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
        });

        if (await this.needRetry(response)) {
          console.log(
            `Failed to fetch standalone (${addr}). Retrying... ${
              context.attemptNum
            }/${context.attemptsRemaining + context.attemptNum}`
          );
          throw new Error("Retry required.");
        } else {
          console.log(
            `Successfully fetched standalone (${addr}) in ${context.attemptNum} retries.`
          );
          return true;
        }
      } catch (error) {
        if (error instanceof FetchError) {
          console.log(`Failed to fetch standalone (${addr}). Abort: ${error}`);
          context.abort();
          return false;
        }

        console.log(
          `Unhandled exception occurred fetching standalone (${addr}). Abort: ${error}`
        );
        throw error;
      }
    }, retryOptions);
  }

  private async needRetry(response: Response): Promise<boolean> {
    if (response.status === 200) {
      return false;
    } else if (response.status === 503) {
      throw new FetchError(await response.text(), 503);
    }

    // Excluding 200 & 503, retry.
    return true;
  }
}

export default Headless;

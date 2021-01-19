import { ChildProcess } from "child_process";
import { ipcMain } from "electron";
import { electronStore, LOCAL_SERVER_URL } from "../config";
import { retry } from "@lifeomic/attempt";
import { FetchError, StandaloneExitedError } from "../errors";
import { execute, sleep } from "../utils";
import fetch, { Response } from "electron-fetch";
import { EventEmitter } from "ws";

const retryOptions = {
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

const NODESTATUS: NodeStatus = {
  Node: null,
  QuitRequested: false,
  ExitCode: null,
};

const eventEmitter = new EventEmitter();

class Standalone {
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

    ipcMain.on("standalone/set-mining", async (event, mining: boolean) => {
      let ret = await this.miningOption(mining);
      console.log(`set-mining: ${ret}`);
      event.returnValue = ret;
    });
  }

  private _path: string;
  private _running: boolean;
  private _privateKey: string | undefined;
  private _mining: boolean | undefined;

  // execute-kill
  public get alive(): boolean {
    return NODESTATUS.Node !== null;
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
    console.log(`Executing standalone. ${this._path} ${args}`);
    if (NODESTATUS.Node !== null) {
      throw new Error("Cannot execute standalone while standalone is alive.");
    }

    let node = execute(this._path, args);
    node.addListener("exit", this.exitedHandler);
    NODESTATUS.Node = node;
    if (this._privateKey !== undefined) {
      await this.setPrivateKey(this._privateKey);
    }
    if (this._mining !== undefined) {
      await this.setMining(this._mining);
    }
  }

  public async run(): Promise<boolean> {
    console.log("Running standalone.");
    this._running = await this.retriableFetch("run-standalone", "");
    return this._running;
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
    electronStore.set("NoMiner", !mine);
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

  public once(event: string | symbol, listener: (...args: any[]) => void) {
    eventEmitter.once(event, listener);
  }

  private exitedHandler(code: number | null): void {
    console.error(`Standalone exited with exit code: ${code}`);
    if (!NODESTATUS.QuitRequested) {
      console.error("Headless exited unexpectedly.");
      eventEmitter.emit("exit");
    }

    NODESTATUS.Node = null;
    NODESTATUS.ExitCode = code;
  }

  private retriableFetch(addr: string, body: string): Promise<boolean> {
    console.log(`Retriable fetch ${addr}`);
    return retry(async (context) => {
      if (!this.alive) {
        console.log("Standalone is not alive. Abort...");
        context.abort();
        throw new StandaloneExitedError(
          "Standalone is exited during fetching."
        );
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

export default Standalone;

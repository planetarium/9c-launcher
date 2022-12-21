import { ChildProcess, execFileSync } from "child_process";
import { ipcMain } from "electron";
import { basename, dirname } from "path";
import { CUSTOM_SERVER } from "../../config";
import { execute, sleep } from "../../utils";
import { BlockMetadata } from "src/interfaces/block-header";

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

    ipcMain.on("set-genesis-hash", (event, hash: string) => {
      this._genesisHash = hash;
    });
  }

  private _path: string;
  private _running: boolean;
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

    const pid: number = NODESTATUS.Node.pid!;
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

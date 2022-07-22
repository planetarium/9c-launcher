import { execFileSync } from "child_process";
import { dirname, basename } from "path";
import { CUSTOM_SERVER, NodeInfo } from "../../config";
import { sleep } from "../../utils";
import { BlockMetadata } from "src/interfaces/block-header";
import { NODESTATUS } from "./headless";

class RemoteHeadless {
  constructor(node: NodeInfo) {
    this._url = `${node.host}/${node.rpcPort}`;
    this._running = false;
  }

  private _url: string;
  private _running: boolean;

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

  public async execute(): Promise<void> {
    console.log("Executing the remote headless server:" + `\n  ${this._url}`);
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

  public getTip(storeType: string, storePath: string): BlockMetadata | null {
    try {
      console.log(
        `cmd: [${basename(this._url)} chain tip ${storeType} ${storePath}]`
      );
      console.log(`cwd: [${dirname(this._url)}]`);

      const output = execFileSync(
        basename(this._url),
        ["chain", "tip", storeType, storePath],
        {
          encoding: "utf-8",
          cwd: dirname(this._url),
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
}

export default RemoteHeadless;

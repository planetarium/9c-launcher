import { execFileSync } from "child_process";
import { dirname, basename } from "path";
import { CUSTOM_SERVER, NodeInfo } from "../../config";
import { retry } from "@lifeomic/attempt";
import { FetchError, HeadlessExitedError } from "../../errors";
import { sleep } from "../../utils";
import fetch, { Response } from "electron-fetch";
import { EventEmitter } from "ws";
import { BlockMetadata } from "src/interfaces/block-header";
import { NODESTATUS, retryOptions } from "./headless";

const eventEmitter = new EventEmitter();

class RemoteHeadless {
  constructor(node: NodeInfo) {
    this._url = `${node.host}/${node.rpcPort}`;
    this._running = false;
  }

  private _url: string;
  private _running: boolean;
  private _privateKey: string | undefined;

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
        Object.prototype.hasOwnProperty.call(error, "status") &&
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
        const response = await fetch(`http://${this._url}/${addr}`, {
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

export default RemoteHeadless;

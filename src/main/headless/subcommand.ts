import {
  ChildProcess,
  execFileSync,
  spawnSync,
  SpawnSyncReturns,
} from "child_process";
import { dirname, basename, sep } from "path";

function maskPassphrase(args: string[]): string[] {
  const passphraseIndex = args.indexOf("--passphrase");
  if (passphraseIndex === -1) return args;

  return args.map((v, i) => (i === passphraseIndex + 1 ? "******" : v));
}

export class StandaloneSubcommand {
  private readonly _executablePath: string;

  constructor(executablePath: string) {
    this._executablePath = executablePath;
  }

  protected execSync(...args: string[]): string {
    // Note that invoking "foo" searches executables named "foo" only in PATH,
    // not also in CWD on POSIX. (On Windows "foo" search both in PATH and CWD.)
    // In order to make it searches executables in CWD, it should be prefixed
    // with "./", that is, "./foo".
    // As join(".", "foo") returns "foo" instead of "./foo", which is what
    // we expect, manually concatenate paths here:
    const cmd = `.${sep}${basename(this._executablePath)}`;
    const cwd = dirname(this._executablePath);
    try {
      return execFileSync(cmd, args, { encoding: "utf-8", cwd: cwd });
    } catch (e) {
      console.error(
        "The subprocess call failed (from ",
        cwd,
        "):\n",
        this._executablePath,
        ...maskPassphrase(args)
      );
      throw e;
    }
  }

  protected spawnSync(...args: string[]): SpawnSyncReturns<string> {
    // Note that invoking "foo" searches executables named "foo" only in PATH,
    // not also in CWD on POSIX. (On Windows "foo" search both in PATH and CWD.)
    // In order to make it searches executables in CWD, it should be prefixed
    // with "./", that is, "./foo".
    // As join(".", "foo") returns "foo" instead of "./foo", which is what
    // we expect, manually concatenate paths here:
    const cmd = `.${sep}${basename(this._executablePath)}`;
    const cwd = dirname(this._executablePath);
    return spawnSync(cmd, args, { encoding: "utf-8", cwd: cwd });
  }
}

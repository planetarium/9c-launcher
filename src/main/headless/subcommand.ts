import { execFileSync } from "child_process";
import { dirname, basename, sep } from "path";

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
        ...args
      );
      throw e;
    }
  }
}

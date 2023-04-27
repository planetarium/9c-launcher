import lockfile from "lockfile";
import path from "path";
import { app } from "electron";

export function isUpdating() {
  const lockfilePath = getLockfilePath();
  return lockfile.checkSync(lockfilePath);
}

/**
 * unlock if lockfile locked.
 */
export function cleanUpLockfile() {
  const lockfilePath = getLockfilePath();
  if (lockfile.checkSync(lockfilePath)) {
    lockfile.unlockSync(lockfilePath);
  }
}

function getLockfilePath(): string {
  let lockfilePath: string;
  if (process.platform === "darwin")
    lockfilePath = path.join(path.dirname(app.getPath("userData")), "lockfile");
  else lockfilePath = path.join(path.dirname(app.getPath("exe")), "lockfile");
  return lockfilePath;
}

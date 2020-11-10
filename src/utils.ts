import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import checkDiskSpace from "check-disk-space";
import path from "path";
import fs from "fs";

export async function getDiskSpace(diskpath: string): Promise<number> {
  let diskSpace = await checkDiskSpace(diskpath);
  return diskSpace.free;
}

export function isDiskPermissionValid(diskpath: string): boolean {
  try {
    if (!fs.existsSync(diskpath)) {
      console.log("Create directory for given blockchain path.");
      fs.mkdirSync(diskpath, { recursive: true });
    }
  } catch (err) {
    console.error("Error occurred while creating directory.", err);
    if (err.code === "EACCES" || err.code === "EPERM") return false;
  }

  try {
    fs.accessSync(diskpath, fs.constants.F_OK);
    return true;
  } catch (err) {
    console.error("No read/write access to the path: ", diskpath, err);
    return false;
  }
}

export function deleteBlockchainStoreSync(storepath: string): void {
  console.log("Deleting blockchain store.");
  fs.rmdirSync(storepath, { recursive: true });
}

export function execute(
  binarypath: string,
  args: string[]
): ChildProcessWithoutNullStreams {
  if (binarypath == "") {
    throw Error("Path is empty.");
  }

  const node = spawn(binarypath, args);
  node.stdout?.on("data", (data) => {
    console.log(`${data}`);
  });
  node.stderr?.on("data", (data) => {
    console.log(`${data}`);
  });
  return node;
}

export async function copyDir(srcDir: string, dstDir: string): Promise<void> {
  try {
    const stat = await fs.promises.stat(dstDir);

    if (!stat.isDirectory()) {
      await fs.promises.unlink(dstDir);
      await fs.promises.mkdir(dstDir, { recursive: true });
    }
  } catch (e) {
    if (e.code === "ENOENT") {
      await fs.promises.mkdir(dstDir, { recursive: true });
    }
  }

  for (const ent of await fs.promises.readdir(srcDir, {
    withFileTypes: true,
  })) {
    const src = path.join(srcDir, ent.name);
    const dst = path.join(dstDir, ent.name);
    if (ent.isDirectory()) {
      await copyDir(src, dst);
    } else {
      try {
        await fs.promises.copyFile(src, dst);
      } catch (e) {
        console.warn("Failed to copy a file", src, "->", dst, ":\n", e);
      }
    }
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

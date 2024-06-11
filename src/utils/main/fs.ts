import * as fs from "fs";
import path from "path";

export async function mkdirIfNotExists(path: string) {
  fs.mkdir(path, (error) => {
    if (error && error.code !== "EEXIST") {
      throw error;
    }
  });
}

export async function mkPath(path: string) {
  return fs.promises.mkdir(path, { recursive: true });
}

export async function access(path: string): Promise<boolean> {
  try {
    await fs.promises.access(path);
    return true;
  } catch (error) {
    return false;
  }
}

export function accessSync(path: string): boolean {
  try {
    fs.accessSync(path);

    return true;
  } catch (error) {
    return false;
  }
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

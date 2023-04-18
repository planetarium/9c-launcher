import { exec } from "child_process";

type OSPlatform = "darwin" | "linux" | "win32";

function getCommandOfAvailableDisk(path: string): string {
  const platform = process.platform as OSPlatform;

  let cmd: string = "";

  if (platform === "darwin" || platform === "linux") {
    cmd = `df -k ${path} | tail -1 | awk '{print $4}'`;
  } else if (platform === "win32") {
    cmd = `for /f "skip=1" %p in ('wmic logicaldisk get FreeSpace^,Size^,Caption /format:list ^| find /i "${path}"') do @echo %p`;
  }

  return cmd;
}

export function getAvailableDiskSpace(path: string = "/"): Promise<number> {
  return new Promise((resolve, reject) => {
    const cmd = getCommandOfAvailableDisk(path);

    if (!cmd) {
      return reject(new Error(`Unsupported platform: ${process.platform}`));
    }

    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        return reject(err);
      }
      if (stderr) {
        return reject(new Error(stderr));
      }

      const available = parseInt(stdout.trim(), 10);
      resolve(available);
    });
  });
}

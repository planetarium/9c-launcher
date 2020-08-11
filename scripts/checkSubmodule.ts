import { exec } from "child_process";
import path from "path";
import { promisify } from "util";

type Sha = string;

const execWithPromise = promisify(exec);

enum Submodules {
  lib9c = "Lib9c",
  shared = "NineChronicles.RPC.Shared",
}

async function getSubmoduleHash(
  submodulePath: string,
  subSubmodulePath: string
): Promise<Sha> {
  const { stdout, stderr } = await execWithPromise(
    `git submodule status ${subSubmodulePath}`,
    {
      cwd: path.join(__dirname, "..", submodulePath),
    }
  );
  return stdout.trim();
}

async function checkLib9c(): Promise<boolean> {
  const sha1 = await getSubmoduleHash(
    "nekoyume-unity",
    "./nekoyume/Assets/_Scripts/Lib9c/Lib9c"
  );
  const sha2 = await getSubmoduleHash("NineChronicles.Standalone", "./Lib9c");

  return sha1 === sha2;
}

async function checkShared(): Promise<boolean> {
  const sha1 = await getSubmoduleHash(
    "nekoyume-unity",
    "./nekoyume/Assets/_Scripts/NineChronicles.RPC.Shared"
  );
  const sha2 = await getSubmoduleHash(
    "NineChronicles.Standalone",
    "./NineChronicles.RPC.Shared"
  );

  return sha1 === sha2;
}

async function checkSubmodule(name: string): Promise<boolean> {
  switch (name) {
    case Submodules.lib9c:
      return await checkLib9c();

    case Submodules.shared:
      return await checkShared();

    default:
      throw new Error(
        `checkSubmodule.ts: Argument should be either ${Submodules.shared} or ${Submodules.shared}`
      );
  }
}

async function main(): Promise<void> {
  if (process.argv.length !== 1) {
    throw new Error("checkSubmodule.ts: One argument (submodule) is required.");
  }

  const result = await checkSubmodule(process.argv[0]);
  if (!result) {
    throw new Error(
      `checkSubmodule.ts: Failed while checking ${process.argv[0]}`
    );
  }
}

main().catch((e) => console.error(e));

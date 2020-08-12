import { exec } from "child_process";
import path from "path";
import { promisify } from "util";
import { exit } from "process";

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
  return stdout.trim().split(" ")[0].replace("-", "");
}

async function checkLib9c(): Promise<void> {
  const sha1 = await getSubmoduleHash(
    "nekoyume-unity",
    "./nekoyume/Assets/_Scripts/Lib9c/Lib9c"
  );
  const sha2 = await getSubmoduleHash("NineChronicles.Standalone", "./Lib9c");

  if (sha1 !== sha2) {
    throw new Error(
      `checkSubmodule.ts: Failed while checking ${Submodules.lib9c}. (nekoyume-unity: ${sha1}, NineChronicles.Standalone: ${sha2})`
    );
  }

  console.log(`Commit hash of ${Submodules.lib9c} matches: ${sha1}`);
}

async function checkShared(): Promise<void> {
  const sha1 = await getSubmoduleHash(
    "nekoyume-unity",
    "./nekoyume/Assets/_Scripts/NineChronicles.RPC.Shared"
  );
  const sha2 = await getSubmoduleHash(
    "NineChronicles.Standalone",
    "./NineChronicles.RPC.Shared"
  );

  if (sha1 !== sha2) {
    throw new Error(
      `checkSubmodule.ts: Failed while checking ${Submodules.shared}. (nekoyume-unity: ${sha1}, NineChronicles.Standalone: ${sha2})`
    );
  }

  console.log(`Commit hash of ${Submodules.shared} matches: ${sha1}`);
}

async function checkSubmodule(name: string): Promise<void> {
  switch (name) {
    case Submodules.lib9c:
      await checkLib9c();
      break;

    case Submodules.shared:
      await checkShared();
      break;

    default:
      throw new Error(
        `checkSubmodule.ts: Argument should be either ${Submodules.lib9c} or ${Submodules.shared}. (actual: ${name})`
      );
  }
}

async function main(): Promise<void> {
  if (process.argv.length !== 3) {
    throw new Error(
      `checkSubmodule.ts: One argument (submodule) is required. (acual: ${Math.max(
        0,
        process.argv.length - 2
      )}).`
    );
  }

  await checkSubmodule(process.argv[2]);
}

main().catch((e) => {
  console.error(e);
  exit(-1);
});

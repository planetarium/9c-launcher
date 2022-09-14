import fs from "fs";
import { IVersionMetadata } from "../../interfaces/metadata";

export const FILE_NAME = "version.json";

export async function createVersion(dir: string, data: IVersionMetadata) {
  await fs.promises.writeFile(`${dir}/${FILE_NAME}`, JSON.stringify(data));
}

export async function readVersion(dir: string): Promise<IVersionMetadata> {
  const data = await fs.promises.readFile(`${dir}/${FILE_NAME}`, "utf8");

  const m: IVersionMetadata = JSON.parse(data);

  return m;
}

export async function exists(dir: string) {
  const e = await fs.promises.stat(`${dir}/${FILE_NAME}`).catch(() => false);

  return e;
}

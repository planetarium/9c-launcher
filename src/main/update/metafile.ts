import fs from "fs";
import { IVersionMetadata } from "../../interfaces/metadata";

export async function createVersionMetafile(
  path: string,
  data: IVersionMetadata
) {
  await fs.promises.writeFile(path, JSON.stringify(data));
}

export async function readVersionMetafile(
  path: string
): Promise<IVersionMetadata> {
  const data = await fs.promises.readFile(path, "utf8");

  const metadata: IVersionMetadata = JSON.parse(data);

  return metadata;
}

import fs from "fs";
import { IVersionMetadata } from "../../interfaces/metadata";

export const FILE_NAME = "version.json";

export async function createVersionMetafile(
  dir: string,
  data: IVersionMetadata
) {
  await fs.promises.writeFile(`${dir}/${FILE_NAME}`, JSON.stringify(data));
}

export async function readVersionMetafile(
  dir: string
): Promise<IVersionMetadata> {
  const data = await fs.promises.readFile(`${dir}/${FILE_NAME}`, "utf8");

  const metadata: IVersionMetadata = JSON.parse(data);

  return metadata;
}

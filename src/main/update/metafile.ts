import fs from "fs";
import path from "path";
import { IVersionMetadata } from "../../interfaces/metadata";
import { PLAYER_METAFILE_VERSION } from "../../config";

export const FILE_NAME = "version.json";
export class SchemaNotCompatibilityError extends Error {}

export async function createVersion(dir: string, data: IVersionMetadata) {
  await fs.promises.writeFile(path.join(dir, FILE_NAME), JSON.stringify(data));
}

export async function readVersion(dir: string): Promise<IVersionMetadata> {
  const data = await fs.promises.readFile(path.join(dir, FILE_NAME), "utf8");

  const m = JSON.parse(data);

  if (m["schemaVersion"] !== PLAYER_METAFILE_VERSION) {
    throw new SchemaNotCompatibilityError(
      `Old version ${m["schemaVersion"]} and New version ${PLAYER_METAFILE_VERSION} are not compatible`
    );
  }

  return m as IVersionMetadata;
}

export async function exists(dir: string) {
  return await fs.promises.stat(path.join(dir, FILE_NAME)).catch(() => false);
}

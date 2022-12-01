import { IApv } from "src/interfaces/apv";
import { encode, decode, BencodexDict } from "bencodex";

export function analyzeApv(token: string) {
  const [version, signer, signature, rawExtra] = token
    .replace(".", "")
    .split("/");
  const extra = decode(Buffer.from(rawExtra, "base64"));

  return {
    raw: token,
    version: parseInt(version),
    signer: signer,
    signature: Buffer.from(signature, "base64").toString("hex"),
    extra: extra,
  };
}

export function decodeApv(token: string): BencodexDict | undefined {
  return decodeApvExtra(token.split("/")[1]);
}

export function decodeApvExtra(rawExtra: string): BencodexDict | undefined {
  const extra = Buffer.from(rawExtra, "hex");

  if (!extra.length) return;

  return decode(extra) as BencodexDict | undefined;
}

export function encodeExtra(extra: { [key: string]: string }): string {
  return encode(extra).toString("hex");
}

export function parseVersionNumber(apv: string): number {
  const [version] = apv.split("/");
  return parseInt(version, 10);
}

export function decodeProjectVersion(projectVersion: string) {
  const [version, commitHash] = projectVersion.split("/");

  return {
    version: Number(version),
    commitHash,
  };
}

export function encodeToken(version: number, extra: string) {
  return `${version}/${extra}`;
}

export function encodeTokenFromHex(version: number, extraHex: string) {
  const extra = Buffer.from(extraHex, "hex");
  const encoded = extra.toString("base64");

  return `${version}/${encoded}`;
}

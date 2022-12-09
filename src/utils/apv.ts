import { encode, decode, BencodexDict } from "bencodex";
import { AppProtocolVersionType } from "src/generated/graphql-request";
import { IApv } from "src/interfaces/apv";
import { verify, Signature } from "@noble/secp256k1";
import { flatBencodexValue } from "./bencodex";

export function analyzeApv(token: string | AppProtocolVersionType) {
  if (typeof token === "string") {
    return analyzeApvFromToken(token);
  } else {
    return analyzeApvFromGQL(token);
  }
}

function analyzeApvFromToken(token: string): IApv {
  const [version, signer, signature, rawExtra] = token
    .replace(".", "")
    .split("/");
  const extra = decode(Buffer.from(rawExtra, "base64"));
  if (extra === undefined) {
    throw Error("Unable to decode extra data from bencodex string.");
  }

  return {
    raw: token,
    version: parseInt(version),
    signer: signer.replace("0x", ""),
    signature: Buffer.from(signature, "base64").toString("hex"),
    extra: flatBencodexValue(extra, {}, "extra"),
  };
}

function analyzeApvFromGQL(query: AppProtocolVersionType): IApv {
  if (query.extra === undefined) {
    throw Error("Unable to decode extra data from bencodex string.");
  }
  return {
    raw: query.toString(),
    version: query.version,
    signer: query.signer,
    signature: query.signature,
    extra: flatBencodexValue(decodeApvExtra(query.extra!), {}, "extra"),
  };
}

export async function verifyApv(
  publicKeys: string[],
  apvToken: AppProtocolVersionType
): Promise<boolean> {
  const version = new Uint8Array(
    Int32Array.of(apvToken.version).buffer
  ).reverse();
  const extra = Buffer.from(apvToken.extra!, "hex");
  const message = new Uint8Array(
    await crypto.subtle.digest("SHA-256", Buffer.concat([version, extra]))
  );
  const signature = Signature.fromHex(apvToken.signature);
  return publicKeys.every((publicKey) => {
    const pubKey = Buffer.from(publicKey, "hex");
    return verify(signature, message, pubKey);
  });
}

export function decodeApv(token: string): BencodexDict | undefined {
  return decodeApvExtra(token.split("/")[1]);
}

export function decodeApvExtra(rawExtra: string): BencodexDict {
  const extra = Buffer.from(rawExtra, "hex");

  return decode(extra) as BencodexDict;
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

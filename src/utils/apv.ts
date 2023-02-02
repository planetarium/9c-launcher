import { encode, decode, BencodexDict } from "bencodex";
import { AppProtocolVersionType } from "src/generated/graphql-request";
import { IApv } from "src/interfaces/apv";
import { verify, Signature } from "@noble/secp256k1";
import { flatBencodexValue } from "./bencodex";
import { webcrypto } from "node:crypto";

const subtle = webcrypto.subtle;

export function analyzeApv(token: string | AppProtocolVersionType): IApv {
  if (typeof token === "string") {
    return analyzeApvFromToken(token);
  } else {
    return analyzeApvFromGQL(token);
  }
}

function analyzeApvFromToken(token: string): IApv {
  const [version, signer, signature, rawExtra] = token.split("/");
  if (rawExtra === undefined) {
    throw Error("Unable to decode extra data from APV string.");
  }
  const extra = decode(Buffer.from(rawExtra.replaceAll(".", "/"), "base64"))!;
  return {
    raw: token,
    version: parseInt(version),
    signer: signer.replace("0x", ""),
    signature: Buffer.from(signature.replaceAll(".", "/"), "base64").toString(
      "hex"
    ),
    extra: flatBencodexValue(extra, {}, "extra"),
  };
}

function analyzeApvFromGQL(query: AppProtocolVersionType): IApv {
  if (query.extra === undefined) {
    throw Error("Unable to decode extra data from bencodex string.");
  }
  return {
    raw: encodeTokenFromHex(
      query.version,
      query.signer,
      query.signature,
      query.extra ?? ""
    ),
    version: query.version,
    signer: query.signer,
    signature: query.signature,
    extra: flatBencodexValue(decodeApvExtra(query.extra!), {}, "extra"),
  };
}

export function verifyApv(
  publicKeys: string[],
  apvToken: AppProtocolVersionType
): boolean {
  //version must be in 32-bit (4 byte) container, Big-endian according to libplanet-spec
  const version = new Uint8Array(
    Int32Array.of(apvToken.version).buffer
  ).reverse();
  const extra = Buffer.from(apvToken.extra ?? "", "hex");
  const message = subtle.digest("SHA-256", Buffer.concat([version, extra]));
  const signature = Signature.fromHex(apvToken.signature);
  return publicKeys.every((publicKey) => {
    const pubKey = Buffer.from(publicKey, "hex");
    return message.then((message) => {
      return verify(signature, new Uint8Array(message), pubKey);
    });
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

export function encodeTokenFromHex(
  version: number,
  signer: string,
  signatureHex: string,
  extraHex: string
) {
  const extra = Buffer.from(extraHex, "hex");
  const signature = Buffer.from(signatureHex, "hex");

  const encodedSignature = signature.toString("base64").replaceAll("/", ".");
  const encodedExtra = extra.toString("base64").replaceAll("/", ".");

  return `${version}/${signer.replace(
    "0x",
    ""
  )}/${encodedSignature}/${encodedExtra}`;
}

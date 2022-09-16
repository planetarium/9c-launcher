import { encode, decode, BencodexDict } from "bencodex";

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

export function buildToken(version: number, extra: string) {
  return `${version}/${extra}`;
}

export function buildTokenFromHex(version: number, extraHex: string) {
  const extra = Buffer.from(extraHex, "hex");
  const encoded = atob(extra.toString());

  return `${version}/${encoded}`;
}

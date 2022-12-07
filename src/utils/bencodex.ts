import { BencodexValue } from "bencodex";
import { IExtra } from "../interfaces/apv";

export function flatBencodexValue(
  value: BencodexValue,
  table: IExtra,
  key: string
): IExtra {
  if (typeof value == "undefined") {
    throw Error("Invalid Bencodex Value.");
  }
  if (value == null && typeof value != "undefined") {
    table[key] = null;
    return table;
  } else if (typeof value == "boolean") {
    table[key] = value ? true : false;
    return table;
  } else if (typeof value == "bigint") {
    table[key] = value.toString();
    return table;
  } else if (typeof value == "string") {
    table[key] = value;
    return table;
  } else if (value instanceof Uint8Array) {
    table[key] = value;
    return table;
  } else if (value instanceof Array) {
    value.forEach((value) => {
      if (value instanceof Map) {
        flatBencodexValue(value, table, key);
      } else {
        table[key] = value;
      }
    });
    return table;
  } else if (value instanceof Map) {
    // For readability, list dictionary keys in lexicographical order.
    const pairs = Array.from(value).sort(([a], [b]) => {
      if (a instanceof Uint8Array) {
        if (typeof b == "string") return -1;
        const length = Math.max(a.byteLength, b.byteLength);
        for (let i: number = 0; i < length; i++) {
          if (a.byteLength <= i) return 1;
          else if (b.byteLength <= i) return -1;
          else if (a[i] < b[i]) return -1;
          else if (a[i] > b[i]) return 1;
        }
        return 0;
      } else if (typeof a == "string") {
        if (b instanceof Uint8Array) return 1;
        return a < b ? -1 : a > b ? 1 : 0;
      }
      return 0;
    });
    let innerTable: IExtra = {};
    pairs.forEach((value) => {
      if (value[1] instanceof Map) {
        innerTable = flatBencodexValue(
          value[1],
          innerTable,
          value[0].toString()
        );
      } else {
        innerTable[value[0].toString()] = value[1];
      }
    });
    table[key] = innerTable;
    return table;
  }
  return table;
}

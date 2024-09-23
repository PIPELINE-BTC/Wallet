import { Buffer } from "buffer";
import * as bitcoin from 'bitcoinjs-lib';


export function textToHex(text: string) {
  const encoder = new TextEncoder().encode(text);
  return [...new Uint8Array(encoder)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

export function toBytes(num: number) {
  let hex = num.toString(16);
  const len = hex.length;
  if (len % 2 != 0) {
    hex = "0" + hex;
  }
  const bytes = [];
  for (let i = 0; i < len; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return Buffer.from(bytes);
}

export function toInt26(str: string) {
  const alpha = charRange("a", "z");
  let result = 0n;
  str = str?.toLowerCase();
  str = str?.replace(/[^a-z]/g, "");
  let j = 0n;
  for (let i = str.length - 1; i > -1; i--) {
    const char = str[i];
    let position = BigInt("" + alpha.indexOf(char));
    position++;
    const pow = (base: any, exponent: any) => base ** exponent;
    const power = pow(26n, j);
    result += BigInt(power) * position;
    j++;
  }
  return result;
}

export function charRange(start: string, stop: string) {
  const result = [];

  let i = start.charCodeAt(0);
  const last = stop.charCodeAt(0) + 1;
  for (i; i < last; i++) {
    result.push(String.fromCharCode(i));
  }

  return result;
}

export const toXOnly = (pubKey: Buffer) =>
  pubKey.length === 32 ? pubKey : pubKey.slice(1, 33);

export function generateTxidFromHash(hash: Buffer) {
  return hash.reverse().toString('hex');
}

export function isP2SHAddress(
  address: string,
  network: bitcoin.Network,
): boolean {
  try {
    const { version, hash } = bitcoin.address.fromBase58Check(address);
    return version === network.scriptHash && hash.length === 20;
  } catch (error) {
    return false;
  }
}

export function base64ToHex(base64: string): string {
  const buffer = Buffer.from(base64, 'base64');

  return buffer.toString('hex');
}

export function hexToBase64(hex: string): string {
  const buffer = Buffer.from(hex, 'hex');
  
  return buffer.toString('base64');
}

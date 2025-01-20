import { Buffer } from "buffer";
import * as bitcoin from 'bitcoinjs-lib';

export const BASE_OVERHEAD = 10.5;

export const OUTPUT_SIZES: { [key: string]: number } = {
  p2tr: 43,    // Taproot
  p2wpkh: 31,  // Native SegWit
  p2sh: 34,    // Script Hash
  p2pkh: 34    // Legacy
};

export const INPUT_SIZES: { [key: string]: number } = {
  p2tr: 57.5,    // Taproot
  p2wpkh: 68,    // Native SegWit
  p2sh: 91,      // Script Hash
  p2pkh: 148     // Legacy
};

export interface Options {
  finalize?: boolean;
  index?: number;
}

export const isValidOption = (option: any): option is Options => {
  if (typeof option !== "object" || option === null) return false;

  const allowedKeys = ["finalize", "index"];
  const optionKeys = Object.keys(option);

  const hasOnlyAllowedKeys = optionKeys.every((key) => allowedKeys.includes(key));

  const hasValidFinalize =
    option.finalize === undefined || typeof option.finalize === "boolean";
  const hasValidIndex =
    option.index === undefined || typeof option.index === "number";

  return hasOnlyAllowedKeys && hasValidFinalize && hasValidIndex;
};

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

export function estimateTransactionVBytes(
  inputCount: number, 
  outputs: { type: string, count: number }[], 
  scriptSize: number = 0, 
  inputType: string = "p2tr"
): number {
  const baseSize = inputType === "p2tr" ? BASE_OVERHEAD : 10;

  const inputBaseSize = estimateInputSize(inputType, inputCount);
  const outputSize = outputs.reduce((total, output) => {
    return total + estimateOutputSize(output.type, output.count);
  }, 0);
  const finalScriptSize = estimateScriptSize(scriptSize);

  const totalVBytes = baseSize + inputBaseSize + outputSize + finalScriptSize;
  return totalVBytes;
}

function estimateInputSize(addressType: string, count: number): number {
  const sizeByInput = INPUT_SIZES[addressType.toLowerCase()] || INPUT_SIZES.p2tr;
  return sizeByInput * count;
}

function estimateOutputSize(addressType: string, count: number): number {
  const sizeByOutput = OUTPUT_SIZES[addressType.toLowerCase()] || OUTPUT_SIZES.p2tr;
  return sizeByOutput * count;
}

function estimateScriptSize(compiledScriptSize: number): number {
  if (compiledScriptSize === 0) return 0;
  const valueSize = 8;
  const varintSize = compiledScriptSize < 0xFD ? 1 : compiledScriptSize <= 0xFFFF ? 3 : 5;
  const totalSize = valueSize + varintSize + compiledScriptSize;

  return totalSize;
}

export function estimateOutputVbytes(addressType: string): number {
  switch(addressType) {
    case 'p2tr':
      return OUTPUT_SIZES.p2tr;
    case 'p2wpkh':
      return OUTPUT_SIZES.p2wpkh;
    case 'p2pkh':
    case 'p2sh':
      return OUTPUT_SIZES.p2sh;
    default:
      return OUTPUT_SIZES.p2tr;
  }
}

export function validateBitcoinAddress(address: string, network: bitcoin.Network): boolean {
  try {
    bitcoin.address.toOutputScript(address, network);
    return true;
  } catch {
    return false;
  }
}

// Cette fonction reste utile pour les calculs de frais
export function getAddressType(address: string): string {
  if (address.startsWith('bc1p') || address.startsWith('tb1p')) {
    return 'p2tr';
  }
  if (address.startsWith('bc1q') || address.startsWith('tb1q')) {
    return 'p2wpkh';
  }
  if (address.startsWith('3') || address.startsWith('2')) {
    return 'p2sh';
  }
  if (address.startsWith('1') || address.startsWith('m') || address.startsWith('n')) {
    return 'p2pkh';
  }
  return 'unknown';
}
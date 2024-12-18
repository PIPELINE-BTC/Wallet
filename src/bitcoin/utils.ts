import { Buffer } from "buffer";
import * as bitcoin from 'bitcoinjs-lib';


export enum InputType {
  Taproot = 'taproot',
  Segwit = 'segwit',
  Legacy = 'legacy',
}

export enum OutputType {
  Taproot = 'taproot',
  Segwit = 'segwit',
  Legacy = 'legacy',
}

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
export function estimateTransactionVBytes(inputCount: number, outputCount: number, scriptSize: number, type: string = "p2tr"): number {
  const baseSize = type === "p2tr" ? 10.5 : 10;

  const inputBaseSize = estimateInputSize(type, inputCount);
  const outputSize = estimateOutputSize(type, outputCount);
  const finalScriptSize = estimateScriptSize(scriptSize);

  const totalVBytes = baseSize + inputBaseSize + outputSize + finalScriptSize;

  return Math.ceil(totalVBytes);
}

function estimateInputSize(addressType: string, count: number): number {
  let sizeByInput: number = 0;

  switch (addressType) {
      case "p2wpkh":
          sizeByInput = 68;
          break;

      case "p2tr":
          sizeByInput = 57.5;
          break;
  }

  return sizeByInput * count;
}

function estimateOutputSize(addressType: string, count: number): number {
  let sizeByOutput: number = 0;

  switch (addressType) {
      case "p2wpkh":
          sizeByOutput = 31;
          break;
      case "p2tr":
          sizeByOutput = 43;
          break;
  }

  return count * sizeByOutput;
}

function estimateScriptSize(compiledScriptSize: number): number {
  const valueSize = 8;
  const varintSize = compiledScriptSize < 0xFD ? 1 : compiledScriptSize <= 0xFFFF ? 3 : 5;
  const totalSize = valueSize + varintSize + compiledScriptSize;

  return totalSize;
}

export function getAverageVbytes(inputType: InputType = InputType.Taproot, outputType: OutputType = OutputType.Taproot): { inputVbytes: number; outputVbytes: number } {
  let inputVbytes: number;
  let outputVbytes: number;

  switch (inputType) {
      case InputType.Taproot:
          inputVbytes = 57.5;
          break;
      case InputType.Segwit:
          inputVbytes = 68;
          break;
      case InputType.Legacy:
          inputVbytes = 148;
          break;
      default:
          inputVbytes = 57.5;
  }

  switch (outputType) {
      case OutputType.Taproot:
          outputVbytes = 43;
          break;
      case OutputType.Segwit:
          outputVbytes = 31;
          break;
      case OutputType.Legacy:
          outputVbytes = 34;
          break;
      default:
          outputVbytes = 43;
  }

  return { inputVbytes, outputVbytes };
}

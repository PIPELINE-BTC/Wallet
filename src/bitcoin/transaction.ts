/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import BIP32Factory from "bip32";
import * as ecc from "@bitcoin-js/tiny-secp256k1-asmjs";
import * as bip39 from "bip39";
import { toXOnly, getAddressType, estimateOutputVbytes, BASE_OVERHEAD, INPUT_SIZES, OUTPUT_SIZES } from "./utils";
import * as bitcoin from 'bitcoinjs-lib';
import ECPairFactory from "ecpair";

import { Buffer } from "buffer";

import { decodeBtcRawTx } from "transaction-hex-decoder";

import axios from "axios";

import { accessService } from "../background";

import { calculateFeeBySize, estimateFee } from "./wallet";
import { toBytes, toInt26, textToHex, base64ToHex, hexToBase64, estimateTransactionVBytes } from "./utils";

export const signPsbt = async (psbtHex: string, index = -1) => {

  const psbtUncoded = hexToBase64(psbtHex);

  const selectedNetwork = accessService.store.network;
  const network =
    selectedNetwork === "testnet"
      ? bitcoin.networks.testnet
      : bitcoin.networks.bitcoin;
  bitcoin.initEccLib(ecc);

  const psbt = bitcoin.Psbt.fromBase64(psbtUncoded, { network: network });

  let childNode, childNodeXOnlyPubkey;

  const isFromWif = accessService.store.currentAccount.wif ? true : false;

  const mnemonic = isFromWif ? accessService.store.currentAccount.wif.livenet : accessService.store.currentAccount.mnemonic;
  const currentWalletIndex = accessService.store.currentWallet.index;

  if (!isFromWif) {
    const bip32 = BIP32Factory(ecc);
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const rootKey = bip32.fromSeed(seed, network);
    childNode = rootKey.derivePath(`m/86'/0'/0'/0/${currentWalletIndex - 1}`);
    childNodeXOnlyPubkey = toXOnly(childNode.publicKey);
  }
  else {
    const ECPairInstance: ECPairAPI = ECPairFactory(ecc);
    const keyPair = ECPairInstance.fromWIF(mnemonic);
    childNode = keyPair;
    childNodeXOnlyPubkey = toXOnly(childNode.publicKey);
  }

  const { address, output } = bitcoin.payments.p2tr({
    internalPubkey: childNodeXOnlyPubkey,
    network,
  });

  const account2 = bitcoin.payments.p2tr({
    internalPubkey: psbt.data.inputs[0].tapInternalKey,
    network,
  });

  const tweakedChildNode = childNode.tweak(
    bitcoin.crypto.taggedHash("TapTweak", childNodeXOnlyPubkey)
  );

  try {
    let isSigned = false;
    if (index === -1) {
      for (let i = 0; i < psbt.inputCount; i++) {
        const inputData = psbt.data.inputs[i];
        const inputKeyBuffer = inputData.tapInternalKey;
        if (inputKeyBuffer && childNodeXOnlyPubkey.equals(inputKeyBuffer)) {
          const sighashType = inputData.sighashType || bitcoin.Transaction.SIGHASH_ALL;
          psbt.signInput(i, tweakedChildNode, [sighashType]);
        }
      }
      isSigned = true;
    }
    else {
      const sighashType = inputData.sighashType || bitcoin.Transaction.SIGHASH_ALL;
      psbt.signInput(index, tweakedChildNode, [sighashType]);
      isSigned = true;
    }

    if (!isSigned) {
      throw "No input found to sign with this address";
    }

    // Add Finalization option

    const signedPsbtBase64 = psbt.toBase64();
    const signedPsbtHex = base64ToHex(signedPsbtBase64);


    chrome.runtime.sendMessage({
      action: "signPsbtSuccess",
      signedPsbtBase64: signedPsbtHex
    });
  }
  catch (error) {
    chrome.runtime.sendMessage({
      action: "failedSignedPsbt",
      error: error.toString(),
    });
  }
};

export const signPsbts = async (
  psbts: string[],
  options?: { finalize?: boolean; index?: number }[]
) => {

  try {

    if (!options) {
      options = psbts.map(() => ({ finalize: true, index: -1 }));
    }

    if (psbts.length !== options.length) {
      throw new Error("The psbts array and options array must have the same length.");
    }

    const signedPsbtResults: { psbt: string; signed?: boolean; error?: string }[] = [];
    let allSigned = true;

    for (let i = 0; i < psbts.length; i++) {
      const psbtHex = psbts[i];
      const finalizeOption = options[i]?.finalize ?? true;
      const targetIndex = options[i]?.index ?? -1;

      try {
        const psbtUncoded = hexToBase64(psbtHex);

        const selectedNetwork = accessService.store.network;
        const network =
          selectedNetwork === "testnet"
            ? bitcoin.networks.testnet
            : bitcoin.networks.bitcoin;
        bitcoin.initEccLib(ecc);

        const psbt = bitcoin.Psbt.fromBase64(psbtUncoded, { network: network });

        let childNode, childNodeXOnlyPubkey;

        const isFromWif = accessService.store.currentAccount.wif ? true : false;

        const mnemonic = isFromWif
          ? accessService.store.currentAccount.wif.livenet
          : accessService.store.currentAccount.mnemonic;
        const currentWalletIndex = accessService.store.currentWallet.index;

        if (!isFromWif) {
          const bip32 = BIP32Factory(ecc);
          const seed = await bip39.mnemonicToSeed(mnemonic);
          const rootKey = bip32.fromSeed(seed, network);
          childNode = rootKey.derivePath(`m/86'/0'/0'/0/${currentWalletIndex - 1}`);
          childNodeXOnlyPubkey = toXOnly(childNode.publicKey);
        } else {
          const ECPairInstance: ECPairAPI = ECPairFactory(ecc);
          const keyPair = ECPairInstance.fromWIF(mnemonic);
          childNode = keyPair;
          childNodeXOnlyPubkey = toXOnly(childNode.publicKey);
        }

        const tweakedChildNode = childNode.tweak(
          bitcoin.crypto.taggedHash("TapTweak", childNodeXOnlyPubkey)
        );

        let isSigned = false;

        if (targetIndex === -1) {
          for (let j = 0; j < psbt.inputCount; j++) {
            const inputData = psbt.data.inputs[j];
            const inputKeyBuffer = inputData.tapInternalKey;
            if (inputKeyBuffer && childNodeXOnlyPubkey.equals(inputKeyBuffer)) {
              const sighashType =
                inputData.sighashType || bitcoin.Transaction.SIGHASH_ALL;
              psbt.signInput(j, tweakedChildNode, [sighashType]);
            }
          }
          isSigned = true;
        } else {
          if (targetIndex < 0 || targetIndex >= psbt.inputCount) {
            throw new Error(`Invalid index ${targetIndex} for PSBT with ${psbt.inputCount} inputs.`);
          }

          const inputData = psbt.data.inputs[targetIndex];
          const inputKeyBuffer = inputData.tapInternalKey;
          if (inputKeyBuffer && childNodeXOnlyPubkey.equals(inputKeyBuffer)) {
            const sighashType =
              inputData.sighashType || bitcoin.Transaction.SIGHASH_ALL;
            psbt.signInput(targetIndex, tweakedChildNode, [sighashType]);
            isSigned = true;
          } else {
            throw "No input found to sign with this address at the specified index";
          }
        }

        if (!isSigned) {
          throw "No input found to sign with this address";
        }

        if (finalizeOption) {
          psbt.finalizeAllInputs();
        }

        const signedPsbtBase64 = psbt.toBase64();
        const signedPsbtHex = base64ToHex(signedPsbtBase64);

        signedPsbtResults.push({ psbt: signedPsbtHex });

      } catch (error) {
        signedPsbtResults.push({ psbt: psbtHex, signed: false, error: error.toString() });
        allSigned = false;
      }
    }

    if (!allSigned) {
      const firstError = signedPsbtResults.find(result => !result.signed)?.error?.toString() || "Unknown error occurred";
      chrome.runtime.sendMessage({
        action: "failedSignedPsbts",
        error: firstError,
      });
    } else {
      chrome.runtime.sendMessage({
        action: "signPsbtsSuccess",
        signedPsbtsBase64: signedPsbtResults,
      });
    }
  }
  catch (error) {
    chrome.runtime.sendMessage({
      action: "failedSignedPsbts",
      error: error.toString(),
    });
  }
};

export const sendSats = async (
  mnemonic,
  to,
  amountBtc,
  index,
  txfee,
  isFromWif,
  isActuallySend,
  isMax = false
) => {

  bitcoin.initEccLib(ecc);
  const bip32 = BIP32Factory(ecc);
  const selectedNetwork = accessService.store.network;
  const network = selectedNetwork === "livenet"
    ? bitcoin.networks.bitcoin
    : bitcoin.networks.testnet;

  let childNode, childNodeXOnlyPubkey;

  if (!isFromWif) {
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const rootKey = bip32.fromSeed(seed, network);
    childNode = rootKey.derivePath(`m/86'/0'/0'/0/${index}`);
    childNodeXOnlyPubkey = toXOnly(childNode.publicKey);
  } else {
    const ECPairInstance = ECPairFactory(ecc);
    childNode = ECPairInstance.fromWIF(mnemonic);
    childNodeXOnlyPubkey = toXOnly(childNode.publicKey);
  }

  const { address } = bitcoin.payments.p2tr({
    internalPubkey: childNodeXOnlyPubkey,
    network,
  });


  const tweakedChildNode = childNode.tweak(
    bitcoin.crypto.taggedHash("TapTweak", childNodeXOnlyPubkey)
  );

  let utxoUrl, assetsUrl;

  if (selectedNetwork === "testnet") {
    utxoUrl = `https://mempool.space/testnet/api/address/${address}/utxo`;
    assetsUrl = `https://data.ppline.app:5099/getAddrDD?addr=${address}`;
  } else {
    utxoUrl = `https://data2.ppline.app:5020/api/address/${address}/utxo`;
    assetsUrl = `https://data2.ppline.app:5098/getAddrD?addr=${address}`;
  }

  const [utxosResponse, tokensResponse, ordinalsTokensResponse] = await Promise.all([
    axios.get(utxoUrl),
    axios.get(assetsUrl),
    axios.get(`https://api.hiro.so/ordinals/v1/inscriptions?address=${address}&offset=0&limit=60`)
  ]);

  const utxos = utxosResponse.data;
  const tokens = tokensResponse.data;
  let ordinalsTokens = ordinalsTokensResponse.data.results;

  if (ordinalsTokensResponse.data.total > 60) {
    const totalPages = Math.ceil(ordinalsTokensResponse.data.total / 60);
    const requests = [];
    for (let i = 1; i < totalPages; i++) {
      requests.push(axios.get(`https://api.hiro.so/ordinals/v1/inscriptions?address=${address}&offset=${i * 60}&limit=60`));
    }
    const responses = await Promise.all(requests);
    const additionalTokens = responses.flatMap(response => response.data.results);
    ordinalsTokens = ordinalsTokens.concat(additionalTokens);
  }

  let balanceSat = 0;
  let psbt = new bitcoin.Psbt({ network });
  let _psbt = new bitcoin.Psbt({ network });

  const sortedUtxos = utxos.sort((a, b) => b.value - a.value);
  const inputsData = [];
  const availableInput = [];
  const usedUtxos = new Set();
  const selectedUtxos = [];
  const additionalFeeForInput = INPUT_SIZES.p2tr * txfee;
  let totalSelectedValue = 0;
  let totalAvailableValue = 0;

  let amountToBeSentSat = Math.floor(amountBtc * 1e8);

  const senderAddressType = getAddressType(to, network);
  const outputSize = estimateOutputVbytes(senderAddressType);
  
  const inputSize = INPUT_SIZES.p2tr;

<<<<<<< HEAD
  let estimatedFee = Math.floor((BASE_OVERHEAD + inputSize + outputSize) * txfee);
=======
  let estimatedFee = (BASE_OVERHEAD + inputSize + outputSize) * txfee;
>>>>>>> a3cfd33e7f6c028ea341dbb527ff6c5434e90c92

  if (amountToBeSentSat < 0) {
    throw new Error("Not enough BTC to cover fees");
  }

  let targetValue = isMax ? amountToBeSentSat : estimatedFee + amountToBeSentSat;
  for (const utxo of sortedUtxos) {
    if (isUtxoAToken(utxo, tokens, ordinalsTokens)) {
      continue;
    }

    const _input = {
      hash: utxo.txid,
      index: utxo.vout,
      witnessUtxo: {
        value: utxo.value,
      },
      tapInternalKey: childNodeXOnlyPubkey,
    };

    const _utxo = utxo.txid + ":" + utxo.vout;
    let isUsed = usedUtxos.has(_utxo);

    if (totalSelectedValue < targetValue) {
      if (!isUsed) {
        inputsData.push(_input);
        selectedUtxos.push(utxo);
        isUsed = true;
        totalSelectedValue += utxo.value;
        usedUtxos.add(_utxo);
      }
    }

    if (!isUsed) {
      totalAvailableValue += utxo.value;
      availableInput.push(_input);
    }

  }
  if (totalSelectedValue < targetValue || (amountToBeSentSat < estimatedFee && isMax)) {
    throw new Error("Not enough BTC to cover fees");
  }

  for (const input of inputsData) {

    let hexUrl;

    if (selectedNetwork === "testnet") {
      hexUrl = `https://mempool.space/testnet/api/tx/${input.hash}/hex`;
    } else {
      hexUrl = `https://data2.ppline.app:5020/api/tx/${input.hash}/hex`;
    }

    const rawTx = await axios.get(
      hexUrl
    );

    const decodedTx = decodeBtcRawTx(rawTx.data);

    if (input.index >= decodedTx.outs.length) {
      continue;
    }

    const utxoScript = Buffer.from(decodedTx.outs[input.index].script, "hex");

    const tx = bitcoin.Transaction.fromHex(rawTx.data);
    const nonWitnessUtxo = tx.toBuffer();

    input.witnessUtxo.script = utxoScript;
    psbt.addInput(input);
    _psbt.addInput(input);
  }

  _psbt.addOutput({ address: to, value: isMax ? amountToBeSentSat - estimatedFee : amountToBeSentSat });

  balanceSat = totalSelectedValue + totalAvailableValue;

  let changeSat = isMax ? 0 : totalSelectedValue - targetValue;

  if (changeSat > 0) {
    _psbt.addOutput({ address, value: changeSat });
  }

  for (let i = 0; i < _psbt.inputCount; i++) {
    _psbt.signInput(i, tweakedChildNode);
  }

  _psbt.finalizeAllInputs();

  const rawTx = _psbt.extractTransaction(true);
  const vsize = rawTx.virtualSize();

  let calculatedFee = Math.floor(vsize * txfee);

  changeSat = Math.floor(isMax ? amountToBeSentSat - calculatedFee : totalSelectedValue - amountToBeSentSat - calculatedFee);

  if (changeSat < 0) {
    if (balanceSat - amountToBeSentSat - calculatedFee < 0) {
      throw new Error("Not enough BTC to cover the fees");
    }
    else {
      let additionalInputs = [];
      let index = 0;

      if (availableInput.length === 0) {
        throw new Error("Not enough funds");
      }

      for (const inputD of availableInput) {
        if (index >= 10) {
          throw new Error("Not enough funds per UTXO, limit of 10 more inputs reached");
        }

        calculatedFee += Math.floor(additionalFeeForInput);
        additionalInputs.push(inputD);

        changeSat += inputD.witnessUtxo.value - Math.floor(additionalFeeForInput);
        if (changeSat >= 0) {
          break;
        }

        index++;
      }

      if (changeSat < 0) {
        throw new Error("Not enough BTC to cover the fees.");
      }


      for (const inputD of additionalInputs) {

        let hexUrl;
        if (selectedNetwork === "testnet") {
          hexUrl = `https://mempool.space/testnet/api/tx/${input.hash}/hex`;
        } else {
          hexUrl = `https://data2.ppline.app:5020/api/tx/${inputD.hash}/hex`;
        }

        try {
          const rawTxResponse = await axios.get(hexUrl);
          const decodedTx = decodeBtcRawTx(rawTxResponse.data);
          if (inputD.index >= decodedTx.outs.length) {
            continue;
          }

          const utxoScript = Buffer.from(decodedTx.outs[inputD.index].script, "hex");
          inputD.witnessUtxo.script = utxoScript;

          psbt.addInput(inputD);
        } catch (error) {
          console.error(`Failed to fetch or decode transaction: ${error}`);
          throw new Error("Failed to process inputs due to external data retrieval error");
        }
      }
    }
  }
  let amountInSat = Math.floor(amountBtc * 1e8);
  psbt.addOutput({ address: to, value: isMax ? amountInSat - calculatedFee : amountInSat });
  if (changeSat > 0 && !isMax) {
    psbt.addOutput({ address, value: changeSat });
  }
  for (let i = 0; i < psbt.inputCount; i++) {
    psbt.signInput(i, tweakedChildNode);
  }
  psbt.finalizeAllInputs();

  const rawTx2 = psbt.extractTransaction(true);
  const vsize2 = rawTx2.virtualSize();

  calculatedFee = Math.floor(vsize2 * txfee);

  if (!isActuallySend) {
    return { calculatedFee, balanceSat };
  }

  const tx = psbt.extractTransaction(true).toHex();

  let pushURL;

  if (selectedNetwork === "testnet") {
    pushURL = `https://mempool.space/testnet/api/tx`;

  } else {
    pushURL = `https://data2.ppline.app:5020/push`;
  }
  const response = await axios.post(pushURL, tx, {
    headers: { "Content-Type": "text/plain" },
  });

  return response.data;
};

function isUtxoAToken(utxo, tokens, ordinalsTokens, exclude = new Set()) {
  const utxoKey = utxo.txid + ":" + utxo.vout;

  if (exclude.size > 0 && exclude.has(utxoKey)) {
    return false;
  }

  const tokenRelatedUTXOs = new Set(tokens.flatMap(token =>
    token.locations.map(location => location.split(":").slice(1).join(":"))
  ));

  const ordinalRelatedTxHashes = new Set(ordinalsTokens.map(ord => ord.location.split(":")[0]));

  if (!tokenRelatedUTXOs.has(utxoKey) && utxo.value <= 546) {
    return true;
  }

  return tokenRelatedUTXOs.has(utxoKey) || ordinalRelatedTxHashes.has(utxo.txid);
}

function selectTokenRelatedUtxos(tokens: any[], ticker: string, id: string, requiredAmount: number): { selectedUtxos: Set<string>, cumulativeAmount: number, deci: number } {
  let deci = -1;

  const token = tokens.find(token =>
    token.ticker.toLowerCase() === ticker.toLowerCase() &&
    token.id === id
  );

  if (!token) {
    return { selectedUtxos: new Set(), cumulativeAmount: 0, deci };
  }

  let cumulativeAmount = 0;
  deci = token.deci;
  const selectedUtxos: string[] = [];

  for (const location of token.locations) {
    const [amount, txid, vout] = location.split(':');
    const numericAmount = parseFloat(amount);

    cumulativeAmount += numericAmount;
    selectedUtxos.push(`${txid}:${vout}`);

    if (cumulativeAmount >= requiredAmount) {
      break;
    }
  }

  if (cumulativeAmount < requiredAmount) {
    return { selectedUtxos: new Set(), cumulativeAmount: 0, deci: -1 };
  }

  return { selectedUtxos: new Set(selectedUtxos), cumulativeAmount, deci };
}

export const sendTransactionByPSBT = async (psbtData: string) => {
  const selectedNetwork = accessService.store.network;

  const pushURL = `https://data2.ppline.app:5020/push`;

  const response = await axios.post(pushURL, psbtData, {
    headers: { "Content-Type": "text/plain" },
  });

  return response.data;
};

export const completePsbt = async (psbtHex, to, index = 0) => {
  const selectedNetwork = accessService.store.network;

  const decodedBase64Psbt = hexToBase64(psbtHex);

  const psbt = bitcoin.Psbt.fromBase64(decodedBase64Psbt, {
    network: bitcoin.networks.testnet,
  });

  const mnemonic = accessService.store.currentAccount.mnemonic;

  bitcoin.initEccLib(ecc);

  const bip32 = BIP32Factory(ecc);

  const network =
    selectedNetwork === "livenet"
      ? bitcoin.networks.bitcoin
      : bitcoin.networks.testnet;

  const path = `m/86'/0'/0'/0/${index}`;
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const rootKey = bip32.fromSeed(seed);

  const childNode = rootKey.derivePath(path);
  const childNodeXOnlyPubkey = toXOnly(childNode.publicKey);

  const { address, output } = bitcoin.payments.p2tr({
    internalPubkey: childNodeXOnlyPubkey,
    network,
  });

  psbt.addOutput({
    address: address,
    value: 546,
  });

  const txHex = psbt.finalizeAllInputs().extractTransaction().toHex();

  const response = await axios.post(
    `https://mempool.space/${selectedNetwork}/api/tx`,
    txHex,
    {
      headers: {
        "Content-Type": "text/plain",
      },
    }
  );

  await chrome.storage.local.set({ hash: response.data });

  await chrome.tabs.query({ active: true, currentWindow: true });

  await chrome.runtime.sendMessage({
    action: "createTransactionFromPsbt",
    type: "createTransactionFromPsbt",
    psbt: response.data,
  });

  await chrome.runtime.sendMessage({
    type: "createTransaction",
    psbt: response.data,
  });

  return response.data;
};

export const sendTransferTransaction = async (
  mnemonic,
  to,
  ticker,
  id,
  transferAmount,
  index,
  txfee,
  isFromWif,
  isActuallySend,
  isMax = false
) => {
  bitcoin.initEccLib(ecc);
  const bip32 = BIP32Factory(ecc);
  const selectedNetwork = accessService.store.network;
  const network =
    selectedNetwork === "livenet"
      ? bitcoin.networks.bitcoin
      : bitcoin.networks.testnet;

  let seed, rootKey, childNode, childNodeXOnlyPubkey;

  const path = `m/86'/0'/0'/0/${index}`;
  if (!isFromWif) {
    seed = await bip39.mnemonicToSeed(mnemonic);
    rootKey = bip32.fromSeed(seed);

    childNode = rootKey.derivePath(path);
    childNodeXOnlyPubkey = toXOnly(childNode.publicKey);
  }

  if (isFromWif) {
    const ECPairInstance: ECPairAPI = ECPairFactory(ecc);

    const keyPair = ECPairInstance.fromWIF(mnemonic);

    childNode = keyPair;

    childNodeXOnlyPubkey = toXOnly(childNode.publicKey);
  }
  const { address, output } = bitcoin.payments.p2tr({
    internalPubkey: childNodeXOnlyPubkey,
    network,
  });


  const tweakedChildNode = childNode.tweak(
    bitcoin.crypto.taggedHash("TapTweak", childNodeXOnlyPubkey)
  );

  const additionalFeeForInput = 57 * txfee;

  let utxoUrl, assetsUrl;

  if (selectedNetwork === "testnet") {
    utxoUrl = `https://mempool.space/testnet/api/address/${address}/utxo`;
    assetsUrl = `https://data.ppline.app:5099/getAddrDD?addr=${address}`;
  } else {
    utxoUrl = `https://data2.ppline.app:5020/api/address/${address}/utxo`;
    assetsUrl = `https://data2.ppline.app:5098/getAddrD?addr=${address}`;
  }

  const [utxosResponse, tokensResponse, ordinalsTokensResponse] = await Promise.all([
    axios.get(utxoUrl),
    axios.get(assetsUrl),
    axios.get(`https://api.hiro.so/ordinals/v1/inscriptions?address=${address}&offset=0&limit=60`)
  ]);

  const utxos = utxosResponse.data;
  const tokens = tokensResponse.data;
  let ordinalsTokens = ordinalsTokensResponse.data.results;

  if (ordinalsTokensResponse.data.total > 60) {
    const totalPages = Math.ceil(ordinalsTokensResponse.data.total / 60);
    const requests = [];
    for (let i = 1; i < totalPages; i++) {
      requests.push(axios.get(`https://api.hiro.so/ordinals/v1/inscriptions?address=${address}&offset=${i * 60}&limit=60`));
    }
    const responses = await Promise.all(requests);
    const additionalTokens = responses.flatMap(response => response.data.results);
    ordinalsTokens = ordinalsTokens.concat(additionalTokens);
  }

  let calculatedFee = 0;

  let psbt = new bitcoin.Psbt({
    network,
  });

  let _psbt = new bitcoin.Psbt({
    network,
  });

  const usedUtxos = new Set();

  const sortedUtxos = utxos.sort((a, b) => b.value - a.value);

  const selectedUtxos = [];
  let totalSelectedValue = 0;
  let totalAvailableValue = 0;

  const selectedToken: { selectedUtxos: Set<string>, cumulativeAmount: number, deci: number } = selectTokenRelatedUtxos(tokens, ticker, id, transferAmount);
  const selectedUtxosToken = selectedToken.selectedUtxos;
  const deci = selectedToken.deci;

  const transferAmountHex = parseFloat(transferAmount);
  const outputIndex = 0;

  let data = [
    bitcoin.opcodes.OP_RETURN,
    Buffer.from("P"),
    Buffer.from("T"),
    Buffer.from(toBytes(toInt26(ticker))),
    Buffer.from(toBytes(BigInt(id))),
    Buffer.from(toBytes(BigInt(outputIndex))),
    Buffer.from(textToHex("" + parseFloat(transferAmountHex.toFixed(deci))), "hex"),
  ];

  if (selectedToken.cumulativeAmount > transferAmountHex) {
    const transferChange = selectedToken.cumulativeAmount - transferAmountHex;
    const changeData = [
      Buffer.from(toBytes(toInt26(ticker))),
      Buffer.from(toBytes(BigInt(id))),
      Buffer.from(toBytes(BigInt(1))),
      Buffer.from(textToHex("" + parseFloat(transferChange.toFixed(deci))), "hex"),
    ];

    data = [...data, ...changeData];
  }

  const baseOutput = [
    { type: getAddressType(to), count: 1 },
    ...(selectedToken.cumulativeAmount > transferAmount ? [{ type: "p2tr", count: 1 }] : []),
    { type: "p2tr", count: 1 },
  ];
  
  const baseInput = 2;
  const tapscriptBitcoin = bitcoin.script.compile(data);

  calculatedFee = Math.floor(estimateTransactionVBytes(baseInput, baseOutput, tapscriptBitcoin.length) * txfee);

  let inputsData = [];
  let availableInput = [];

  if (selectedUtxosToken.size === 0) {
    throw new Error("No enough tokens attached found");
  }

  if (deci === -1) {
    throw new Error("Error with the Token Deploy Data");
  }

  for (const token of selectedUtxosToken) {
    const [txid, vout] = token.split(':');
    const index = sortedUtxos.findIndex(e => e.txid === txid && parseInt(e.vout) === parseInt(vout));

    if (index !== -1) {
      const _utxo = sortedUtxos[index];
      sortedUtxos.splice(index, 1);
      const _input = {
        hash: _utxo.txid,
        index: _utxo.vout,
        witnessUtxo: {
          value: _utxo.value,
        },
        tapInternalKey: childNodeXOnlyPubkey,
      };
      inputsData.push(_input);

      totalSelectedValue += _utxo.value;
    }
  }
  let _calcPostageFees = isMax ? 546 : 1092;
  let targetValue = calculatedFee + _calcPostageFees;

  for (const utxo of sortedUtxos) {
    if (isUtxoAToken(utxo, tokens, ordinalsTokens)) {
      continue;
    }

    const _input = {
      hash: utxo.txid,
      index: utxo.vout,
      witnessUtxo: {
        value: utxo.value,
      },
      tapInternalKey: childNodeXOnlyPubkey,
    };

    const _utxo = utxo.txid + ":" + utxo.vout;
    let isUsed = usedUtxos.has(_utxo);

    if (totalSelectedValue < targetValue) {
      if (!isUsed) {
        inputsData.push(_input);
        selectedUtxos.push(utxo);
        isUsed = true;
        totalSelectedValue += utxo.value;
        usedUtxos.add(_utxo);
      }
    }

    if (!selectedUtxosToken.has(_utxo) && !isUsed) {
      totalAvailableValue += utxo.value;
      availableInput.push(_input);
    }

  }
  if (totalSelectedValue < targetValue) {
    throw new Error("Not enough BTC to cover fees");
  }

  for (const input of inputsData) {

    let hexUrl;

    if (selectedNetwork === "testnet") {
      hexUrl = `https://mempool.space/testnet/api/tx/${input.hash}/hex`;
    } else {
      hexUrl = `https://data2.ppline.app:5020/api/tx/${input.hash}/hex`;
    }

    const rawTx = await axios.get(
      hexUrl
    );

    const decodedTx = decodeBtcRawTx(rawTx.data);

    if (input.index >= decodedTx.outs.length) {
      continue;
    }

    const utxoScript = Buffer.from(decodedTx.outs[input.index].script, "hex");

    const tx = bitcoin.Transaction.fromHex(rawTx.data);
    const nonWitnessUtxo = tx.toBuffer();

    input.witnessUtxo.script = utxoScript;
    _psbt.addInput(input);
    psbt.addInput(input);
  }
  const balanceSat = totalSelectedValue;
  let changeSat;

  let postageFee = _calcPostageFees;

  psbt.addOutput({
    address: to,
    value: 546,
  });

  _psbt.addOutput({
    address: to,
    value: 546,
  });

  if (selectedToken.cumulativeAmount > transferAmount) {

    psbt.addOutput({
      address: address,
      value: 546,
    });

    _psbt.addOutput({
      address: address,
      value: 546,
    });

    changeSat = balanceSat - postageFee - calculatedFee;

    if (changeSat > 0) {
      _psbt.addOutput({
        address: address,
        value: changeSat,
      });
    }
  } else {
    _psbt.addOutput({
      address: address,
      value: balanceSat - postageFee - calculatedFee,
    });
  }


  _psbt.addOutput({
    script: tapscriptBitcoin,
    value: 0,
  });

  for (let i = 0; i < _psbt.inputCount; i++) {
    _psbt.signInput(i, tweakedChildNode);
  }
  _psbt.finalizeAllInputs();

  const _rawTx = _psbt.extractTransaction(true);
  const _vsize = _rawTx.virtualSize();

  calculatedFee = Math.floor(_vsize * txfee + postageFee);
  changeSat = balanceSat - calculatedFee;

  let totalValueAdded = 0;

  if (changeSat < 0) {
    let additionalInputs = [];
    let index = 0;

    if (availableInput.length === 0) {
      throw new Error("Not enough funds");
    }

    for (const inputD of availableInput) {
      if (index >= 10) {
        throw new Error("Not enough funds per UTXO, limit of 10 inputs reached");
      }

      totalValueAdded += inputD.witnessUtxo.value;
      additionalInputs.push(inputD);
      calculatedFee += Math.floor(57 * txfee);
      let _utxoValue = Math.floor(inputD.witnessUtxo.value - 57 * txfee);

      changeSat += _utxoValue;

      if (changeSat >= 0) {
        break;
      }

      index++;
    }

    for (const inputD of additionalInputs) {

      let hexUrl;
      if (selectedNetwork === "testnet") {
        hexUrl = `https://mempool.space/testnet/api/tx/${inputD.hash}/hex`;
      } else {
        hexUrl = `https://data2.ppline.app:5020/api/tx/${inputD.hash}/hex`;
      }

      try {
        const rawTxResponse = await axios.get(hexUrl);
        const decodedTx = decodeBtcRawTx(rawTxResponse.data);
        if (inputD.index >= decodedTx.outs.length) {
          continue;
        }

        const utxoScript = Buffer.from(decodedTx.outs[inputD.index].script, "hex");
        inputD.witnessUtxo.script = utxoScript;

        psbt.addInput(inputD);
      } catch (error) {
        console.error(`Failed to fetch or decode transaction: ${error}`);
        throw new Error("Failed to process inputs due to external data retrieval error");
      }
    }
  }

  if (changeSat > 0) {
    psbt.addOutput({
      address: address,
      value: changeSat,
    });
  }

  psbt.addOutput({
    script: tapscriptBitcoin,
    value: 0,
  });


  for (let i = 0; i < psbt.inputCount; i++) {
    psbt.signInput(i, tweakedChildNode);
  }
  psbt.finalizeAllInputs();
  const rawTx = psbt.extractTransaction(true);
  const vsize = rawTx.virtualSize();

  calculatedFee = Math.floor(vsize * txfee + postageFee);

  if (totalValueAdded + totalSelectedValue < calculatedFee) {
    let _missingSats = (calculatedFee - (totalValueAdded + totalSelectedValue)) * 10 ** -8;
    throw new Error(`Not enough BTC to cover fees, missing ${_missingSats.toFixed(8)} BTC`);
  }

  if (!isActuallySend) {
    return { calculatedFee };
  }
  const tx = rawTx.toHex();
  let pushURL;

  if (selectedNetwork === "testnet") {
    pushURL = `https://mempool.space/testnet/api/tx`;
  } else {
    pushURL = `https://data2.ppline.app:5020/push`;
  }
  const response = await axios.post(pushURL, tx, {
    headers: { "Content-Type": "text/plain" },
  });

  return response.data;
};
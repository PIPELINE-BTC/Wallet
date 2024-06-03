/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import BIP32Factory from "bip32";
import * as ecc from "@bitcoin-js/tiny-secp256k1-asmjs";
import * as bip39 from "bip39";
import ECPairFactory, { ECPairAPI, ECPairInterface } from "ecpair";
import { toXOnly } from "./utils";
import * as bitcoin from 'bitcoinjs-lib';

import axios from "axios";

import { accessService } from "../background";

import { getPipeArtData } from "./pipeArt";

bitcoin.initEccLib(ecc);
const ECPairInstance: ECPairAPI = ECPairFactory(ecc);
const bip32 = BIP32Factory(ecc);

export function generateWallet() {
  bip39.setDefaultWordlist("english");
  const mnemonic = bip39.generateMnemonic();

  return importWallet(mnemonic);
}

export function importWallet(mnemonic: string, index: number = 0) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const rootKey = bip32.fromSeed(seed, bitcoin.networks.bitcoin);
  const rootKeyTest = bip32.fromSeed(seed, bitcoin.networks.testnet);
  const livenet = generateNewAddress(rootKey, index, "livenet");
  const testnet = generateNewAddress(rootKeyTest, index, "testnet");

  const wifTest = testnet.account.toWIF();
  const wifLive = livenet.account.toWIF();

  return {
    p2tr: {
      livenet: livenet.p2tr,
      testnet: testnet.p2tr,
    },
    privateKey: {
      livenet: livenet.privateKey,
      testnet: testnet.privateKey,
    },
    mnemonic,
    rootKey,
    wif: {
      testnet: wifTest,
      livenet: wifLive,
    },
  };
}

export function importWalletFromWif(wif: any, index: number = 0) {
  const rootKey: ECPairInterface = ECPairInstance.fromWIF(wif, [
    bitcoin.networks.bitcoin,
    bitcoin.networks.testnet,
  ]);
  const testnet = generateNewAddress(rootKey, index, "testnet");
  const livenet = generateNewAddress(rootKey, index, "livenet");

  return {
    p2tr: {
      testnet: testnet.p2tr,
      livenet: livenet.p2tr,
    },
    privateKey: {
      livenet: livenet.privateKey,
      testnet: testnet.privateKey,
    },
    mnemonic: "",
    rootKey,
    wif: {
      testnet: testnet.wif,
      livenet: livenet.wif,
    },
  };
}

export function generateNewAddress(
  rootKey: any,
  index: number = 0,
  selectedNetwork
) {
  if (rootKey?.privateKey === undefined) throw new Error("Invalid private key");
  const network =
    selectedNetwork === "livenet"
      ? bitcoin.networks.bitcoin
      : bitcoin.networks.testnet;

  const path = `m/86'/0'/0'/0/${index}`;

  let account;
  let internalPubkey;
  let p2tr;
  let privateKey;
  let wif;

  if (typeof rootKey.derivePath === "function") {
    account = rootKey.derivePath(path);
    internalPubkey = toXOnly(account.publicKey);
    privateKey = account.tweak(
      bitcoin.crypto.taggedHash("TapTweak", internalPubkey)
    );
    p2tr = bitcoin.payments.p2tr({
      internalPubkey: internalPubkey,
      network,
    }).address;
    wif = account.toWIF();
  } else if (typeof rootKey.publicKey === "object") {
    const keyPair = ECPairInstance.fromPrivateKey(rootKey.privateKey);
    wif = keyPair.toWIF();
    internalPubkey = toXOnly(rootKey.publicKey);
    const payments = bitcoin.payments.p2tr({
      internalPubkey: internalPubkey,
      network,
    });
    p2tr = payments.address;
  } else {
    throw new Error("Invalid rootKey object");
  }

  return {
    rootKey,
    account: account ?? rootKey,
    internalPubkey,
    p2tr,
    privateKey,
    wif,
  };
}

export function mnemonicFromWIF(wif: string) {
  const ECPairInstance: ECPairAPI = ECPairFactory(ecc);
  const rootKey: ECPairInterface = ECPairInstance.fromWIF(wif, [
    bitcoin.networks.bitcoin,
    bitcoin.networks.testnet,
  ]);
  const mnemonic = bip39.entropyToMnemonic(rootKey.privateKey);
  return mnemonic;
}

export async function getBalance(address: string) {
  const selectedNetwork = accessService.store.network;

  let utxoUrl, assetsUrl;

  if (selectedNetwork === "testnet") {
    utxoUrl = `https://blockstream.info/testnet/api/address/${address}/utxo`;
    assetsUrl = `https://data.ppline.app:5099/getAddrDD?addr=${address}`;
  } else {
    utxoUrl = `https://data3.ppline.app:5005/api/address/${address}/utxo`;
    assetsUrl = `https://data2.ppline.app:5098/getAddrD?addr=${address}`;
  }

  const [utxos, tokens, ordinalsTokensResponse] = await Promise.all([
    axios.get(utxoUrl),
    axios.get(assetsUrl),
    axios.get(`https://api.hiro.so/ordinals/v1/inscriptions?address=${address}&offset=0&limit=60`)
  ]);

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

  const tokenSet = new Set();
  tokens.data.forEach(token => {
    token.locations.forEach(location => {
      const [amount, txHash, index] = location.split(":");
      tokenSet.add(txHash + ':' + index);
    });
  });

  const ordinalsSet = new Set();
  ordinalsTokens.forEach(ord => {
    const [txHash, amount, index] = ord.location.split(":");
    ordinalsSet.add(txHash);
  });

  utxos.data.forEach(utxo => {
    const utxoKey = utxo.txid + ':' + utxo.vout;
    if (tokenSet.has(utxoKey) || utxo.value <= 546 || ordinalsSet.has(utxo.txid)) {
      return;
    }

    balanceSat += utxo.value;
  });

  return {
    onChainBalance: balanceSat / 1e8,
  };
}

export const estimateFee = async () => {
  const selectedNetwork = accessService.store.network;

  try {
    const response = await axios.get(
      `https://mempool.space${selectedNetwork === "testnet" ? "/testnet" : ""
      }/api/v1/fees/recommended`
    );
    return {
      halfHourFee: response.data.halfHourFee,
      fastestFee: response.data.fastestFee,
    };
  } catch (error) {
    return null;
  }
};

export const getTokens = async (address: string) => {
  const selectedNetwork = accessService.store.network;

  try {
    let mempoolUrl, assetsUrl;

    if (selectedNetwork === "testnet") {
      assetsUrl = `https://data.ppline.app:5099/getAddrDD?addr=${address}`;
      mempoolUrl = `https://blockstream.info/testnet/api/address/${address}/txs/mempool`;
    } else {
      assetsUrl = `https://data2.ppline.app:5098/getAddrD?addr=${address}`;
      mempoolUrl = `https://mempool.space/api/address/${address}/txs/mempool`;
    }

    const [resultData, accountTransactionsData] = await Promise.all([
      axios.get(assetsUrl),
      axios.get(mempoolUrl),
    ]);

    const result = resultData.data;
    const accountTransactions = accountTransactionsData.data;

    const filteredData = result.filter(item =>
      item.collectionAddr !== null || item.isPB
    );

    const pipeArtDataPromises = filteredData.map((item) => 
      getPipeArtData(item, selectedNetwork)
    )
      
    const pipeArtDataArray = await Promise.all(pipeArtDataPromises);

    const tokensPromises = result.map(async (element) => {
      const amt = await checkForLockedTokens(element, accountTransactions);
      return { ...element, amt };
    });
    const tokens = await Promise.all(tokensPromises);

    const nftsPromises = pipeArtDataArray.map(async (element) => {
      const amt = await checkForLockedTokens(element, accountTransactions);
      return { ...element, amt };
    });
    const nfts = await Promise.all(nftsPromises);

    return { result: tokens, nfts: nfts };
  } catch (error) {
    console.error("Failed to get tokens:", error);
    throw error;
  }
};


export const connect = async () => {
  const connectedWallet = accessService.store.currentWallet.address;

  await chrome.storage.local.set({ connectedWallet });

  await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.runtime.sendMessage({
    action: "connectToSite",
    address: connectedWallet,
  });
  chrome.runtime.sendMessage({
    type: "connect",
    address: connectedWallet,
  });
  return connectedWallet;
};

export const calculateFeeBySize = (psbtBuffer: any, txfee: string) => {
  return Buffer.byteLength(psbtBuffer) * txfee;
};

export const checkForLockedTokens = async (
  token: any,
  accountTransactions: any
) => {
  const locked = JSON.parse(localStorage.getItem("locked-tokens"));

  if (!locked) {
    if (token?.amt) {
      return token?.amt;
    }
    return token?.totalAmount;
  }

  let available;
  if (token?.amt) {
    available = token?.amt;
  } else {
    available = token?.totalAmount;
  }

  for (let i = 0; i < locked.length; i++) {
    if (
      (locked[i]?.ticker?.toLowerCase() == token?.ticker?.toLowerCase() &&
        locked[i]?.id == token?.id) ||
      `${locked[i]?.ticker}:${locked[i]?.id}`.toLowerCase() ===
      token?.tickerID?.toLowerCase()
    ) {
      if (accountTransactions.some((tx) => tx.txid === locked[i].txid)) {
        available -= locked[i].amount;
      } else {
        const lockedTokens = JSON.parse(localStorage.getItem("locked-tokens"));
        const filteredTokens = lockedTokens.filter((token) => {
          return !locked.some(
            (lockedToken) =>
              `${token?.ticker}:${token?.id}`.toLowerCase() ===
              `${lockedToken?.ticker}:${lockedToken?.id}`.toLowerCase() ||
              `${lockedToken?.ticker}:${lockedToken?.id}`.toLowerCase() ===
              token?.tickerID?.toLowerCase()
          );
        });
        localStorage.setItem("locked-tokens", JSON.stringify(filteredTokens));
      }
    }
  }

  return available;
};

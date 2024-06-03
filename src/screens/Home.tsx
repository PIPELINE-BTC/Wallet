/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";

import CopyIcon from "../assets/img/copy-icon.svg?react";
import Copy from "assets/img/copy.svg?react";
import History from "assets/img/history.svg?react";
import Send from "assets/img/send.svg?react";
import Qr from "assets/img/qr.svg?react";
import ArrowDropdown from "assets/img/arrow-dropdown.svg?react";
import { getAddress, copy } from "../utils";
import { AccountContext } from "../AccountContext";
import { getBalance, getTokens } from "../bitcoin/wallet";

import Modal from "../common/Modal";
import logo from "assets/img/logo-mini.svg";
import User from "assets/img/user.svg?react";
import Nfts from "../common/Nfts";
import Tokens from "../common/Tokens";
import toast from "react-hot-toast/headless";
import useWallet from "../hooks/useWallet";
import useClickOutside from "../hooks/useClickOutside";

const Home = () => {
  const [address, setAddress] = useState("");
  const [activeTab, setActiveTab] = useState("tokens");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [balance, setBalance] = useState<string>("----------");
  const { currentWallet, tokens, nfts, setAppState, network, currentAccount, currentRequest } =
    useContext(AccountContext);
  const navigate = useNavigate();
  const { handleSelectWallet } = useWallet();
  const dropdownRef = useRef<HTMLDivElement>(null);
  useClickOutside(dropdownRef, () => setIsOpen(false));

  const returnAddress = async (addr: string) => {
    const balance = await getBalance(addr);
    setBalance(balance.onChainBalance.toFixed(8));
  };

  let urlHistoryMempool;

  if (network === "testnet") {
    urlHistoryMempool = `https://mempool.space/testnet/address/${currentWallet?.address?.[network]}`;
  } else {
    urlHistoryMempool = `https://mempool.space/address/${currentWallet?.address?.[network]}`;
  }
  const getWalletTokens = async (currentRequestId:any) => {

    setIsLoading(true);
    try {
      const tokens = await getTokens(currentWallet?.address?.[network]);
      if (currentRequestId === currentRequest.current) {
        setAppState((prev: any) => ({
          ...prev,
          tokens: tokens.result,
          nfts: tokens.nfts,
        }));
      }
    } catch (e: any) {
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (address) {
      returnAddress(address);
    }

  }, [address]);

  useEffect(() => {
    if (address) {
      setBalance("----------");
      setAppState((prev: any) => ({
        ...prev,
        tokens: [],
        nfts: [],
      }));

      const requestId = ++currentRequest.current;

      getWalletTokens(requestId).then(() => { });

    }
  }, [address]);

  useEffect(() => {
    setAddress(currentWallet?.address?.[network]);
  }, [currentWallet, network]);

  return (
    <div>
      <div className="p-6 bg-dark-gray">
        <div className="mb-6 grid grid-cols-[114px_1fr_114px]">
          <p className="text-white text-base my-auto">
            {currentWallet?.name}
          </p>
          <div className="flex justify-center items-center">
            <img
              src={logo}
              alt="PIPELINE"
              className="w-[21.67px] h-5 min-[1200px]:w-[45px] min-[1200px]:h-auto"
            />
          </div>
          <button
            className="flex p-2.5 rounded-md bg-gray-300 text-white text-sm truncate text-nowrap"
            onClick={() => navigate("/wallets")}
          >
            <User className="mr-2.5" />
            Wallets
          </button>
        </div>
        <div className="flex mt-4 gap-2">
          <div className="relative flex flex-1">
            <button
              onClick={() => {
                setIsOpen(true);
              }}
              className="py-2 px-2.5 bg-black rounded-md flex items-center justify-center w-full"
            >
              <Copy
                onClick={(e: any) => {
                  e.stopPropagation();
                  copy(address);
                  toast("Address Copied", { icon: <CopyIcon /> });
                }}
              />
              <span className="ml-2.5 text-gray">{getAddress(address)}</span>
              <ArrowDropdown className="ml-2" />
            </button>
            {isOpen ? (
              <div
                className="bg-dark-gray overflow-auto border border-gray absolute top-[120%] rounded-md p-3 z-50"
                ref={dropdownRef}
              >
                <div className="max-h-[162px] w-[210px] min-[1200px]:w-full flex flex-col">
                  {currentAccount?.wallets?.map((wallet: any) => (
                    <div
                      className="flex justify-between mr-3 cursor-pointer pb-3"
                      onClick={() => {
                        handleSelectWallet(wallet.id);
                        setIsOpen(false);
                      }}
                    >
                      <p
                        className={`text-sm w-50 text-ellipsis overflow-hidden ${currentWallet?.address?.[network] ===
                          wallet.address?.[network]
                          ? "text-orange"
                          : "text-white"
                          }`}
                      >
                        {wallet.name}
                      </p>
                      <p className="text-gray text-sm w-50">
                        {getAddress(wallet.address?.[network])}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <a
            className="py-2 px-2.5 bg-black rounded-md flex items-center justify-center flex-1"
            href={urlHistoryMempool}
            target="_blank"
          >
            <History />
            <span className="ml-2.5 text-gray">History</span>
          </a>
        </div>
        <p className="text-3xl text-white font-bold text-center py-3">
          {balance}
          <span className="ml-2.5">BTC</span>
        </p>
        <div className="flex gap-2">
          <button
            className="flex flex-col items-center flex-1 text-gray bg-black rounded-md py-3 px-2.5"
            onClick={() => setIsModalOpen(true)}
          >
            <Qr className="mb-2" />
            Receive
          </button>
          <button
            className="flex flex-col items-center flex-1 text-gray bg-black rounded-md py-3 px-2.5"
            onClick={() => navigate("/send")}
          >
            <Send className="mb-2" />
            Send
          </button>
        </div>
      </div>
      <div className="sticky top-0 flex flex-col">
        <div className="sticky top-0 grid grid-cols-2 bg-black">
          <button
            className={`tab-button ${activeTab === "tokens" ? "border-orange" : "border-modal-dark"
              }`}
            onClick={() => setActiveTab("tokens")}
          >
            Tokens
          </button>
          <button
            className={`tab-button ${activeTab === "nfts" ? "border-orange" : "border-modal-dark"
              }`}
            onClick={() => setActiveTab("nfts")}
          >
            NFTs
          </button>
        </div>
        {isLoading ? (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex justify-center items-center z-10">
            <div className="spinner">
            </div>
          </div>
        ) : (
          activeTab === "nfts" ? (
            <Nfts tokens={nfts} />
          ) : (
            <div className="flex flex-col gap-2 pb-16 bg-black">
              <Tokens tokens={tokens} />
            </div>
          )
        )}
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="flex flex-col items-center px-16">
          <QRCode value={address} className="pb-4" />
          <button
            onClick={() => {
              copy(address);
              toast("Address Copied", { icon: <CopyIcon /> });
            }}
            className="py-2 px-12 bg-black rounded-md flex items-center justify-center"
          >
            <Copy />
            <span className="ml-2.5 text-gray">{getAddress(address)}</span>
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Home;

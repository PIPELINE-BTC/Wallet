/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useState } from 'react';
import toast from "react-hot-toast/headless";
import { useLocation, useNavigate } from 'react-router-dom';

import CopyIcon from "../assets/img/copy-icon.svg?react";
import HeaderWithNav from '../common/HeaderWithNav';
import Warn from '../assets/img/warn.svg?react';
import { copy } from '../utils';
import Copy from "assets/img/copy.svg?react";
import { AccountContext } from '../AccountContext';
import SecurityWarns from '../common/SecurityWarns';

const ShowSecret = () => {
  const { network } = useContext(AccountContext);
  const [isSecretShowing, setIsSecretShowing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <HeaderWithNav
        title="Show Secret Phrase"
        goBack={() => navigate(location?.state?.wallet ? '/wallets' : '/accounts')}
      />
      <div className="p-6 overflow-auto h-full pb-[120px]">
        {
          location?.state?.account?.mnemonic ?
          <>
            <SecurityWarns warningText='Do not share this phrase with anyone! This is the only way to recover your wallet' />
            <div className="grid grid-cols-2 gap-1">
              {location.state.account.mnemonic.split(' ').map((item: any, index: number) => (
                <div
                  key={item}
                  className="bg-dark-gray rounded-md flex items-center p-1.5"
                >
                  <span className="rounded-full bg-black text-gray h-6 w-6 flex justify-center items-center mr-3 text-xs">
                    {index + 1}
                  </span>
                  <p className="text-white text-sm">
                    {isSecretShowing ? item : ''}
                  </p>
                </div>
              ))}
            </div>
            <button
              className="bg-dark-gray text-gray rounded-md flex items-center justify-center w-full p-3 mt-1 text-sm"
              onClick={() => {
                copy(location.state.account.mnemonic);
                toast("Seed Phrase Copied", { icon: <CopyIcon /> });
              }}
            >
              <Copy className="mr-2" />
              Copy to clipboard
            </button>
          </>
          :
          <>
            <div className="flex p-3 rounded-md bg-modal-dark mb-6">
              <span>
                <Warn />
              </span>
              <p className="text-white text-sm pl-3">
                The Private key is stored only in your browser, you are
                responsible for the security of the private key!
              </p>
            </div>
            <div className="bg-dark-gray rounded-md px-4 py-3 flex items-center min-h-[48px]">
              <button
                className={isSecretShowing ? 'block' : 'invisible'}
                onClick={(e: any) => {
                  e.stopPropagation();
                  copy(location?.state?.wallet?.wif?.[network] || location?.state?.account?.wif?.[network]);
                  toast("Wif Copied", { icon: <CopyIcon /> });
                }}
              >
                <Copy />
              </button>
              <div
                style={{ overflowWrap: 'anywhere' }}
                className={`m-0 ml-2.5 text-gray text-sm ${isSecretShowing ? 'visible' : 'invisible'}`}
              >
                {location?.state?.wallet?.wif?.[network] || location?.state?.account?.wif?.[network]}
              </div>
            </div>
          </>
        }
        <div className="fixed bottom-0 left-0 w-full">
          <button
            className="btn btn-primary w-full text-black"
            onClick={() => setIsSecretShowing(true)}
          >
            {`Show ${location?.state?.account?.mnemonic ? 'Secret Phrase' : 'WIF'}`}
          </button>
        </div>
      </div>
    </>
  );
};

export default ShowSecret;

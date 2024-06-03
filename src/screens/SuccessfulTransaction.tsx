import { FC, useContext } from 'react';
import { Link } from 'react-router-dom';

import logo from 'assets/img/logo-mini.svg';
import Success from 'assets/img/success.svg?react';
import History from "assets/img/history.svg?react";
import { AccountContext } from '../AccountContext';

const SuccessfulTransaction: FC = () => {
  const { currentWallet, network } = useContext(AccountContext);

  let urlMempool;

  if (network === "testnet") {
    urlMempool = `https://mempool.space/testnet/address/${currentWallet.address[network]}`;
  } else {
    urlMempool = `https://mempool.space/address/${currentWallet.address[network]}`;
  }

  return (
    <>
      <div className="flex justify-center w-full p-5">
        <img
          src={logo}
          alt="PIPELINE"
          className="w-[21.67px] h-5 min-[1200px]:w-[45px] min-[1200px]:h-auto"
        />
      </div>
      <div className="p-6">
        <div className="bg-modal-dark p-6 flex flex-col justify-center items-center rounded-md">
          <Success />
          <p className="text-xl text-white my-3 font-semibold">
            Congratulations!
          </p>
          <p className="text-sm text-white mb-3 text-center">
            Your transaction has been sent<br />
            successfully
          </p>
          <a
            className="py-2 px-2.5 bg-black rounded-md flex items-center justify-center flex-1"
            href={urlMempool}
            target="_blank"
          >
            <History />
            <span className="ml-2.5 text-sm text-gray">View History</span>
          </a>
        </div>
        <div className="flex flex-col absolute bottom-0 left-0 w-full">
          <Link
            className="btn btn-secondary w-full"
            to="/home"
          >
            Back to Wallet
          </Link>
        </div>
      </div>
    </>
  );
};

export default SuccessfulTransaction;

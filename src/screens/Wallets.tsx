/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import HeaderWithNav from '../common/HeaderWithNav';
import { AccountContext } from '../AccountContext';
import { getAddress } from '../utils';
import Arrow from 'assets/img/arrow.svg?react';
import { Link } from 'react-router-dom';
import Wallet from '../common/Wallet';

const Wallets: FC = () => {
  const { currentAccount, currentWallet, network } = useContext(AccountContext);
  const navigate = useNavigate();

  return (
    <>
      <HeaderWithNav
        title="Wallets"
        goBack={() => navigate('/home')}
      />
      <div className="p-6 bg-black">
        <div className="flex flex-col gap-2 mb-6">
          <div
            className="bg-dark-gray py-3 px-5 flex justify-between items-center rounded-md cursor-pointer"
            onClick={() => navigate('/accounts')}
          >
            <div className="flex flex-col">
              <p className="text-base text-white">
                {currentAccount.name}
              </p>
              <p className="text-gray text-sm">
                {getAddress(currentWallet?.address?.[network])}
              </p>
            </div>
            <Arrow className="rotate-180" />
          </div>
        </div>
        <p className="text-base text-white font-semibold mb-3">
          Accounts
        </p>
        <div className="flex flex-col gap-2 mb-6 bg-black">
          {
            currentAccount?.wallets.map((wallet: any) =>
              <Wallet
                key={wallet.id}
                wallet={wallet}
              />
            )
          }
          {
            currentAccount.mnemonic ?
            <Link
              to="/accounts/create"
              className="bg-dark-gray p-2 text-center text-sm rounded-md text-gray mb-6"
            >
              <span className="font-semibold text-base mr-2">
                +
              </span>
              Add new Account
            </Link> : null
          }
        </div>
      </div>
    </>
  );
};

export default Wallets;

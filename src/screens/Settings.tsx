/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useContext } from 'react';
import { Link } from 'react-router-dom';

import useAccount from '../hooks/useAccount';
import Arrow from 'assets/img/arrow.svg?react';
import logo from 'assets/img/logo-mini.svg';
import X from '../assets/img/x.svg?react';
import Discord from '../assets/img/discord.svg?react';
import { AccountContext } from '../AccountContext';
// import { getAddress } from '../utils';

const Settings: FC = () => {
  const { handleLock } = useAccount();
  // const { currentWallet, network } = useContext(AccountContext);
  const {network } = useContext(AccountContext);


  const handleExpandView = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html?expanded=true') });
  };

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
        <Link
          className="bg-dark-gray p-4 flex justify-between items-center w-full text-white text-base mb-px rounded-t-md"
          to="/connected-sites"
        >
          <div className="flex flex-col">
            <p className="text-base text-white font-medium">
              Connected Sites
            </p>
            <p className="text-gray text-sm">
              {/* {getAddress(currentWallet.address?.[network])} */}
              No connected site
            </p>
          </div>
          <Arrow className="rotate-180" />
        </Link>
        <Link
          className="bg-dark-gray p-4 flex justify-between items-center w-full text-white text-base my-px"
          to="/networks"
        >
          <div className="flex flex-col">
            <p className="text-base text-white font-medium">
              Network
            </p>
            <p className="text-gray text-sm" style={{ textTransform: 'capitalize' }}>
              {network}
            </p>
          </div>
          <Arrow className="rotate-180" />
        </Link>
        <Link
          className="bg-dark-gray p-4 flex justify-between items-center w-full text-white text-base rounded-b-md mb-6"
          to="/change-password"
        >
          <div className="flex flex-col">
            <p className="text-base text-white font-medium">
              Password
            </p>
            <p className="text-gray text-sm">
              Change your lockscreen password
            </p>
          </div>
          <Arrow className="rotate-180" />
        </Link>
        <div className="rounded-md bg-dark-gray p-3">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              className="bg-black p-2 w-full text-white text-sm rounded-md font-medium"
              onClick={handleExpandView}
            >
              Expand
            </button>
            <button
              className="bg-black p-2 w-full text-white text-sm rounded-md font-medium"
              onClick={handleLock}
            >
              Lock
            </button>
          </div>
          <div className="grid grid-cols-[2fr_1fr]">
            <p className="text-gray font-sm my-auto">
              Version: 0.61.7
            </p>
            <div className="flex gap-2">
              <a
                className="py-2 px-2.5 bg-black rounded-md flex items-center justify-center flex-1"
                href="https://discord.gg/Gxfzfnakdc"
                target="_blank"
              >
                <Discord />
              </a>
              <a
                className="py-2 px-2.5 bg-black rounded-md flex items-center justify-center flex-1"
                href="https://twitter.com/Pipeline_btc"
                target="_blank"
              >
                <X />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;

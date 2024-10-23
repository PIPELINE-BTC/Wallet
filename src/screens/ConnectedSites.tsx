import { useContext } from "react";

import HeaderWithNav from "../common/HeaderWithNav";
import { AccountContext } from "../AccountContext";
// import logoBg from '../assets/img/logo-link.svg';
import emptyImg from '../assets/img/no-data.svg';
import Close from 'assets/img/close.svg?react';

const ConnectedSites = () => {
  const { accessService } = useContext(AccountContext);

  if (!accessService.store.websites.length) return(
    <>
      <div className="absolute top-0">
        <HeaderWithNav title="Connected Sites" />
      </div>
      <div className="h-full flex flex-col justify-center items-center">
        <img
          src={emptyImg}
          alt="no data"
        />
        <p className="text-gray text-sm mt-6">
          No Data
        </p>
      </div>
    </>
  );

  return (
    <>
      <HeaderWithNav title="Connected Sites" />
      <div className="pt-10 px-6">
        {
          accessService.store.websites.map((url: string) =>
            <div
              className='bg-dark-gray rounded-md p-2.5 mb-1.5 flex items-center justify-between'
              key={url}
            >
              <div className="flex items-center">
                <p className="text-white text-base font-medium ml-3">
                  {url}
                </p>
              </div>
              <button
                className="bg-black rounded-full flex justify-center items-center w-[34px] h-[34px]"
                onClick={() => accessService.store.removeWebsite(url)}
              >
                <Close
                  width={13}
                  height={13}
                />
              </button>
            </div>
          )
        }
      </div>
    </>
  );
};

export default ConnectedSites;

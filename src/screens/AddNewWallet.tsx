import { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import HeaderWithNav from '../common/HeaderWithNav';
import Arrow from 'assets/img/arrow.svg?react';

const AddNewWallet: FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <HeaderWithNav title="Create new Wallet" />
      <div className="px-6 pt-6 bg-black">

        <p className="text-base text-white font-semibold mb-3">
          New Wallet
        </p>
        <div
          className="bg-dark-gray py-3 px-5 flex justify-between items-center rounded-md mb-6 cursor-pointer"
          onClick={() => navigate('/wallet/create')}
        >
          <div className="flex flex-col">
            <p className="text-base text-white">
              Create using secret phrases
            </p>
            <p className="text-gray text-sm">
              12 words
            </p>
          </div>
          <Arrow className="rotate-180" />
        </div>
        <p className="text-base text-white font-semibold mb-3">
          Restore Wallet
        </p>
        <div
          className="bg-dark-gray py-3 px-5 flex justify-between items-center rounded-md mb-6 cursor-pointer"
          onClick={() => navigate('/wallet/import')}
        >
          <div className="flex flex-col">
            <p className="text-base text-white">
              Restore with secret phrases
            </p>
            <p className="text-gray text-sm">
              12/24 words WIF private Key
            </p>
          </div>
          <Arrow className="rotate-180" />
        </div>
      </div>
    </>
  );
};

export default AddNewWallet;

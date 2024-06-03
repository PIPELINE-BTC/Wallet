import { useContext } from "react";

import HeaderWithNav from "../common/HeaderWithNav";
import RadioButton from "../common/RadioButton";
import { AccountContext } from "../AccountContext";

const Networks = () => {
  const { accessService } = useContext(AccountContext);

  return (
    <>
      <HeaderWithNav title="Network" />
      <div className="p-6">
        <div
          className="py-3 px-5 rounded-md bg-dark-gray mb-1 flex items-center cursor-pointer"
          onClick={() => accessService.store.setNetwork('livenet')}
        >
          <RadioButton
            id="livenet"
            checked={accessService.store.network === 'livenet'}
          />
          <p className="text-white font-medium ml-3">
            LIVENET
          </p>
        </div>
        <div
          className="py-3 px-5 rounded-md bg-dark-gray mb-1 flex items-center cursor-pointer"
          onClick={() => accessService.store.setNetwork('testnet')}
        >
          <RadioButton
            id="testnet"
            checked={accessService.store.network === 'testnet'}
          />
          <p className="text-white font-medium ml-3">
            TESTNET
          </p>
        </div>
      </div>
    </>
  );
};

export default Networks;

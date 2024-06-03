/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useContext, useEffect, useState } from 'react';

import HeaderWithNav from '../common/HeaderWithNav';
import { AccountContext } from '../AccountContext';
import useWallet from '../hooks/useWallet';
import { importWallet } from '../bitcoin/wallet';
import useMnemonicValidate from '../hooks/useMnemonicValidate';

const CreateNewAccount: FC = () => {
  const [name, setName] = useState('');
  const { currentAccount, currentWallet } = useContext(AccountContext);
  const { handleImportWallet } = useWallet();
  const { isValid, setMnemonic } = useMnemonicValidate();

  useEffect(() => {
    if (currentAccount.mnemonic) setMnemonic(currentAccount.mnemonic);
  }, [currentAccount.mnemonic, setMnemonic]);

  const onSubmit = () => {
    if (currentAccount.mnemonic && isValid) {
      const wallet = importWallet(currentAccount.mnemonic, currentAccount.wallets.length);
      handleImportWallet({ ...wallet, name, index: currentWallet.index + 1 });
    }
  };

  return (
    <>
      <HeaderWithNav title="Accounts" />
      <form
        autoComplete="off"
        onSubmit={onSubmit}
        className="p-6"
      >
        <label htmlFor="name">
          Account Name
        </label>
        <input
          id="name"
          value={name}
          placeholder={`Account ${currentAccount.wallets?.[currentAccount.wallets?.length - 1]?.index + 1}`}
          onChange={(e: any) => setName(e.target.value)}
        />
        <div className="absolute bottom-0 left-0 w-full">
          <button
            className="btn btn-primary w-full text-black"
            type="submit"
          >
            Create an Account
          </button>
        </div>
      </form>
    </>
  );
};

export default CreateNewAccount;

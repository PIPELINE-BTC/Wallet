/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { AccountContext } from '../AccountContext';

const useWallet = () => {
  const { accessService, currentAccount } = useContext(AccountContext);
  const navigate = useNavigate();

  const handleImportWallet = async(wallet: any) => {
    await accessService.importWallet(wallet);
    navigate('/home');
  };

  const handleSelectedAccount = (id: string) => {
    const selectedAccount = currentAccount.wallets.filter((acc: any) => acc.id === id)[0].address[accessService.store.network];

    chrome.runtime.sendMessage({
      action: "accountChanged",
      account: selectedAccount
    });
    return accessService.selectWallet(id);
  };

  return {
    handleImportWallet,
    handleSelectedAccount,
  }
};

export default useWallet;

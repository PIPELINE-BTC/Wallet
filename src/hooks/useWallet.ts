/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { AccountContext } from '../AccountContext';

const useWallet = () => {
  const { accessService } = useContext(AccountContext);
  const navigate = useNavigate();

  const handleImportWallet = async(wallet: any) => {
    await accessService.importWallet(wallet);
    navigate('/home');
  };

  const handleSelectedAccount = (id: string) => {
    return accessService.selectWallet(id);
  };

  return {
    handleImportWallet,
    handleSelectedAccount,
  }
};

export default useWallet;

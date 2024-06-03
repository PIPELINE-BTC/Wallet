/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { AccountContext } from '../AccountContext';

const useAccount = (): {
  handleCreateUser: (account: any, isImport?: boolean) => Promise<void>;
  handleUnlock: (password: string) => Promise<any>;
  handleLock: () => void;
  handleChangePassword: (data: any) => Promise<any>;
  handleSetAccout: (id: string) => void;
} => {
  const { accessService, setAppState } = useContext(AccountContext);
  const navigate = useNavigate();

  const handleCreateUser = (user: any, isImport?: boolean) => {
    return accessService.createUser(user, isImport)
      .then((data: any) => {
        if (data) throw new Error(data);
        navigate("/home");
      });
  };

  const handleUnlock = async(password: string) => {
    await accessService.unlock(password);
  };

  const handleLock = () => {
    return accessService.lock()
      .then(() => {
        setAppState((prev: any) => ({ ...prev, isUnlocked: false }));
        navigate('/login');
      });
  };

  const handleChangePassword = (data: any) => {
    return accessService.changePassword(data)
      .then(() => handleLock());
  };

  const handleSetAccout = (id: string) => {
    return accessService.selectAccount(id);
  };

  return {
    handleCreateUser,
    handleUnlock,
    handleLock,
    handleChangePassword,
    handleSetAccout
  };
};

export default useAccount;

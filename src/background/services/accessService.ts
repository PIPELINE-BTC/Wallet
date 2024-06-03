/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuid } from 'uuid';
import AppStore from './AppStore';
import { assert } from '../../utils';


class AccessService {
  store: AppStore;
  isReady: boolean;

  constructor() {
    this.store = new AppStore();
    this.isReady = false;
  }

  setIsReady = () => {
    this.isReady = true;
  };

  createAccount = async(mnemonic: string, wif: any) => {
    const lastAcc = this.store.accounts?.[this.store.accounts.length - 1]?.index;
    const currentIndex = lastAcc ? lastAcc + 1 : 1;
    return {
      id: uuid(),
      name: `Wallet #${currentIndex}`,
      wallets: [],
      index: currentIndex,
      ...(mnemonic ? { mnemonic } : { wif })
    };
  };

  createWallet = (address: string, wif: any, name?: string) => {
    const currentAcc = this.store.currentAccount;
    const lastWallet = currentAcc?.wallets?.[currentAcc?.wallets?.length - 1]?.index;
    const currentIndex = lastWallet ? lastWallet + 1 : 1;
    return {
      id: uuid(),
      name: name || `Account ${currentIndex}`,
      address,
      wif,
      index: currentIndex
    };
  };

  editWallet = (walletId: string, accId: string, data: any) => {
    const currentWallet = this.store.cache.getState().currentWallet;
    const currentAccount = this.store.cache.getState().currentAccount;
    const updateWallet = (w: any) => {
      if (w.id === walletId) return { ...w, ...data };
      return w;
    };
    const accounts = this.store.cache.getState().accounts.map((acc: any) => {
      if (acc.id === accId) return {
        ...acc,
        wallets: acc.wallets.map(updateWallet)
      }
      return acc;
    });

    if (walletId === currentWallet.id) this.store.cache.updateState({
      currentWallet: { ...currentWallet, ...data }
    });
    this.store.cache.updateState({
      currentAccount: {
        ...currentAccount,
        wallets: currentAccount.wallets.map(updateWallet)
      }
    });
    this.store.cache.updateState({ accounts });
    this.store.persistStore();
  };

  editAccount = (id: string, data: any) => {
    const currentAccount = this.store.cache.getState().currentAccount;
    const accounts = this.store.cache.getState().accounts.map((acc: any) => {
      if (acc.id === id) return { ...acc, ...data };
      return acc;
    });
    if (id === currentAccount.id) this.store.cache.updateState({
      currentAccount: { ...currentAccount, ...data }
    });
    this.store.cache.updateState({ accounts });
    this.store.persistStore();
  };

  importWallet = async(wallet: any) => {
    const account = this.store.currentAccount;
    const newWallet = this.createWallet(wallet.p2tr, wallet.wif, wallet.name);
    this.store.addWallet(account.id, newWallet);
  };

  selectWallet = async(walletId: string) => {
    const accId = this.store.cache.getState().currentAccount.id;
    this.store.setCurrentWallet(accId, walletId);
  };

  selectAccount = async(accountId: string) => {
    this.store.setCurrentAccount(accountId);
  };

  createUser = async(data: any, isImport = false) => {
    let password: string;
    if (isImport) {
      assert(!data.password, 'import wallet data invariant');
      password = await this.store.password()
      assert(password, 'import wallet password invariant')
    } else {
      assert(data.password, 'create user invariant');
      password = data.password;
    }
    try {
      await this.store.setPassword(password);
      if (!isImport) await this.store.boot(password);
      await this.store.validateAccount(data.mnemonic || data.wif);
      const account = await this.createAccount(data.mnemonic, data.wif);
      this.store.addAccount(account);
      const newWallet = this.createWallet(data.address || data.p2tr, data.wif);
      this.store.addWallet(account.id, newWallet);
      localStorage.setItem("isUserExist", "true");
      if (!isImport) this.store.session.updateState({ isUnlocked: true });
    } catch(error: any) {
      return error;
    }
  };

  unlock = async (password: string): Promise<any> => {
    await this.store.verifyPassword(password);
    await this.store.setPassword(password)
    await this.store.restoreCache()
    this.store.session.updateState({ isUnlocked: true });
  };

  lock = async() => {
    await this.store.setPassword('')
    this.store.session.updateState({ isUnlocked: false });
  };

  changePassword = async (data: { currentPassword: string; newPassword: string; }) => {
    await this.store.verifyPassword(data.currentPassword);
    await this.store.setPassword(data.newPassword);
    await this.store.boot(data.newPassword);
  };

  createPsbt = async () => {
    throw new Error('Not implemented: createPsbt');
    // return this.store.createPsbt();
  }
}

export default new AccessService();

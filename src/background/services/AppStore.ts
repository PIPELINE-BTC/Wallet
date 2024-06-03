/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObservableStore } from '@metamask/obs-store';
import encryptor from 'browser-passworder';
import { v4 as uuid } from 'uuid';

class AppStore {
  store!: ObservableStore<any>;
  session: ObservableStore<any>;
  cache: ObservableStore<any>;
  encryptor: typeof encryptor = encryptor;

  constructor() {
    this.session = new ObservableStore({
      isUnlocked: false,
    });
    this.cache = new ObservableStore({
      accounts: [],
      currentAccount: null,
      currentWallet: null,
      websites: [],
      addressBook: [],
      network: 'livenet',
    });
  }

  loadStore = (data: any) => {
    this.store = new ObservableStore(data);
  };

  restoreCache = async() => {
    const vault = this.store.getState().vault;
    const password = await this.password();
    if (!vault || !password) return {};
    const cache = await this.encryptor.decrypt(password, vault);
    this.cache.updateState(cache);
    return cache;
  };

  async password(): Promise<string> {
    const data = await chrome.runtime.sendMessage({ action: 'getPassword' });
    return data.password;
  }
  async setPassword(pass: string) {
    await chrome.runtime.sendMessage({ action: 'setPassword', data: pass });
  }

  verifyPassword = async (passwordToVerify: string) => {
    const pass = (
      await this.encryptor.decrypt(
        passwordToVerify,
        this.store.getState().booted
      )
    ).toString();
    if (passwordToVerify !== pass) {
      throw new Error('Invalid password');
    }
  };

  boot = async (password: string) => {
    const booted = await this.encryptor.encrypt(
      password,
      password
    );
    this.store.updateState({ booted });
    this.persistStore();
  };

  persistStore = async () => {
    const cache = this.cache.getState();
    if (!this.password()) return;
    const vault = await this.encryptor.encrypt(
      await this.password() as string,
      cache
    );
    this.store.updateState({ vault });
  };

  addAccount = async(account: any) => {
    const cache = this.cache.getState();
    const accounts = [...cache.accounts, account];
    this.cache.updateState({ accounts });
    this.setCurrentAccount(account.id);
    this.persistStore();
  };

  setCurrentAccount = (accId: string) => {
    const currentAccount = this.cache.getState().accounts.find((acc: any) => acc.id === accId);
    if (!currentAccount) return;
    this.cache.updateState({ currentAccount });
    this.cache.updateState({ currentWallet: currentAccount.wallets?.[0] });
    this.persistStore();
  };

  addWallet = (accId: string, wallet: any) => {
    const cache = this.cache.getState();
    const account = cache.accounts.find((acc: any) => acc.id === accId);
    if (!account) return;
    const updatedAccounts = cache.accounts.map((acc: any) => {
      if (acc.id === accId) return { ...acc, wallets: [...acc.wallets, wallet] };
      return acc;
    });
    this.cache.updateState({
      accounts: updatedAccounts,
    });

    if (cache.currentAccount) this.cache.updateState({
      currentAccount: {
        ...cache.currentAccount,
        wallets: [...cache.currentAccount.wallets, wallet]
      }
    });
    this.setCurrentWallet(accId, wallet.id);
    this.persistStore();
  };

  setCurrentWallet = (accId: string, walletId: string) => {
    const currentWallet = this.cache.getState()
      .accounts.find((acc: any) => acc.id === accId).wallets
      .find((w: any) => w.id === walletId);
    this.cache.updateState({ currentWallet });
    this.persistStore();
  };

  deleteWallet = (accId: string, walletId: any)  => {
    return new Promise((resolve, reject) => {
      const cache = this.cache.getState();
      if (cache.currentAccount.wallets.length === 1) return reject(new Error("Can't delete the last wallet"));
      const filteredWallets = cache.currentAccount.wallets.filter((w: any) => w.id !== walletId);
      const updatedAccounts = cache.accounts.map((acc: any) => {
        if (acc.id === accId) return { ...acc, wallets: [...filteredWallets] };
        return acc;
      });
      this.cache.updateState({
        accounts: updatedAccounts,
        currentAccount: {
          ...cache.currentAccount,
          wallets: filteredWallets
        }
      });
      this.persistStore();
      this.setCurrentWallet(cache.currentAccount.id, filteredWallets[filteredWallets.length - 1].id);
      resolve('Wallet deleted');
    });
  };

  deleteAccount = (id: string) => {
    return new Promise((resolve, reject) => {
      const cache = this.cache.getState();
      if (cache.accounts.length === 1) return reject(new Error("Can't delete the last account"));
      const updatedAccounts = cache.accounts.filter((acc: any) => acc.id !== id);
      const currentAccount = updatedAccounts[updatedAccounts.length - 1];
      const currentWallet = currentAccount.wallets[0];
      this.cache.updateState({
        accounts: updatedAccounts,
        currentAccount,
        currentWallet
      });
      this.persistStore();
      resolve('Wallet deleted');
    });
  };

  addWebsite = (url: string) => {
    const websites = this.cache.getState().websites;
    this.cache.updateState({ websites: [ ...websites, url ] });
    this.persistStore();
  };

  removeWebsite = (url: string) => {
    const websites = this.cache.getState().websites;
    this.cache.updateState({ websites: websites.filter((w: any) => w !== url) });
    this.persistStore();
  };

  addContact = (data: any) => {
    const addressBook = this.cache.getState().addressBook;
    this.cache.updateState({ addressBook: [ ...addressBook, { ...data, id: uuid() } ] });
    this.persistStore();
  };

  editContact = (id: string, data: any) => {
    const addressBook = this.cache.getState().addressBook;
    this.cache.updateState({ addressBook: addressBook.map((contact: any) => {
      if (id === contact.id) return { ...contact, ...data };
      return contact;
    })});
    this.persistStore();
  };

  deleteContact = (id: string) => {
    const addressBook = this.cache.getState().addressBook;
    this.cache.updateState({ addressBook: addressBook.filter((c: any) => c.id !== id) });
    this.persistStore();
  };

  setNetwork = (network: string) => {
    this.cache.updateState({ network });
    this.persistStore();
  };

  validateAccount = (secret: any) => {
    return new Promise<void>((resolve) => {
      const cache = this.cache.getState();
      const existing = cache.accounts.find((a: any) =>
        typeof secret === 'string'
          ? a.mnemonic === secret
          : a.wif?.livenet === secret.livenet || a.wif?.testnet === secret.testnet
      );

      if (existing) throw new Error('Wallet exists');
      resolve();
    });
  };

  get network() {
    return this.cache.getState().network;
  }

  get addressBook() {
    return this.cache.getState().addressBook;
  }

  get websites() {
    return this.cache.getState().websites;
  }

  get accounts() {
    return this.cache.getState()?.accounts || [];
  }

  get currentWallets() {
    return this.cache.getState()?.currentAccount?.wallets || [];
  }

  get currentAccount() {
    return this.cache.getState().currentAccount;
  }

  get currentWallet() {
    return this.cache.getState().currentWallet;
  }
}

export default AppStore;


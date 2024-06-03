/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useState } from 'react';

import HeaderWithNav from '../common/HeaderWithNav';
import CheckingSeedPhrase from './CheckingSeedPhrase';
import ImportType from './ImportType';
import { importWallet } from '../bitcoin/wallet';
import ImportFromWif from './ImportFromWif';
import useAccount from '../hooks/useAccount';
import useMnemonicValidate from '../hooks/useMnemonicValidate';

const ImportWallet: FC = () => {
  const [currentStep, setCurrentStep] = useState<string | number>(0);
  const [seedLength, setSeedLength] = useState(12);
  const { handleCreateUser } = useAccount();
  const [error, setError] = useState('');
  const { isValid, setMnemonic } = useMnemonicValidate();

  const onSubmit = (seed: string) => {
    if (!isValid) return;
    const wallet = importWallet(seed);
    const user = {
      mnemonic: wallet.mnemonic,
      address: wallet.p2tr,
      wif: wallet.wif,
      rootkey: wallet.rootKey
    };
    handleCreateUser(user as any, true).catch((err: any) => setError(err.message));
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ImportType
            setSeedLength={setSeedLength}
            setCurrentStep={setCurrentStep}
          />
        );

      case 1:
        return (
          <CheckingSeedPhrase
            isImport
            words={seedLength}
            onHandleSubmit={onSubmit}
            isValid={isValid}
            setMnemonic={setMnemonic}
            error={error}
            setError={setError}
          />
        );

      case 'wif':
        return (
          <ImportFromWif isImport />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <HeaderWithNav title="Create a new Wallet" />
      <div className="px-6 overflow-auto pb-[124px]">
        {renderCurrentStep()}
      </div>
    </>
  );
};

export default ImportWallet;

/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';

import CreatePassword from './CreatePassword';
import SeedPhrase from './SeedPhrase';
import HeaderWithNav from '../common/HeaderWithNav';
import useAccount from '../hooks/useAccount';

import CheckingSeedPhrase from './CheckingSeedPhrase';
import useMnemonicValidate from '../hooks/useMnemonicValidate';

const CreateUser: FC = () => {
  const [seed, setSeed] = useState([]);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState({});
  const { handleCreateUser } = useAccount();
  const { isValid, setMnemonic } = useMnemonicValidate();

  useEffect(() => {
    if (seed) setMnemonic(seed.join(' '));
  }, [seed, setMnemonic]);

  const onSubmit = () => {
    handleCreateUser(data as any)
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <CreatePassword
            setData={setData}
            setCurrentStep={setCurrentStep}
          />
        );

      case 1:
        return (
          <SeedPhrase
            setValue={setData}
            setSeed={setSeed}
            seed={seed}
            setCurrentStep={setCurrentStep}
          />
        );

      case 2:
        return (
          <CheckingSeedPhrase
            words={12}
            seed={seed}
            onHandleSubmit={onSubmit}
            isValid={isValid}
            error={error}
            setError={setError}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <HeaderWithNav title={currentStep ? 'Create a new Wallet': ''} isAbsolute={true}/>
      <div className="px-6 h-full overflow-auto">
        {renderCurrentStep()}
      </div>
    </>
  );
};

export default CreateUser;

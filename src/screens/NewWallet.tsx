import { FC, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SeedPhrase from './SeedPhrase';
import HeaderWithNav from '../common/HeaderWithNav';
import CheckingSeedPhrase from './CheckingSeedPhrase';
import { AccountContext } from '../AccountContext';
import useMnemonicValidate from '../hooks/useMnemonicValidate';

const NewWallet: FC = () => {
  const [seed, setSeed] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [wallet, setWallet] = useState({});
  const { accessService } = useContext(AccountContext);
  const [error, setError] = useState('');
  const { isValid, setMnemonic } = useMnemonicValidate();
  const navigate = useNavigate();

  useEffect(() => {
    if (seed) setMnemonic(seed.join(' '));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed])

  const onSubmit = () => {
    accessService.createUser(wallet, true)
      .then(() => navigate('/home'));
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <SeedPhrase
            setValue={setWallet}
            setSeed={setSeed}
            seed={seed}
            setCurrentStep={setCurrentStep}
          />
        );

      case 1:
        return (
          <CheckingSeedPhrase
            words={12}
            seed={seed}
            onHandleSubmit={onSubmit}
            isValid={isValid}
            setError={setError}
            error={error}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <HeaderWithNav title="Create a new Wallet" />
      <div className="px-6">
        {renderCurrentStep()}
      </div>
    </>
  );
};

export default NewWallet;

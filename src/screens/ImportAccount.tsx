// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { FC, useState } from 'react';

// import CreatePassword from './CreatePassword';
// import HeaderWithNav from '../common/HeaderWithNav';
// import useAccount from '../hooks/useAccount';

// import CheckingSeedPhrase from './CheckingSeedPhrase';
// import ImportType from './ImportType';
// import { importWallet } from '../bitcoin/wallet';
// import ImportFromWif from './ImportFromWif';
// import useMnemonicValidate from '../hooks/useMnemonicValidate';

// const ImportAccount: FC = () => {
//   const [currentStep, setCurrentStep] = useState<string | number>(0);
//   const [data, setData] = useState({});
//   const [error, setError] = useState('');
//   const { handleCreateUser } = useAccount();
//   const [seedLength, setSeedLength] = useState(12);
//   const { isValid, setMnemonic } = useMnemonicValidate();

//   const onSubmit = (seed: any) => {
//     if (!isValid) return;
//     const wallet = importWallet(seed);
//     const user = {
//       ...data,
//       mnemonic: wallet.mnemonic,
//       address: wallet.p2tr,
//       wif: wallet.wif
//     };
//     handleCreateUser(user as any);
//   };

//   const renderCurrentStep = () => {
//     switch (currentStep) {
//       case 0:
//         return (
//           <CreatePassword
//             setData={setData}
//             setCurrentStep={setCurrentStep}
//           />
//         );

//       case 1:
//         return (
//           <ImportType
//             setSeedLength={setSeedLength}
//             setCurrentStep={setCurrentStep}
//           />
//         );

//       case 2:
//         return (
//           <CheckingSeedPhrase
//             isImport
//             words={seedLength}
//             onHandleSubmit={onSubmit}
//             isValid={isValid}
//             setMnemonic={setMnemonic}
//             error={error}
//             setError={setError}
//           />
//         );

//       case 'wif':
//         return <ImportFromWif />;

//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       <HeaderWithNav title={currentStep ? 'Create a new Wallet': ''} isAbsolute={true} />
//       <div className="px-6 h-full overflow-auto">
//         {renderCurrentStep()}
//       </div>
//     </>
//   );
// };

// export default ImportAccount;
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useState } from 'react';

import CreatePassword from './CreatePassword';
import HeaderWithNav from '../common/HeaderWithNav';
import useAccount from '../hooks/useAccount';
// import { IAccount } from '../background/services/access';
import CheckingSeedPhrase from './CheckingSeedPhrase';
import ImportType from './ImportType';
import { importWallet } from '../bitcoin/wallet';
import ImportFromWif from './ImportFromWif';
import useMnemonicValidate from '../hooks/useMnemonicValidate';

const ImportAccount: FC = () => {
  const [currentStep, setCurrentStep] = useState<string | number>(0);
  const [data, setData] = useState<{password?: string}>({});
  const [error, setError] = useState('');
  const { handleCreateUser } = useAccount();
  const [seedLength, setSeedLength] = useState(12);
  const { isValid, setMnemonic } = useMnemonicValidate();

  const onSubmit = (seed: any) => {
    if (!isValid) return;
    const wallet = importWallet(seed);
    const user = {
      ...data,
      mnemonic: wallet.mnemonic,
      address: wallet.p2tr,
      wif: wallet.wif
    };
    handleCreateUser(user as any);
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
          <ImportType
            setSeedLength={setSeedLength}
            setCurrentStep={setCurrentStep}
          />
        );

      case 2:
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
        return <ImportFromWif password={data.password}/>;

      default:
        return null;
    }
  };

  return (
    <>
      <HeaderWithNav title={currentStep ? 'Create a new Wallet': ''} isAbsolute={true} />
      <div className="px-6 h-full overflow-auto">
        {renderCurrentStep()}
      </div>
    </>
  );
};

export default ImportAccount;

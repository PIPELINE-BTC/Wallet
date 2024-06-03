import { useEffect, useState } from "react";
import * as bip39 from "bip39";

const useMnemonicValidate = () => {
  const [isValid, setIsValid] = useState(false);
  const [mnemonic, setMnemonic] = useState('');

  const handleSeedValidate = (mnemonic: string) => {
    const isValid = bip39.validateMnemonic(mnemonic, bip39.wordlists.EN);
    setIsValid(isValid);
  };

  useEffect(() => {
    if (mnemonic) handleSeedValidate(mnemonic);
  }, [mnemonic]);

  return {
    isValid,
    setMnemonic
  };
};

export default useMnemonicValidate;

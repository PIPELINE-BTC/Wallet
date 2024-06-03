/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, FC } from "react";

import { copy } from "../utils";
import Copy from "assets/img/copy.svg?react";
import { generateWallet } from "../bitcoin/wallet";
import Warning from "../common/Warning";
import toast from "react-hot-toast/headless";
import CopyIcon from "../assets/img/copy-icon.svg?react";

interface ISeedPhrase {
  setValue: (...params: any) => void;
  setCurrentStep: (...params: any) => void;
  setSeed: (...params: any) => void;
  seed: string[];
}

const SeedPhrase: FC<ISeedPhrase> = ({ setCurrentStep, setValue, setSeed, seed }) => {
  const [isSavedSeed, setIsSavedSeed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!isSavedSeed) return setIsSubmitted(true);
    setCurrentStep((prev: number) => prev + 1);
  };

  useEffect(() => {
    const { mnemonic, p2tr, wif } = generateWallet();
    setSeed(mnemonic.split(' '));
    setValue((prev: any) => ({ ...prev, mnemonic, address: p2tr, wif }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="flex my-6">
        <span className="rounded-full w-6 h-6 flex justify-center items-center bg-orange text-black text-lg">
          1
        </span>
        <p className="text-lg text-white ml-3">
          Secret Recovery Phrase
        </p>
      </div>
      <Warning text="Do not share this phrase with anyone! This is the only way to recover your wallet" />
      <div className="grid grid-cols-2 gap-1">
        {seed.map((item: any, index: number) => (
          <div
            key={item}
            className="bg-dark-gray rounded-md flex items-center p-1.5"
          >
            <span className="rounded-full bg-black text-gray h-6 w-6 flex justify-center items-center mr-3 text-xs">
              {index + 1}
            </span>
            <p className="text-white text-sm">{item}</p>
          </div>
        ))}
      </div>
      <button
        className="bg-dark-gray text-gray rounded-md flex items-center justify-center w-full p-3 mt-1 text-sm"
        onClick={() => {
          copy(seed.join(' '));
          toast("Seed Phrase Copied", { icon: <CopyIcon />});
        }}
      >
        <Copy className="mr-2" />
        Copy to clipboard
      </button>
      <div className="flex mt-5">
        <input
          type="checkbox"
          id="saved"
          checked={isSavedSeed}
          onChange={(e) => setIsSavedSeed(e.target.checked)}
        />
        <label
          htmlFor="saved"
          className={`ml-3 mb-0 text-sm ${isSubmitted && !isSavedSeed ? 'text-red-500' : 'text-white'}`}
        >
          I saved My Secret Recovery Phrase
        </label>
      </div>
      <div className="absolute bottom-0 left-0 w-full">
        <button
          className="btn btn-primary w-full text-black"
          onClick={handleSubmit}
        >
          Continue
        </button>
      </div>
    </>
  );
};

export default SeedPhrase;

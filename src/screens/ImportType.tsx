/* eslint-disable @typescript-eslint/no-explicit-any */
import Arrow from 'assets/img/arrow.svg?react';

const ImportType = ({ setSeedLength, setCurrentStep }: any) => {
  const handleMoveSeedStep = (words: number) => {
    setSeedLength(words);
    setCurrentStep((prev: number) => prev + 1);
  };

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
      <div
        className="bg-dark-gray py-3.5 px-5 flex justify-between items-center rounded-md mb-1.5 cursor-pointer"
        onClick={() => handleMoveSeedStep(12)}
      >
        <p className="text-base text-white">
          12 words
        </p>
        <Arrow className="rotate-180" />
      </div>
      <div
        className="bg-dark-gray py-3.5 px-5 flex justify-between items-center rounded-md mb-1.5 cursor-pointer"
        onClick={() => handleMoveSeedStep(24)}
      >
        <p className="text-base text-white">
          24 words
        </p>
        <Arrow className="rotate-180" />
      </div>
      <div
        className="bg-dark-gray py-3.5 px-5 flex justify-between items-center rounded-md mb-1.5 cursor-pointer"
        onClick={() => setCurrentStep('wif')}
      >
        <p className="text-base text-white">
          WIF private Key
        </p>
        <Arrow className="rotate-180" />
      </div>
    </>
  );
};

export default ImportType;

/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import Warning from '../common/Warning';
import PasswordInput from '../common/PasswordInput';

interface ICheckingSeedPhrase {
  words?: number;
  onHandleSubmit: (params?: any) => any;
  seed?: string[];
  isImport?: boolean;
  isValid: boolean;
  setMnemonic?: (params: any) => void;
  error: string;
  setError: (params?: any) => any;
}

const CheckingSeedPhrase: FC<ICheckingSeedPhrase> = ({
  words=12,
  onHandleSubmit,
  seed,
  isImport,
  isValid,
  setMnemonic,
  error,
  setError
}) => {
  const { control, setValue, handleSubmit } = useForm();
  const [keys, setKeys] = useState<Array<string>>(new Array(words).fill(''));

  const onSubmit = () => {
    if (!isValid) return setError('Seed phrase is not correct');

    if (isImport) return onHandleSubmit(keys.join(" "));
    const isEqual = keys.join(" ") === seed?.join(" ");
    if (!isEqual) return setError('Seed phrase is not correct');
    onHandleSubmit(keys.join(" "));
  };

  const handleEventPaste = (event: any, index: number) => {
    const copyText = event.clipboardData?.getData('text/plain');

    const separator = copyText.includes(',') ? ',' : ' ';

    const textArr = copyText.trim().split(separator).map((s:string) => s.trim());
  
    const newKeys = [...keys];
    if (textArr) {
      for (let i = 0; i < keys.length - index; i++) {
        if (textArr.length == i) break;
        newKeys[index + i] = textArr[i];
        setValue(`word${i}`, textArr[i]);
      }
      setKeys(newKeys);
      if (setMnemonic) setMnemonic(newKeys.join(' '));
    }
  
    event.preventDefault();
  };
  

  const onChange = (e: any, index: any) => {
    const newKeys = [...keys];
    newKeys.splice(index, 1, e.target.value);
    setKeys(newKeys);
    if (setMnemonic) setMnemonic(newKeys.join(' '));
  };

  return (
    <>
      <div className="flex my-6">
        <span className="rounded-full w-6 h-6 flex justify-center items-center bg-orange text-black text-lg">
          2
        </span>
        <p className="text-lg text-white ml-3">
          Secret Recovery Phrase
        </p>
      </div>
      <Warning text={error} />
      <form
        autoComplete="off"
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-2 gap-1"
      >
        {
          keys.map((_, index) =>
            <div
              key={index}
              className="flex p-3.5 bg-dark-gray rounded-md"
            >
              <p className="text-gray font-sm mr-3">
                {`${index + 1}.`}
              </p>
              <Controller
                name={`word${index}`}
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <PasswordInput
                    { ...field }
                    onChange={(e: any) => {
                      onChange(e, index);
                      setValue(`word${index}`, e.target.value);
                    }}
                    onPaste={(e: any) => {
                      handleEventPaste(e, index);
                    }}
                    isSmall
                  />
                )}
              />
            </div>
          )
        }
        <div className="fixed bottom-0 left-0 w-full">
          <button
            className="btn btn-primary w-full text-black"
            type='submit'
          >
            Continue
          </button>
        </div>
      </form>
    </>
  );
};

export default CheckingSeedPhrase;

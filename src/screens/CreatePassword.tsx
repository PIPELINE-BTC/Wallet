
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { FC, useState } from 'react';
import PasswordInput from '../common/PasswordInput';
import ServiceNotice from './ServiceNotice';


interface IPasswordForm {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

interface ICreatePassword {
  setData: (...params: any) => void;
  setCurrentStep: (...params: any) => void;
}

function validatePassword(password: string) {
  const hasNumber = /[0-9]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const minLength = password.length >= 8;

  if (hasNumber && hasUpper && minLength) {
    return true;
  } else {
    return "Password must be at least 8 characters long and include at least one uppercase letter and one number.";
  }
}

const CreatePassword: FC<ICreatePassword> = ({ setData, setCurrentStep }) => {
  const {
    control,
    setValue,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<IPasswordForm>({
    defaultValues: {
      agreeTerms: false
    }
  });

  const [showNotice, setShowNotice] = useState(false);

  const onSubmit: SubmitHandler<IPasswordForm> = data => {
    if (data.agreeTerms) {
      setData((prev: any) => ({ ...prev, ...data }));
      setCurrentStep((prev: number) => prev + 1);
    } else {
      alert('You must agree to the terms before proceeding.');
    }
  };

  return (
    <>
      {showNotice ? <ServiceNotice close={() => setShowNotice(false)} /> : null}
      <form
        autoComplete="off"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center justify-center h-full pt-[-52px]"
      >
        <h1 className="text-white mb-11 text-2xl">
          Create a Password
        </h1>
        <p className="text-gray mb-6 text-xs">
          You will use this to unlock your wallet
        </p>
        <div className="mb-4 w-full">
          <Controller
            name="password"
            control={control}
            rules={{
              required: 'This field is required',
              validate: validatePassword
            }}
            render={({ field }) => (
              <PasswordInput
                {...field}
                placeholder="Password"
                onChange={(e: any) => setValue("password", e.target.value)}
              />
            )}
          />
          {errors.password && <p className="validation-error">{errors.password.message}</p>}
        </div>
        <div className="mb-4 w-full">
          <Controller
            name="confirmPassword"
            control={control}
            rules={{
              required: 'This field is required',
              validate: value => {
                if (watch('password') !== value) {
                  return 'Passwords don’t match';
                }
                return true;
              }
            }}
            render={({ field }) => (
              <PasswordInput
                {...field}
                placeholder="Confirm Password"
                onChange={(e: any) => setValue("confirmPassword", e.target.value)}
              />
            )}
          />
          {errors.confirmPassword && <p className="validation-error">{errors.confirmPassword.message}</p>}
        </div>
        <div className="mb-4 w-full">
          <div className="flex text-sm text-white">
            <Controller
              name="agreeTerms"
              control={control}
              rules={{ required: 'You must accept the terms to continue.' }}
              render={({ field: { onChange, onBlur, name, ref, value } }) => (
                <label className="flex items-center mr-2">
                  <input
                    type="checkbox"
                    onChange={onChange}
                    onBlur={onBlur}
                    checked={value}
                    ref={ref}
                    name={name}
                  />
                 &nbsp; I have read and agree to the
                </label>
              )}
            />
            <span onClick={() => setShowNotice(true)} className=" flex underline ml-1 cursor-pointer">Service Notice</span>
          </div>
          {errors.agreeTerms && <p className="validation-error">{errors.agreeTerms.message}</p>}
        </div>
        <div className="fixed bottom-0 w-full">
          <button
            className="btn btn-primary w-full text-black"
            type="submit"
          >
            Continue
          </button>
        </div>
      </form>
    </>
  );

};

export default CreatePassword;

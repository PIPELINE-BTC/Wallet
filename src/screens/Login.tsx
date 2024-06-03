/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';

import useAccount from '../hooks/useAccount';
import HeaderWithNav from '../common/HeaderWithNav';
import PasswordInput from '../common/PasswordInput';
import SecurityWarns from '../common/SecurityWarns';

type LoginFormInput = {
  password: string;
};

const Login: React.FC = () => {
  const {
    handleSubmit,
    setError,
    control,
    setValue,
    formState: { errors }
  } = useForm<LoginFormInput>();
  const { handleUnlock } = useAccount();
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit: SubmitHandler<LoginFormInput> = async (data) => {

    try {
      await handleUnlock(data.password);
      const url = new URL(window.location.href);
      const path = url.searchParams.get('path');
      if (path) return navigate(path);
      navigate(location?.state?.path || '/home', { state: location?.state?.meta});
    } catch (err: any) {
      setError('password', { type: 'manual', message: err.message });
    }
  };

  if (location?.state?.meta?.account || location?.state?.meta?.wallet) return (
    <>
      <div className="absolute w-full">
        <HeaderWithNav
          title="Show Secret Phrase"
          navBack={location?.state?.inNavBack}
        />
      </div>
      <div className="px-6 flex flex-col justify-center h-full">
        <SecurityWarns warningText='Please make sure you have read the security tips above before typing your password' />
        <form
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
          className="pt-3"
        >
          <div>
            <Controller
              name="password"
              control={control}
              rules={{ required: "This field is required" }}
              render={({ field }) => (
                <PasswordInput
                  { ...field }
                  placeholder="Password"
                  onChange={(e: any) => setValue("password", e.target.value)}
                />
              )}
            />
            {
              errors.password &&
              <p className="text-sm text-red-400">
                {errors.password.message}
              </p>
            }
          </div>
          <div className="fixed bottom-0 left-0 w-full">
            <button
              className="btn btn-primary w-full text-black"
              type="submit"
            >
              {`Show ${location?.state?.meta?.account || location?.state?.meta?.wallet ? 'Secret Phrase' : 'WIF'}`}
            </button>
          </div>
        </form>
      </div>
    </>
  );

  return (
    <>
      <div className="absolute">
        <HeaderWithNav
          title=""
          navBack={false}
        />
      </div>
      <form
        autoComplete="off"
        onSubmit={handleSubmit(onSubmit)}
        className="px-6 pt-4 flex flex-col justify-center h-full"
      >
        <h1 className="text-center text-2xl text-white mb-6">
          Welcome back!
        </h1>
        <div className="mb-4">
          <Controller
            name="password"
            control={control}
            rules={{ required: "This field is required" }}
            render={({ field }) => (
              <PasswordInput
                { ...field }
                placeholder="Enter your password"
                onChange={(e: any) => setValue("password", e.target.value)}
              />
            )}
          />
          {
            errors.password &&
            <p className="text-sm text-red-400">
              {errors.password.message}
            </p>
          }
        </div>
        <div className="absolute bottom-0 left-0 w-full">
          <button
            className="btn btn-primary w-full text-black"
            type="submit"
          >
            Unlock
          </button>
        </div>
      </form>
    </>
  );
};

export default Login;

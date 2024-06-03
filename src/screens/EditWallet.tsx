/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useContext, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import HeaderWithNav from '../common/HeaderWithNav';
import { AccountContext } from '../AccountContext';

type EditFormInput = {
  name: string;
};

const EditWallet: FC = () => {
  const { currentAccount, accessService } = useContext(AccountContext);
  const [wallet, setWallet] = useState<any>(null);
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors }
  } = useForm<EditFormInput>();
  const { id } = useParams();
  const navigate = useNavigate();

  const onSubmit: SubmitHandler<EditFormInput> = (data) => {
    if (!wallet) return;
    accessService.editWallet(id, currentAccount.id, data);
    navigate("/home");
  };

  useEffect(() => {
    const wallet = currentAccount.wallets.find((wallet: any) => wallet.id === id);
    setWallet(wallet);
  }, [currentAccount, id]);

  useEffect(() => {
    if (wallet) setValue("name", wallet.name);
  }, [setValue, wallet]);

  return (
    <>
      <HeaderWithNav title={wallet?.name || ""} />
      <form
        autoComplete="off"
        onSubmit={handleSubmit(onSubmit)}
        className="p-6"
      >
        <label htmlFor="name">
          Account Name
        </label>
        <input
          id="name"
          {...register('name', { required: 'This field is required' })}
        />
        {
          errors.name &&
          <p className="text-sm text-red-400">
            {errors.name.message}
          </p>
        }
        <div className="absolute bottom-0 left-0 w-full">
          <button
            className="btn btn-primary w-full text-black"
            type="submit"
          >
            Save Changes
          </button>
        </div>
      </form>
    </>
  );
};

export default EditWallet;

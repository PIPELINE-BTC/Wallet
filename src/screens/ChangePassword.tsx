import { FC } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

import HeaderWithNav from '../common/HeaderWithNav';
import useAccount from '../hooks/useAccount';

interface IPasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePassword: FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors }
  } = useForm<IPasswordForm>();
  const { handleChangePassword } = useAccount();

  const onSubmit: SubmitHandler<IPasswordForm> = (data) => {
    handleChangePassword(data)
    .catch((err) => setError('currentPassword', { type: 'manual', message: err.message }));
  };

  return (
    <>
      <HeaderWithNav title="Change Password" />
      <div className="px-6 pt-6">
        <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4 w-full">
            <input
              placeholder="Current Password"
              type="password"
              {...register('currentPassword', { required: 'This field is required' })}
            />
            {
              errors.currentPassword ?
              <p className="validation-error">
                {errors.currentPassword.message}
              </p> : null
            }
          </div>
          <div className="mb-4 w-full">
            <input
              placeholder="New Password"
              type="password"
              {...register('newPassword', { required: 'This field is required' })}
            />
            {
              errors.newPassword ?
              <p className="validation-error">
                {errors.newPassword.message}
              </p> : null
            }
          </div>
          <div className="mb-4 w-full">
            <input
              placeholder="Confirm Password"
              type="password"
              {...register('confirmPassword', {
                required: 'This field is required',
                validate: (value: string) => {
                  if (watch('newPassword') !== value) return 'Passwords don\'t match'
                }
              })}
            />
            {
              errors.confirmPassword ?
              <p className="validation-error">
                {errors.confirmPassword.message}
              </p> : null
            }
          </div>
          <div className="absolute bottom-0 left-0 w-full">
            <button
              className="btn btn-primary w-full text-black"
              type="submit"
            >
              Change Password
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ChangePassword;

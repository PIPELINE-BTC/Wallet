// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { useForm, SubmitHandler } from 'react-hook-form';

// import { importWalletFromWif } from '../bitcoin/wallet';
// import useAccount from '../hooks/useAccount';
// import toast from 'react-hot-toast/headless';

// interface IWifForm {
//   wif: string;
// }

// const ImportFromWif = ({
//   isImport
// }: { isImport?: boolean }) => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors }
//   } = useForm<IWifForm>();
//   const { handleCreateUser } = useAccount();

//   const onSumbit: SubmitHandler<IWifForm> = async({ wif }) => {
//     const wallet = importWalletFromWif(wif);
//     handleCreateUser(wallet, isImport)
//       .catch((err) => toast(err.message, { style: { background: '#AD3C07', color: '#FFFFFF' } }))
//   };

//   return (
//     <>
//       <div className="flex my-6">
//         <span className="rounded-full w-6 h-6 flex justify-center items-center bg-orange text-black text-lg">
//           2
//         </span>
//         <p className="text-lg text-white ml-3">
//           Secret Recovery Phrase
//         </p>
//       </div>
//       <form
//         onSubmit={handleSubmit(onSumbit)}
//         autoComplete="off"
//       >
//         <div className="mb-4 w-full">
//           <label htmlFor="wif">
//             WIF private Key
//           </label>
//           <input
//             id="wif"
//             type="password"
//             className="mt-2"
//             {...register('wif', { required: 'This field is required' })}
//           />
//           {
//             errors.wif ?
//             <p className="validation-error">
//               {errors.wif.message}
//             </p> : null
//           }
//         </div>
//         <div className="absolute bottom-0 left-0 w-full">
//           <button
//             className="btn btn-primary w-full text-black"
//             type='submit'
//           >
//             Continue
//           </button>
//         </div>
//       </form>
//     </>
//   );
// }

// export default ImportFromWif;

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm, SubmitHandler } from 'react-hook-form';

import { importWalletFromWif } from '../bitcoin/wallet';
import useAccount from '../hooks/useAccount';
import toast from 'react-hot-toast/headless';

interface IWifForm {
  wif: string;
}

const ImportFromWif = ({
  isImport,
  password
}: { isImport?: boolean, password?: string }) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<IWifForm>();
  const { handleCreateUser } = useAccount();

  const onSumbit: SubmitHandler<IWifForm> = async({ wif }) => {
    const wallet = importWalletFromWif(wif);
    handleCreateUser({...wallet, password}, isImport)
      .catch((err) => toast(err.message, { style: { background: '#AD3C07', color: '#FFFFFF' } }))
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
      <form
        onSubmit={handleSubmit(onSumbit)}
        autoComplete="off"
      >
        <div className="mb-4 w-full">
          <label htmlFor="wif">
            WIF private Key
          </label>
          <input
            id="wif"
            type="password"
            className="mt-2"
            {...register('wif', { required: 'This field is required' })}
          />
          {
            errors.wif ?
            <p className="validation-error">
              {errors.wif.message}
            </p> : null
          }
        </div>
        <div className="absolute bottom-0 left-0 w-full">
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
}

export default ImportFromWif;


/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
// import toast from "react-hot-toast/headless";

import useWallet from "../hooks/useWallet";
import RadioButton from "./RadioButton";
import { AccountContext } from "../AccountContext";
import { getAddress } from "../utils";
import Edit from "../assets/img/edit.svg?react";


const Wallet = ({ wallet }: any) => {
  const { handleSelectWallet } = useWallet();
  const { currentWallet, /* accessService, */network } = useContext(AccountContext);

  const navigate = useNavigate();

  return (
    <div
      key={wallet.id}
      className="bg-dark-gray py-3 px-5 flex items-center rounded-md cursor-pointer relative"
      onClick={() => {
        handleSelectWallet(wallet.id);
        navigate('/home');
      }}
    >
      <RadioButton
        id={wallet.id}
        checked={currentWallet.id === wallet.id}
      />
      <div className="flex flex-col ml-3">
        <div className="flex">
          <p className="text-base text-white font-semibold">
            {wallet.name}
          </p>
          <button
            className="my-auto px-2"
            onClick={(e: any) => {
              e.stopPropagation();
              navigate(`/wallet/edit/${wallet.id}`);
            }}
          >
            <Edit />
          </button>
        </div>
        <p className="text-gray text-sm">
          {getAddress(wallet.address?.[network])}
        </p>
      </div>
      {
        // currentAccount.mnemonic ?
        // <button
        //   className="ml-auto py-1.5 px-2"
        //   onClick={handleOpenMenu}
        // >
        //   <MenuIcon />
        // </button>
        // : null
      }
      {
        // isMenuOpen ?
        // <div
        //   ref={modalRef}
        //   className="absolute bg-dark-gray border border-gray p-3 top-12 right-0 cursor-pointer rounded-md z-50"
        // >
        //   <ul>
        //     <li
        //       className="flex items-center"
        //       onClick={handleShowSecret}
        //     >
        //       <Lock />
        //       <p className="text-white ml-2 text-sm whitespace-nowrap">
        //         Show 'WIF'
        //       </p>
        //     </li>
        //     <li
        //       className="flex itens-center pt-1.5"
        //       onClick={handleDeleteWallet}
        //     >
        //       <Delete />
        //       <p className="text-danger-100 ml-2 text-sm whitespace-nowrap">
        //         Delete Wallet
        //       </p>
        //     </li>
        //   </ul>
        // </div> : null
      }
    </div>
  );
}

export default Wallet;

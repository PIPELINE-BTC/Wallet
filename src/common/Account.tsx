/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import { useContext, useRef, useState } from "react";
import toast from "react-hot-toast/headless";

import useAccount from "../hooks/useAccount";
import RadioButton from "./RadioButton";
import { AccountContext } from "../AccountContext";
import { getAddress } from "../utils";
import MenuIcon from "../assets/img/settings-menu.svg?react";
import Delete from "../assets/img/delete.svg?react";
import useClickOutside from "../hooks/useClickOutside";
import Edit from "../assets/img/edit.svg?react";
import Lock from "../assets/img/lock.svg?react";

const Account = ({ acc }: any) => {
  const { handleSetAccout } = useAccount();
  const { currentAccount, network, accessService } = useContext(AccountContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, () => setIsMenuOpen(false));

  const handleOpenMenu = (e: any) => {
    e.stopPropagation();
    setIsMenuOpen((prev: boolean) => !prev);
  };

  const handleDeleteWallet = (e: any) => {
    e.stopPropagation();
    accessService.store.deleteAccount(acc.id)
      .catch((error: Error) => toast(error.message, { style: { background: '#AD3C07', color: '#FFFFFF' } }))
      .finally(() => setIsMenuOpen(false));
  };

  const handleShowSecret = (e: any) => {
    e.stopPropagation();
    navigate("/login", { state: { path: "/secret", inNavBack: true, meta: { account: acc } } });
  };

  return (
    <div
      className="bg-dark-gray py-3 px-5 flex items-center rounded-md cursor-pointer relative"
      onClick={() => {
        handleSetAccout(acc.id);
        navigate('/home');
      }}
    >
      <RadioButton
        id={acc.id}
        checked={currentAccount.id === acc.id}
      />
      <div className="flex flex-col ml-3">
        <div className="flex">
          <p className="text-base text-white font-semibold">
            {acc.name}
          </p>
          <button
            className="my-auto px-2"
            onClick={(e: any) => {
              e.stopPropagation();
              navigate(`/accounts/edit/${acc.id}`);
            }}
          >
            <Edit />
          </button>
        </div>
        <p className="text-gray text-sm">
          {getAddress(acc.wallets?.[0]?.address?.[network])}
        </p>
      </div>
      <button
        className="ml-auto py-1.5 px-2"
        onClick={handleOpenMenu}
      >
        <MenuIcon />
      </button>
      {
        isMenuOpen ?
        <div
          ref={modalRef}
          className="absolute bg-dark-gray border border-gray p-3 top-12 right-0 cursor-pointer rounded-md z-50"
        >
          <ul>
            <li
              className="flex items-center pb-1.5"
              onClick={handleShowSecret}
            >
              <Lock />
              <p className="text-white ml-2 text-sm whitespace-nowrap">
                {`Show ${acc.mnemonic ? 'Secret Phrase' : 'WIF'}`}
              </p>
            </li>
            <li
              className="flex itens-center pt-1.5"
              onClick={handleDeleteWallet}
            >
              <Delete />
              <p className="text-danger-100 ml-2 text-sm whitespace-nowrap">
                Delete Account
              </p>
            </li>
          </ul>
        </div> : null
      }
    </div>
  );
};

export default Account;

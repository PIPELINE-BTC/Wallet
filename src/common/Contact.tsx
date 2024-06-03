/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import useClickOutside from "../hooks/useClickOutside";
import MenuIcon from "../assets/img/settings-menu.svg?react";
import Delete from "../assets/img/delete.svg?react";
import Edit from "../assets/img/edit-pencil.svg?react";
import { AccountContext } from "../AccountContext";
import { getAddress } from "../utils";

const Contact = ({ data={} }: any) => {
  const { accessService } = useContext(AccountContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, () => setIsMenuOpen(false));
  const navigate = useNavigate();

  const handleDelete = (e: any) => {
    e.stopPropagation();
    accessService.store.deleteContact(data.id);
  };

  return (
    <div
      className="bg-dark-gray py-3 pl-3 pr-5 flex items-center justify-between rounded-md relative mb-1.5 cursor-pointer"
      onClick={() => navigate('/send', { state: data.address })}
    >
      <div className="flex flex-col mb-1">
        <p className="text-white font-medium text-base">
          {data.name}
        </p>
        <p className="text-white font-medium text-sm">
          {getAddress(data.address)}
        </p>
      </div>
      <button
        className="ml-auto py-1.5 pl-2"
        onClick={(e: any) => {
          e.stopPropagation()
          setIsMenuOpen((prev: boolean) => !prev)
        }}
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
              onClick={(e: any) => {
                e.stopPropagation()
                navigate(`/contact/edit/${data.id}`)
              }}
            >
              <Edit />
              <p className="text-white ml-2 text-sm whitespace-nowrap">
                Edit Contact
              </p>
            </li>
            <li
              className="flex itens-center pt-1.5"
              onClick={handleDelete}
            >
              <Delete />
              <p className="text-danger-100 ml-2 text-sm whitespace-nowrap">
                Delete Wallet
              </p>
            </li>
          </ul>
        </div> : null
      }
    </div>
  );
};

export default Contact;

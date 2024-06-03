/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";

import HeaderWithNav from "../common/HeaderWithNav";
import { AccountContext } from "../AccountContext";
import Contact from "../common/Contact";

const AddressBook = () => {
  const { addressBook } = useContext(AccountContext);
  const navigate = useNavigate();

  return (
    <>
      <HeaderWithNav
        title="Address Book"
        goBack={() => navigate('/send')}
      />
      <div className="p-6">
        <Link
          to="/contact/create"
          className="bg-dark-gray flex justify-center items-center p-2 text-center text-sm rounded-md text-white mb-4"
        >
          <span className="text-orange text-base mr-2.5">
            +
          </span>
          Add Contact
        </Link>
        <p className="mb-1.5 text-white text-base">
          Contacts
        </p>
        {
          addressBook?.map((contact: any) =>
            <Contact
              key={contact.id}
              data={contact}
            />
          )
        }
      </div>
    </>
  );
};

export default AddressBook;

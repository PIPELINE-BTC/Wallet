import { useContext, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

import logo from "../assets/img/logo-link.svg";
import WarnIcon from "../assets/img/warn.svg?react";
import { AccountContext } from "../AccountContext";

import { connect } from "../bitcoin/wallet";

const SignWebsite = () => {
  const [link, setLink] = useState("");
  const { accessService } = useContext(AccountContext);
  // const navigate = useNavigate();

  useEffect(() => {
    const url = new URL(window.location.href);
    const website = url.searchParams.get("url");
    if (website) setLink(website);
  }, []);

  const handleAddWebsite = async () => {
    accessService.store.addWebsite(link);
    // const result =
    await connect();

    // if(result) {
      setTimeout(() => window.close(), 500);
    // }
    // navigate('/home');
    // window.close();
  };

  return (
    <>
      <h1 className="mb-10 mt-4 text-white font-medim text-lg text-center">
        Sign Transaction
      </h1>
      <div className="px-6">
        <div className="bg-modal-dark px-6 pb-6 pt-3 mb-1.5 rounded-md">
          <p className="text-white font-medium text-base mb-3">Link to site</p>
          <div className="flex items-center">
            <img
              src={logo}
              alt="PIPELINE"
              className="w-[21.67px] h-5 min-[1200px]:w-[45px] min-[1200px]:h-auto"
            />
            <p className="text-white font-medium text-sm ml-3">{link}</p>
          </div>
        </div>
        <div className="bg-modal-dark px-6 pb-6 pt-3 mb-1.5 rounded-md">
          <p className="text-white font-medium text-base mb-3">
            Signature Request
          </p>
          <div className="flex">
            <span>
              <WarnIcon width={24} height={24} />
            </span>
            <p className="text-gray text-sm ml-3">
              Only sign this message if you fully understand the contents and
              trust the requesting site.
            </p>
          </div>
        </div>
        <div className="bg-modal-dark px-6 pb-6 pt-3 mb-1.5 rounded-md">
          <p className="text-white font-medium text-base mb-3">
            Signature Request
          </p>
          <p className="text-gray text-sm">
            There are many variations of passages of Lorem Ipsum available, but
            the majority have suffered alteration in some form, by injected
            humour
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full grid grid-cols-2">
          <button className="btn btn-secondary" onClick={() => window.close()}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleAddWebsite}>
            Sign & Send
          </button>
        </div>
      </div>
    </>
  );
};

export default SignWebsite;

import { useContext, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

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
    await connect();

    setTimeout(() => window.close(), 500);

  };

  return (
    <>
      <div className="px-6">
        <div className="bg-modal-dark px-6 pb-6 pt-3 mb-1.5 rounded-md">
      <h1 className="mb-10 mt-4 text-white font-medim text-lg text-center">
        Connect to website
      </h1>
          <p className="text-white font-medium text-base mb-3">Link to site</p>
          <div className="flex items-center">
            <p className="text-white font-medium text-sm ml-3">{link}</p>
          </div>
        </div>
        <div className="bg-modal-dark px-6 pb-6 pt-3 mb-1.5 rounded-md">
          <p className="text-white font-medium text-base mb-3">
            Connection Request
          </p>
          <div className="flex">
            <span>
              <WarnIcon width={24} height={24} />
            </span>
            <p className="text-gray text-sm ml-3">
            Only connect to this website if you are completely sure it is legitimate.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full grid grid-cols-2">
          <button className="btn btn-secondary" onClick={() => window.close()}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleAddWebsite}>
            Connect
          </button>
        </div>
      </div>
    </>
  );
};

export default SignWebsite;

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, useNavigate } from 'react-router-dom';
import { useContext, useEffect } from 'react';

import logo from 'assets/img/logo.svg';
import { AccountContext } from '../AccountContext';


const Welcome = () => {
  const navigate = useNavigate();
  const { isUnlocked, accounts, accessService } = useContext(AccountContext);

  useEffect(() => {
    (async () => {
      if (localStorage.getItem("isUserExist") && accessService.store.accounts.length > 0) {
        const url = new URL(window.location.href);
        const path = url.searchParams.get('path');
        navigate(path || '/home');
      }
      else if (!await accessService.store.password() && localStorage.getItem("isUserExist")) navigate('/login');
    })();
  }, [accessService.store, accounts, isUnlocked, navigate]);

  return (
    <div className="flex flex-col bg-home-pattern bg-contain bg-no-repeat h-full">
      <div className="flex flex-col items-center justify-center mb-32 mt-36">
        <img
          src={logo}
          alt="PIPILINE"
          className="mb-8"
        />
        <p className="text-gray text-xl text-center">
          Store and manage your<br />
          Bitcoin assets
        </p>
      </div>
      <div className="flex flex-col absolute bottom-0 w-full">
        <Link
          className="btn btn-secondary w-full"
          to="/import"
        >
          I already have a Wallet
        </Link>
        <Link
          className="btn btn-primary w-full"
          to="/create-user"
        >
          Create new Wallet
        </Link>
      </div>
    </div>
  );
};

export default Welcome;

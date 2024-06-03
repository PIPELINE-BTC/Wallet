/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AccountContext } from '../AccountContext';
import HeaderWithNav from '../common/HeaderWithNav';
import Account from '../common/Account';

const Accounts: FC = () => {
  const { accounts } = useContext(AccountContext);
  const navigate = useNavigate();

  return (
    <>
      <HeaderWithNav
        title="Wallets"
        goBack={() => navigate('/wallets')}
      />
      <div className="p-6 bg-black">
        <div className="flex flex-col gap-2 mb-8">
          {
            accounts.map((acc: any) =>
              <Account
                acc={acc}
                key={acc.id}
              />
            )
          }
        </div>
        <div className="flex flex-col fixed left-0 bottom-0 w-full">
          <Link
            className="btn btn-secondary w-full"
            to="/wallet"
          >
            Create new Wallet
          </Link>
        </div>
      </div>
    </>
  );
};

export default Accounts;

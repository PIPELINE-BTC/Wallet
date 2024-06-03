import { FC } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import Wallet from 'assets/img/wallet.svg?react';
import Settings from 'assets/img/settings.svg?react';
import List from 'assets/img/list.svg?react';

const FooterNav: FC = () => {
  const { pathname } = useLocation();

  return (
    <div className="grid grid-cols-3 fixed bottom-0 left-0 w-full bg-modal-dark">
      <NavLink
        to="/home"
        className={`flex justify-center p-5 ${pathname === '/home' ? 'fill-orange bg-dark-gray' : 'fill-white'}`}
      >
        <Wallet
          width={18.3}
          height={18.3}
        />
      </NavLink>
      <NavLink
        to="/links"
        className={`flex justify-center p-5 ${pathname === '/links' ? 'fill-orange bg-dark-gray' : 'fill-white'}`}
      >
        <List
          width={18.3}
          height={18.3}
        />
      </NavLink>
      <NavLink
        to="/settings"
        className={`flex justify-center p-5 ${pathname === '/settings' ? 'fill-orange bg-dark-gray' : 'fill-white'}`}
      >
        <Settings
          width={19.19}
          height={20}
        />
      </NavLink>
    </div>
  );
}

export default FooterNav;

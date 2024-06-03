import { FC } from 'react';
import { Outlet } from "react-router-dom";

import FooterNav from './FooterNav';

const HomeLayout: FC = () => {
  return (
    <>
      <Outlet />
      <FooterNav />
    </>
  );
};

export default HomeLayout;

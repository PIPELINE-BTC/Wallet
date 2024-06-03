/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from 'react';

import CloseButton from './CloseButton';
import GoBackBtn from './GoBackBtn';

interface IHeaderWithNav {
  navBack?: boolean;
  handleClose?: () => void;
  title?: string;
  goBack?: any;
  isAbsolute?: boolean;
}

const HeaderWithNav: FC<IHeaderWithNav> = ({
  navBack=true,
  handleClose,
  goBack,
  title,
  isAbsolute = false
}) => {
  return (
    <div className={`w-full nav-header bg-black z-50 ${isAbsolute ? "absolute" : ""}`}>
      <div>
        {
          navBack ?
          <GoBackBtn goBack={goBack} /> : null
        }
      </div>
      <h1 className="text-white text-center my-auto text-base">
        {title}
      </h1>
      <div className="flex justify-end">
        {
          handleClose ?
          <CloseButton handleClose={handleClose} /> : null
        }
      </div>
    </div>
  );
};

export default HeaderWithNav;

import { FC } from 'react';

import Close from 'assets/img/close.svg?react';

interface ICloseButton {
  handleClose: () => void;
}

const CloseButton: FC<ICloseButton> = ({ handleClose }) => {
  return (
    <div>
      <button
        onClick={handleClose}
        className="p-4 bg-dark-gray"
      >
        <Close />
      </button>
    </div>
  );
}

export default CloseButton;

import { FC, ReactNode } from 'react';

import HeaderWithNav from './HeaderWithNav';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal: FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-40 overflow-x-hidden overflow-y-auto outline-none">
      <div
        className="absolute inset-0 bg-overlay"
        onClick={onClose}
      />
      <div className="z-50 relative bg-modal-dark">
        <HeaderWithNav
          navBack={false}
          handleClose={onClose}
          title="Receive"
        />
        <div className="pt-20 px-6 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

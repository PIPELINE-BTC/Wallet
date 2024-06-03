import { FC } from 'react';

interface ServiceNoticeProps {
  close: () => void;
}

const ServiceNotice: FC<ServiceNoticeProps> = ({ close }) => {

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative p-8 bg-black bg-opacity-75 rounded max-w-lg mx-auto">
        <button onClick={close} className="absolute top-0 left-0 p-2 text-white text-3xl">
          X
        </button>
        <div className="text-white text-center p-4">
          <p className="text-sm mb-3">
            The PIPELINE Wallet, currently in its alpha release, is a specialized tool for securely managing and storing assets on the Bitcoin network, initially supporting only the PIPE protocol. It also features capabilities to detect and protect Ordinals and BRC-20 assets, but does not yet offer protection for Runes and other UTXO protocol assets.
          </p>
          <p className="text-sm mb-3">
            Despite extensive testing, the wallet may still contain bugs. We will continue to test and improve the wallet.
          </p>
          <p className="text-sm">
            By continuing to use this wallet, you acknowledge and accept these terms and conditions. Please ensure you understand your responsibilities and the limitations of the PIPELINE Wallet during its alpha phase.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServiceNotice;


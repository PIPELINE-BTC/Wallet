import Warn from '../assets/img/warn.svg?react';
import Warning from "../common/Warning";

const SecurityWarns = ({ warningText }: { warningText: string }) => {
  return (
    <>
      <div className="flex p-3 rounded-md bg-modal-dark mb-1.5">
        <span>
          <Warn />
        </span>
        <p className="text-white text-sm pl-3">
          If you lose your Secret Phrase, your assets will disappear!
        </p>
      </div>
      <div className="flex p-3 rounded-md bg-modal-dark mb-1.5">
        <span>
          <Warn />
        </span>
        <p className="text-white text-sm pl-3">
          If you share your Secret Recovery Phrase with others, your assets will be stolen!
        </p>
      </div>
      <div className="flex p-3 rounded-md bg-modal-dark mb-6">
        <span>
          <Warn />
        </span>
        <p className="text-white text-sm pl-3">
          The Secret Recovery Phrase is stored only in your browser, you are
          responsible for the security of the private key!
        </p>
      </div>
      <Warning text={warningText} />
    </>
  );
}

export default SecurityWarns;

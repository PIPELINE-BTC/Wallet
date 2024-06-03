/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from "react";

import { connect } from "../bitcoin/wallet";

const Connect: FC<any> = () => {
  const handleSubmit = async () => {
    const cnct = await connect();
    console.log(cnct);
  };

  return (
    <div>
      <button className="btn btn-primary" onClick={handleSubmit}>
        Connect
      </button>
    </div>
  );
};

export default Connect;

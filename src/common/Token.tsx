/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";

// import TokenIcon from "./TokenIcon";

import getIconLogo from "./GetIconLogo";


const Token = ({ token={}, className='' }: any) => {
  const navigate = useNavigate();

  const Icon = getIconLogo(token?.ticker, token.id);
  return (
    <div
      className={`p-2.5 bg-dark-gray rounded-md flex justify-between items-center cursor-pointer ${className}`}
      onClick={() => navigate("/send", { state: { tab: "tokens", token } })}
    >
      <div className="flex">
      {Icon}
          {/* */}
        <p className="text-white font-medium text-sm my-auto ml-3">
          {token.id === "0" ? token.ticker.toUpperCase() : `${token.ticker.toUpperCase()}:${token.id}`}
        </p>
      </div>
      <p className="text-white font-medium text-sm">
        {token?.amt}
      </p>
    </div>
  );
};

export default Token;

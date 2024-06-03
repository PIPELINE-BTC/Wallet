/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import Token from "./Token";

const Tokens = ({ tokens = [] }: any) => {
  const [tkns, setTkns] = useState([]);

  useEffect(() => {
    setTkns(tokens.filter((token: any) => token?.collectionAddr === null && token?.isPB === false && token?.isPBO === false));
  }, [tokens]);

  return (
    <div className="p-6 flex flex-col gap-1">
      {tkns.length
        ? tkns.map((token: any) => <Token key={token?.id} token={token} />)
        : null}
    </div>
  );
};

export default Tokens;

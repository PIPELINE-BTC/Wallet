/* eslint-disable @typescript-eslint/no-explicit-any */
// import { useState, useEffect } from "react";
import NftCard from "./NftCard";

const Nfts = ({ tokens = [] }: any) => {
  return (
    <div className="bg-black px-6 pt-8 pb-20 flex flex-col gap-1 md:grid md:grid-cols-4 md:gap-10">
      {tokens.length
        ? tokens.map((token: any) =>
            token?.amt ? <NftCard key={token.id} token={token} /> : null
          )
        : null}
    </div>
  );
};

export default Nfts;

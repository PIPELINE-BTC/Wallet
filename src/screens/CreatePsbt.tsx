/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from "react";

import { createTransferTokenPsbt } from "../bitcoin/transaction";

import { accessService } from "../background";

const CreatePsbt: FC<any> = () => {
  const [token, setToken] = useState("");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [id, setId] = useState("");

  const handleSubmit = async () => {
    for (
      let i = 0;
      i < accessService.store.currentAccount.wallets.length;
      i++
    ) {
      if (
        accessService.store.currentAccount.wallets[i].address.testnet ===
        accessService.store.currentWallet.address.testnet
      ) {
        const psbt = await createTransferTokenPsbt(
          token.slice(0, -2),
          i,
          recipient,
          id,
          amount
        );

        console.log(psbt);
        // if (i === 0) {
        //   // const psbt =
        //   await createTransferTokenPsbt(token.slice(0, -2), 1, recipient);
        //   // if (psbt) setTimeout(() => window.close(), 1000);
        // } else if (i === 1) {
        //   // const psbt =
        //   await createTransferTokenPsbt(token.slice(0, -2), 0, recipient);
        //   // if (psbt) setTimeout(() => window.close(), 1000);
        // }
      }
    }
    // const psbt = await createTransferTokenPsbt(token.slice(0, -2), );
    // if (psbt) setTimeout(() => window.close(), 1000);
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    const amount = url.searchParams.get("amount");
    const ticker = url.searchParams.get("ticker");
    const toAddress = url.searchParams.get("recipient");
    const id = url.searchParams.get("id");
    if (amount) setAmount(amount);
    if (ticker) setToken(ticker);
    if (toAddress) setRecipient(toAddress);
    if (id) setId(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="py-4 px-6">
      <h1 className="text-white text-center text-base font-medium mb-10">
        Sign Transaction
      </h1>
      <div className="bg-dark-gray p-6 rounded-md mb-3">
        <p className="text-white font-medium text-base mb-3">Spend Amount</p>
        <p className="text-white font-bold text-3xl">{`${amount} ${token}`}</p>
      </div>
      <h2 className="text-white text-sm mb-1.5">Inputs: (1)</h2>
      <div className="bg-dark-gray px-6 py-3.5 rounded-md mb-3 flex justify-between">
        <div className="flex items-center">
          <p className="text-white text-sm mr-2">gm45h...xm09r</p>
          <div className="border-2 border-orange p-1 rounded-md text-xs text-orange">
            To Sign
          </div>
        </div>
        <p className="text-white text-xs my-auto">
          0.000000234
          <span className="ml-1 text-gray">BTC</span>
        </p>
      </div>
      <div className="absolute bottom-0 left-0 w-full grid grid-cols-2">
        <button className="btn btn-secondary" onClick={() => window.close()}>
          Reject
        </button>
        <button className="btn btn-primary" onClick={handleSubmit}>
          Sign & Send
        </button>
      </div>
    </div>
  );
};

export default CreatePsbt;

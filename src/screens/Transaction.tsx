/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import HeaderWithNav from "../common/HeaderWithNav";

import {
  sendSats,
  sendTransferTransaction,
  completePsbt,
} from "../bitcoin/transaction";
import Send from "./Send";
import { AccountContext } from "../AccountContext";
import TransactionConfirm from "./TransactionConfirm";

import { accessService } from "../background";

const Transaction: FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [customFee, setCustomFee] = useState<number>(0);
  const navigate = useNavigate();
  const [data, setData] = useState<any>({});

  const [isQueryParams, setIsQueryParams] = useState<boolean>(false);
  const [queryData, setQueryData] = useState<any>("");
  const { currentWallet } = useContext(AccountContext);

  const getQueryData = () => {
    const url = new URL(window.location.href);
    const isRecipientData = url.searchParams.get("recipient");
    const isAmountData = url.searchParams.get("amount");
    const isPsbtData = url.searchParams.get("psbt");
    if (isRecipientData && isAmountData && isPsbtData) {
      return {
        recipient: url.searchParams.get("recipient"),
        amount: url.searchParams.get("amount"),
        psbt: url.searchParams.get("psbt"),
      };
    }
    return null;
  };

  const handleSubmit = () => {
    for (
      let i = 0;
      i < accessService.store.currentAccount.wallets.length;
      i++
    ) {
      if (
        accessService.store.currentAccount.wallets[i].address.testnet ===
        accessService.store.currentWallet.address.testnet
      ) {
        if (isQueryParams) {
          completePsbt(data.psbt, data.recipient, i).then(() => {
            navigate("/send/success");
          });
        } else {
          const key = currentWallet.wif.livenet;
          let isMax = data.amount === data.token?.amt;
          
          if (data.token?.id !== undefined) {
            const amtFixed = parseFloat(parseFloat(data.amount).toFixed(data.token?.deci));
            sendTransferTransaction(
              // mnemonic,
              key,
              data.recipient,
              data.token?.ticker,
              data.token.id,
              data.amount,
              i,
              customFee || data.fee.amount,
              true,
              true,
              isMax
            ).then((d: any) => {
              const locked_tokens = localStorage.getItem("locked-tokens");
              localStorage.setItem(
                "locked-tokens",
                locked_tokens
                  ? JSON.stringify([
                      ...JSON.parse(locked_tokens),
                      {
                        txid: d,
                        ticker: data.token?.ticker,
                        id: data.token?.id,
                        amount: amtFixed,
                      },
                    ])
                  : JSON.stringify([
                      {
                        txid: d,
                        ticker: data.token?.ticker,
                        id: data.token?.id,
                        amount: amtFixed,
                      },
                    ])
              );
              navigate("/send/success");
            });
          } else {
            const satsFixed = parseFloat(parseFloat(data.amount).toFixed(8));

            sendSats(
              key,
              data.recipient,
              satsFixed,
              i,
              customFee || data.fee.amount,
              true,
              true,
              isMax
            ).then(() => navigate("/send/success"));
          }
        }
      }
    }
  };

  useEffect(() => {
    const queryData = getQueryData();
    setQueryData(queryData);
  }, []);

  useEffect(() => {
    if (queryData) {
      setIsQueryParams(true);
    }
  }, [queryData]);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Send
            setCurrentStep={setCurrentStep}
            setData={setData}
            data={data}
            queryData={queryData}
            customFee={customFee}
            setCustomFee={setCustomFee}
          />
        );

      case 1:
        return (
          <TransactionConfirm
            setCurrentStep={setCurrentStep}
            handleSubmit={handleSubmit}
            data={data}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <HeaderWithNav
        title={currentStep ? "Sign Transaction" : "Send"}
        goBack={() => navigate("/home")}
      />
      <div className="px-6 pt-6">{renderCurrentStep()}</div>
    </>
  );
};

export default Transaction;

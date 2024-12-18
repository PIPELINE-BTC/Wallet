/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';

import { getAddress, convertBtcToUsd } from '../utils';
import placeholder from "../assets/img/nft-placehoder.png";
import GetIconLogo from '../common/GetIconLogo';
import Bitcoin from "../assets/img/bitcoin.svg?react";

const TransactionConfirm: FC<any> = ({ setCurrentStep, handleSubmit, data = {} }) => {
  const [total, setTotal] = useState(0);
  const [priceInUSD, setPriceInUSD] = useState<number | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getIcon = () => {
    if (data.token?.collectionAddr) return (
      <img
        src={data.token?.img || placeholder}
        alt="NFT"
        className="rounded-sm mr-2"
        width={37}
        height={37}
      />
    );
    return data.token?.ticker === "BTC" && data.token?.id === undefined ? (
      <Bitcoin />
    ) : (
      GetIconLogo(data.token?.ticker, data.token?.id)
    );
  };

  const getTotalAmount = (data: any) => {
    const amountParsed = parseFloat(data?.amount);

    if (data.token?.ticker === "BTC" && data.token?.id === undefined) {
      const totalSats = amountParsed + data?.calculatedFee;

      if (data.token?.amt === amountParsed) {
        setTotal(amountParsed);
      } else {
        setTotal(parseFloat(totalSats.toFixed(8)));
      }
    } else {
      setTotal(amountParsed);
    }
  };

  useEffect(() => {
    if (data.amount) getTotalAmount(data);

    // Fetch BTC to USD conversion rate once
    const fetchPriceInUSD = async () => {
      const usdPrice = await convertBtcToUsd(1, { priceOnly: true });
      setPriceInUSD(usdPrice);
    };

    fetchPriceInUSD();
  }, [data]);

  return (
    <div>
      {isSubmitting && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex justify-center items-center z-10">
          <div className="spinner"></div>
        </div>
      )}
      <div className="content">
        <div className="bg-dark-gray py-3 px-6 rounded-md mb-1.5">
          <p className="text-base text-white font-semibold">Send to</p>
          <p className="text-gray text-sm">{getAddress(data.recipient)}</p>
        </div>
        <div className="bg-dark-gray py-3 px-6 rounded-md mb-1.5">
          <p className="text-base text-white mb-3 font-semibold">
            {`Send ${data.token?.collectionAddr ? "NFT" : "Token"}`}
          </p>
          <div className="flex items-center">
            {getIcon()}
            <div className="flex flex-col ml-3">
              <p className="text-base text-white">
                {data.token?.ticker === "BTC" && data.token?.id === undefined
                  ? "BTC"
                  : `${data.token?.ticker}:${data.token?.id}`}
              </p>
              <p className="text-gray text-sm">                {data.token?.ticker === "BTC" && data.token?.id === undefined
                  ? priceInUSD ? `${data.amount} ($${(total * priceInUSD).toFixed(2)})` : "(Loading...)"
                  : data.amount}</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-gray py-3 px-6 rounded-md">
          <p className="text-base text-white font-semibold">
            Total Send
          </p>
          <p className="text-white text-lg font-bold my-3">
              {total}
          </p>
          <p className="text-gray text-sm">
            {data.calculatedFee.toFixed(8)} BTC (Network Fees)
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full grid grid-cols-2">
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentStep((prev: number) => prev - 1)}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setIsSubmitting(true);
              handleSubmit();
            }}
          >
            Sign & Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionConfirm;
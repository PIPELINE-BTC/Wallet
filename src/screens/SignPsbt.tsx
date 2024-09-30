/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from "react";
import { signPsbt } from "../bitcoin/transaction.ts";
import axios from "axios";
import accessService from "../background/services/accessService.ts";

interface FeeRates {
	halfHourFee: number;
	fastestFee: number;
  }
  
  const estimateFee = async (): Promise<FeeRates | null> => {
	const selectedNetwork = accessService.store.network;
  
	try {
	  const response = await axios.get(
		`https://mempool.space${selectedNetwork === "testnet" ? "/testnet" : ""}/api/v1/fees/recommended`
	  );
	  return {
		halfHourFee: response.data.halfHourFee,
		fastestFee: response.data.fastestFee,
	  };
	} catch (error) {
	  console.error("Error fetching fee rates:", error);
	  return null;
	}
  };
  
  const SignPsbt: FC = () => {
	const [psbtBase64, setPsbtBase64] = useState<string>("");
	const [feeRates, setFeeRates] = useState<FeeRates | null>(null);
	const [selectedFee, setSelectedFee] = useState<"normal" | "fast">("normal");
  
	useEffect(() => {
	  const url = new URL(window.location.href);
	  const psbtBase64Param = url.searchParams.get("psbtBase64");
	  if (psbtBase64Param) {
		setPsbtBase64(psbtBase64Param);
	  }
  
	  // Fetch fee rates when component mounts
	  estimateFee().then(rates => {
		if (rates) {
		  setFeeRates(rates);
		}
	  });
	}, []);
  
	const signPSBTData = async () => {
	  if (!psbtBase64) {
		alert('No PSBT');
		return;
	  }
	  if (!feeRates) {
		alert('Fee rates not loaded');
		return;
	  }
	  await signPsbt(psbtBase64, -1); 
  
	  setTimeout(() => window.close(), 500);
	}
  
	const truncate = (fullStr: string, strLen: number, separator = '...') => {
	  if (fullStr.length <= strLen) return fullStr;
	  return fullStr.slice(0, strLen) + separator + fullStr.slice(fullStr.length - strLen);
	};
  
	const copyToClipboard = (text: string) => {
	  navigator.clipboard.writeText(text).then(() => {
		alert('Copied to clipboard');
	  }).catch(err => {
		console.error('Failed to copy: ', err);
	  });
	};
  
	return (
	  <div className="flex flex-col h-screen bg-black text-white">
		<div className="fixed top-0 left-0 w-full py-4 flex justify-center bg-gray-900">
		  <h1 className="text-center text-base font-medium">
			Sign Transaction
		  </h1>
		</div>
		<div className="flex-grow overflow-auto px-6 pt-16 pb-20">
		  <div className="bg-gray-800 p-6 rounded-md mb-3">
			<p className="font-medium text-base mb-3">Transaction to sign (PSBT format)</p>
			<p className="text-xl font-medium cursor-pointer"
			   onClick={() => copyToClipboard(psbtBase64)}
			   title="Click to copy full PSBT">
			  -listing PSBT: {truncate(psbtBase64, 10)}-
			</p>
		  </div>
		  <div className="bg-gray-800 p-6 rounded-md mb-3">
			<p className="font-medium text-base mb-3">Select Fee Rate</p>
			{feeRates ? (
			  <div className="flex flex-col space-y-2">
				<label className="flex items-center cursor-pointer">
				  <input
					type="radio"
					className="form-radio text-orange-500 mr-2"
					checked={selectedFee === "normal"}
					onChange={() => setSelectedFee("normal")}
				  />
				  <span>Normal: {feeRates.halfHourFee} sat/vB</span>
				</label>
				<label className="flex items-center cursor-pointer">
				  <input
					type="radio"
					className="form-radio text-orange-500 mr-2"
					checked={selectedFee === "fast"}
					onChange={() => setSelectedFee("fast")}
				  />
				  <span>Fast: {feeRates.fastestFee} sat/vB</span>
				</label>
			  </div>
			) : (
			  <p>Loading fee rates...</p>
			)}
		  </div>
		</div>
		 <div className="fixed bottom-0 left-0 w-full grid grid-cols-2">
                <button className="btn btn-secondary" onClick={() => window.close()}>
                    Reject
                </button>

                <button className="btn btn-primary" onClick={() => signPSBTData()}>
                    Sign & Send
                </button>
            </div>
	  </div>
	);
  };
  
  export default SignPsbt;
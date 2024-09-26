/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState, useContext } from "react";
import { signPsbt } from "../bitcoin/transaction.ts";
import { AccountContext } from "../AccountContext";


const SignPsbt: FC<any> = () => {
	const [psbtBase64, setPsbtBase64] = useState<string>();
	const { currentWallet } = useContext(AccountContext);


	const signPSBTData = async () => {
		if (!psbtBase64) {
			alert('No PSBT');
			return;
		}
		const { signedPsbtHex } = await signPsbt(psbtBase64, currentWallet);

		await chrome.runtime.sendMessage({
			action: "signPsbtSuccess",
			signedPsbtBase64: signedPsbtHex,
		});

		setTimeout(() => window.close(), 100);
		// window.location.reload();
	}

	useEffect(() => {
		const url = new URL(window.location.href);

		const psbtBase64 = url.searchParams.get("psbtBase64");
		if (psbtBase64) {
			setPsbtBase64(psbtBase64);
		}
	}, []);

	var truncate = function (fullStr: string, strLen: number, separator = '...') {
		if (fullStr.length <= strLen) return fullStr;

		return fullStr.slice(0, strLen) +
			separator +
			fullStr.slice(fullStr.length - strLen);
	};

	const copyToClipboard = (text: any) => {
		navigator.clipboard.writeText(text).then(() => {
			alert('Copied to clipboard');
		}).catch(err => {
			console.error('Failed to copy: ', err);
		});
	};

	return (
		<div className="px-6">
			<div className="bg-black fixed top-0 left-0 w-full py-4 flex justify-center">
				<h1 className="text-white text-center text-base font-medium">
					Sign Transaction
				</h1>
			</div>
			<div className="bg-dark-gray p-6 rounded-md mb-3 mt-[76px]">
				<p className="text-white font-medium text-base mb-3">Transaction to sign (PSBT format)</p>

				<p className="text-2xl text-white font-medium cursor-pointer"
					onClick={() => copyToClipboard(psbtBase64 + '')}
					title="Click to copy full PSBT">
					-listing PSBT: {truncate(psbtBase64 + '', 5)}-
				</p>

			</div>
			<div className="fixed bottom-0 left-0 w-full grid grid-cols-2">
				<button className="btn btn-secondary" onClick={() => window.close()}>
					Reject
				</button>

				<button className="btn btn-secondary" onClick={() => signPSBTData()}>
					Sign & Send
				</button>
			</div>
		</div>
	);
};

export default SignPsbt;
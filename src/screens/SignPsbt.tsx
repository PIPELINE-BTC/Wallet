import { FC, useEffect, useState } from "react";
import { signPsbt, signPsbts } from "../bitcoin/transaction.ts";
import { Options, isValidOption } from "../bitcoin/utils.ts";

const SignPsbt: FC<any> = () => {
  const [psbtBase64, setPsbtBase64] = useState<string | null>(null);
  const [psbtsBase64, setPsbtsBase64] = useState<string[]>([]);
  const [options, setOptions] = useState<Options[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasError, setHasError] = useState<boolean>(false);

  const signPSBTData = async (index = -1) => {
    if (psbtBase64) {
      await signPsbt(psbtBase64, index);
    } else if (psbtsBase64.length > 0) {
      await signPsbts(psbtsBase64, options || undefined);
    } else {
      setError("No PSBT to sign");
      return;
    }

    setTimeout(() => window.close(), 500);
  };

  useEffect(() => {
    const url = new URL(window.location.href);

    const singlePsbt = url.searchParams.get("psbtBase64");
    const multiplePsbts = url.searchParams.get("psbtsBase64");
    const optionsString = url.searchParams.get("options");

    if (singlePsbt) {
      setPsbtBase64(singlePsbt);
    }

    if (multiplePsbts) {
      const psbtsArray = multiplePsbts.split(",");
      setPsbtsBase64(psbtsArray);
    }

    if (optionsString) {
      try {
        const parsedOptions = JSON.parse(decodeURIComponent(optionsString));
        if (Array.isArray(parsedOptions)) {
          const validOptions = parsedOptions.every(isValidOption);
          if (!validOptions) {
            setError("Invalid options detected, please check and try again.");
            setHasError(true);
            return;
          } else {
            setOptions(parsedOptions);
          }
        } else {
          setError("Options must be an array, please check and try again.");
          setHasError(true);
          return;
        }
      } catch (error) {
        setError("Failed to parse options. Please check the input and try again.");
        setHasError(true);
        return;
      }
    }
  }, []);

  useEffect(() => {
    if (psbtsBase64.length > 0 && options) {
      if (psbtsBase64.length !== options.length) {
        setError("The number of options does not match the number of PSBTs.");
        setHasError(true);
      } else {
        setError(null);
        setHasError(false);
      }
    }
  }, [psbtsBase64, options]);

  const truncate = (fullStr: string, strLen: number, separator = "...") => {
    if (fullStr.length <= strLen) return fullStr;

    return fullStr.slice(0, strLen) + separator + fullStr.slice(fullStr.length - strLen);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  return (
    <div className="px-6">
      <div className="bg-black fixed top-0 left-0 w-full py-4 flex justify-center">
        <h1 className="text-white text-center text-base font-medium">
          {psbtBase64 ? "Sign Transaction" : "Sign Transactions"}
        </h1>
      </div>
      <div className="bg-dark-gray p-6 rounded-md mb-3 mt-[76px]">
        {error && (
          <p className="text-red-500 font-medium text-base mb-3">
            {error}
          </p>
        )}
        <p className="text-white font-medium text-base mb-3">
          {psbtBase64
            ? "Transaction to sign (PSBT format)"
            : "Transactions to sign (PSBT format)"}
        </p>

        {psbtBase64 ? (
          <p
            className="text-2xl text-white font-medium cursor-pointer"
            onClick={() => copyToClipboard(psbtBase64)}
            title="Click to copy full PSBT"
          >
            Transaction: {truncate(psbtBase64, 5)}
          </p>
        ) : (
          psbtsBase64.map((psbt, index) => (
            <div key={index} className="mb-4">
              <p
                className="text-2xl text-white font-medium cursor-pointer"
                onClick={() => copyToClipboard(psbt)}
                title="Click to copy full PSBT"
              >
                Transaction {index + 1}: {truncate(psbt, 5)}
              </p>
            </div>
          ))
        )}
      </div>
      <div className="fixed bottom-0 left-0 w-full grid grid-cols-2">
        <button className="btn btn-secondary" onClick={() => window.close()}>
          Reject
        </button>

        <button
          className={`btn btn-primary ${hasError ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => !hasError && signPSBTData()}
          disabled={hasError}
        >
          Sign & Send
        </button>
      </div>
    </div>
  );
};

export default SignPsbt;
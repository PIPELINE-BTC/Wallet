/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useContext, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import NumberInput from "../common/NumberInput";
import SelectInput from "../common/SelectInput";
import UserBook from "../assets/img/user-book.svg?react";
import { AccountContext } from "../AccountContext";
import { getTokens, getBalance } from "../bitcoin/wallet";
import { useLocation, useNavigate } from "react-router-dom";
import placeholder from "../assets/img/nft-placehoder.png";
import { getAddress } from "../utils";
import Symbol from "../assets/img/ankr.svg?react";
import TokenIcon from "../common/TokenIcon";
import Bitcoin from "../assets/img/bitcoin.svg?react";

import * as bitcoin from "bitcoinjs-lib";

import {
  decodePB,
  hexToBase64Image,
  hexToString,
  loadImageFromOrd,
} from "../bitcoin/pipeArt";
import { estimateFee } from "../bitcoin/wallet";
import { sendSats, sendTransferTransaction } from "../bitcoin/transaction";

import PIPEBLOCK_ORIGIN from "../assets/img/pipeblock_origin.png";
import PIPEBLOCK_CLASSIC from "../assets/img/pipeblock_classic.png";
import useDebounce from "../hooks/useDebounce";

import GetIconLogo from "../common/GetIconLogo";

import { convertBtcToUsd } from "../utils";
import { validateBitcoinAddress } from "../bitcoin/utils";

interface ISendForm {
  recipient: string;
  amount: number;
  psbt: string;
  queryData: any;
  fee: any;
  // rbf: boolean
}

const styles = {
  control: (provided: any) => ({
    ...provided,
    border: "none",
    height: "50px",
    background: "rgb(37, 35, 35);",
    borderRadius: "6px",
    ":hover": {
      cursor: "pointer",
    },
  }),
  valueContainer: () => ({
    padding: "12px",
    position: "static",
    display: "flex",
    "align-items": "center",
  }),
  indicatorsContainer: (provided: any) => ({
    ...provided,
    position: "absolute",
    right: "12px",
    top: "50%",
    bottom: "50%",
  }),
  dropdownIndicator: (provided: any) => ({
    ...provided,
    "z-index": "999",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  menu: (provided: any) => ({
    ...provided,
    boxShadow: "none",
    background: "none",
  }),
  menuList: (provided: any) => ({
    ...provided,
    padding: "12px !important",
    borderRadius: "6px",
    color: "#FFFFFF",
    maxHeight: "180px",
    background: "rgb(37, 35, 35);",
    marginBottom: "1.5rem",
  }),
};

const FEES_LABELS: any = {
  fastestFee: "Fast",
  halfHourFee: "Normal",
  // hourFee: "Hour",
  // economyFee: "Economy",
  // minimumFee: "Minimum",
  customFee: "Custom",
};
const customComponents = {
  Option: ({ innerProps, label, value }: any) => (
    <div
      {...innerProps}
      className="p-2 bg-dark-gray rounded-md flex items-center cursor-pointer mb-2 last:mb-0"
    >
      {label === "BTC" ? <Bitcoin /> : GetIconLogo(value?.ticker, value?.id)}
      <div className="flex flex-col justify-between ml-3">
        <p className="text-white font-medium text-sm my-auto">{label?.toUpperCase()}</p>
        <p className="text-xs text-white font-medium">
          <span className="text-gray">Balance:</span> {value?.amt}
        </p>
      </div>
    </div>
  ),
  SingleValue: ({ data }: any) => {
    const { ticker, id, amt } = data.value || {};
    const displayText = ticker ?
      (id === "0" || (ticker === "BTC" && id === undefined) ? ticker.toUpperCase() : `${ticker.toUpperCase()}:${id}`) :
      "";

    return (
      <div className="absolute w-full h-[50px] top-0 left-0">
        <div className="p-2 bg-dark-gray rounded-md flex items-center cursor-pointer">
          {ticker === "BTC" ? (
            <Bitcoin />
          ) : (
            GetIconLogo(ticker, id)
          )}
          <div className="flex flex-col justify-between ml-3">
            <p className="text-white font-medium text-sm my-auto">
              {displayText}
            </p>
            <p className="text-xs text-white font-medium">
              <span className="text-gray">Balance:</span> {amt ?? ""}
            </p>
          </div>
        </div>
      </div>
    );
  },
};

const customNftComponents = {
  Option: ({ innerProps, label, value }: any) => (
    <div
      {...innerProps}
      className="bg-dark-gray p-2 mb-2 last:mb-0 cursor-pointer rounded-md flex items-center hover:bg-black"
    >
      {value.isImage ? (
        <img
          src={value?.img || placeholder}
          alt="NFT"
          className="rounded-sm mr-2"
          width={37}
          height={37}
        />
      ) : (
        <TokenIcon symbol={value.symbol} />
      )}
      <div
        className={`flex flex-col justify-between ${!value?.isImage ? "ml-3" : ""
          }`}
      >
        {/* <p className="text-white text-base font-medium">{label}</p> */}
        <p className="text-white text-base font-medium">
          {value.id !== "0" && !value.isPBO && !value.isPB
            ? `${value.ticker}:${value.id}`.toUpperCase()
            : label.toUpperCase()}
        </p>
        <div className="flex items-center mt-1">
          {value.isPBO || value.isPB ? (
            <Symbol width={10} height={10} />
          ) : (
            "Amount: "
          )}
          <p className="text-white text-sm ml-1">{value?.amt}</p>
        </div>
      </div>
    </div>
  ),
  SingleValue: ({ data }: any) => {
    return (
      <div className="bg-dark-gray absolute w-full h-[60px] top-0 left-0 rounded-md">
        <div className="flex items-center w-full h-full pl-3">
          {data.value.isImage ? (
            <img
              src={data.value?.img || placeholder}
              alt="NFT"
              className="rounded-sm mr-2"
              width={37}
              height={37}
            />
          ) : (
            <TokenIcon symbol={data.value.symbol} />
          )}
          <div
            className={`flex flex-col justify-between ${!data.value.isImage ? "ml-3" : ""
              }`}
          >
            <p className="text-white text-base font-medium">
              {data.value.isPB || data.value.isPBO
                ? `PIPEBLOCK ${decodePB(
                  data.value?.ticker || data.value?.tickerID.split(":")[0]
                )}`
                : data.value.id !== "0"
                  ? `${data.value.ticker}:${data.value.id}`.toUpperCase()
                  : data.label.toUpperCase()}
            </p>
            <div className="flex">
              <div className="flex items-center mt-1">
                {data.value.isPBO || data.value.isPB ? (
                  <Symbol width={10} height={10} />
                ) : (
                  <span className="text-gray text-sm">Amount: </span>
                  // "Amount: "
                )}
                {/* </span> */}
                <p className="text-gray text-sm ml-1">{data.value?.amt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

const feeSelectComponents = {
  Option: ({ innerProps, label, value }: any) => (
    <div
      {...innerProps}
      className="bg-dark-gray p-2 mb-2 last:mb-0 cursor-pointer rounded-md flex items-center hover:bg-black"
    >
      <div className="flex flex-col">
        <p className="text-white text-base font-medium">{label}</p>
        <div className="flex items-center mt-1">
          <p className="text-white text-xs mr-1">{`${value.amount} sat/vB`}</p>
          {/* <p className="text-gray text-xs">{`About ${value.time} hours`}</p> */}
        </div>
      </div>
    </div>
  ),
  SingleValue: ({ data }: any) => (
    <div className="bg-dark-gray absolute w-full h-[53px] top-0 left-0 rounded-md">
      <div className="flex items-center w-full h-full pl-3">
        <div className="flex flex-col">
          <p className="text-white text-sm font-medium">{data?.label}</p>
          <div className="flex items-center mr-1">
            <p className="text-white text-xs ml-1">
              {`${data?.value.amount} sat/vB`}
            </p>
            {/* <p className="text-gray text-xs">
              {`About ${data?.value.time} hours`}
            </p> */}
          </div>
        </div>
      </div>
    </div>
  ),
};

const Send: FC<any> = ({
  setCurrentStep,
  setData,
  queryData,
  customFee,
  setCustomFee,
}) => {
  const location = useLocation();
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<ISendForm>();
  const [activeTab, setActiveTab] = useState(location?.state?.tab || "tokens");
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<any>("");

  const [balance, setBalance] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [fees, setFees] = useState<any>([]);
  const [btc, setBtc] = useState<any>({});
  const [total, setTotal] = useState<any>(0);
  const [max, setMax] = useState<any>(0);
  const [calculatedFees, setCalculatedFee] = useState(0);
  const [calculatedFeesInUSD, setcalculatedFeesInUSD] = useState(0);
  const [btcPriceInUSD, setBtcPriceInUSD] = useState<number | null>(null);
  const [calculatedUsdAmount, setCalculatedUsdAmount] = useState<number | null>(null);

  const {
    tokens,
    nfts,
    setAppState,
    currentWallet,
    currentAccount,
    addressBook,
    network,
  } = useContext(AccountContext);
  const navigate = useNavigate();
  const recipient = watch("recipient");
  const selectedFee = watch("fee");
  const amount = watch("amount");

  const debouncedValue = useDebounce(amount, 500);

  const getFeesList = async () => {
    const data = await estimateFee();
    const custom = ["customFee", 0];
    const options = [...Object.entries(data!), custom].map(
      ([name, amount]: any) => ({
        label: FEES_LABELS?.[name] || "",
        value: {
          name,
          amount,
          time: 1,
        },
      })
    );
    setFees(options);

    const normalFee = options.find(option => option.value.name === 'halfHourFee');
    if (normalFee) {
      setValue("fee", normalFee.value);
    } else {
      console.error("Normal fee option not found");
    }
  };

  useEffect(() => {
    getFeesList();
  }, []);

  useEffect(() => {
    const fetchPrice = async () => {
      const price = await convertBtcToUsd(1, { priceOnly: true });
      if (price) {
        setBtcPriceInUSD(price);
      }
    };
    fetchPrice();
  }, []);

  useEffect(() => {
    if (selectedToken?.ticker === "BTC" && btcPriceInUSD !== null) {
      const numericAmount = amount || 0;
      const converted = numericAmount * btcPriceInUSD;
      setCalculatedUsdAmount(converted);
    } else {
      setCalculatedUsdAmount(null);
    }
  }, [amount, selectedToken, btcPriceInUSD]);

  useEffect(() => {
    if (queryData) {
      const { recipient = "", amount = 0, psbt = "" } = queryData;
      setValue("recipient", recipient);
      setValue("amount", amount);
      setValue("psbt", psbt);
    }
  }, [queryData, setValue]);

  useEffect(() => {
    setValue("amount", 0);
  }, [activeTab, setValue, selectedToken]);

  useEffect(() => {
    const token = getCurrentToken(activeTab);
    if (token) {
      setBalance(token.value.amt);
    } else {
      setBalance(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const getBtcBalance = async () => {
    const balance = await getBalance(currentWallet?.address?.[network]);
    setBtc({
      value: {
        ticker: "BTC",
        amt: balance.onChainBalance,
      },
      label: "BTC",
    });
    if (!location?.state?.token) {
      setSelectedToken({
        ticker: "BTC",
        amt: balance.onChainBalance,
      });
      setBalance(balance.onChainBalance);
      setMax(balance.onChainBalance);
    }
  };

  useEffect(() => {
    getBtcBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (location?.state?.token) {
      setData((prev: any) => ({ ...prev, token: location?.state?.token }));
      setBalance(location?.state?.token.amt);
      setMax(location?.state?.token.amt);
    }
  }, [location?.state?.token, setData]);

  const onSubmit = (data: any) => {
    if (total == 0 || total > balance) {
      return;
    }
    const dust = 0.00000400;

    if (selectedToken?.ticker === "BTC" && selectedToken?.id === undefined && data.amount < dust) {
      setErrorMessage("Amount sent should be > 0.00000400 BTC");
      return;
    }

    if (selectedToken) {
      setData({ ...data, token: selectedToken, calculatedFee: calculatedFees });
    } else {
      setData({ ...data, calculatedFee: calculatedFees });
    }
    setCurrentStep((prev: number) => prev + 1);
  };

  const getTokensOptions = (type: "nfts" | "tokens" | "all" = "all") => {
    const options = tokens?.map((t: any) => {
      let label;
      if (t.isPB || t.isPBO) {
        label = `PIPEBLOCK ${decodePB(t?.ticker)}`;
      } else if (t?.id) {
        label = t?.id !== "0" ? `${t?.ticker}:${t?.id}` : t?.ticker;
      } else {
        label =
          t?.tickerID && t?.tickerID.split(":")[1] !== "0" ? t?.tickerID : t?.tickerID.split(":")[0];
      }
      return {
        value: t,
        label: label.toUpperCase(),
      };
    });

    if (type === "nfts")
      return options
        ?.filter(
          (t: any) => t.value.collectionAddr || t.value?.isPB || t.value?.isPBO
        )
        ?.map((t: any) => {
          let isImage;
          const nft = nfts.find((n: any) => n.pid === t.value.pid);
          let base64Url;
          if (nft?.isPBO === true) {
            base64Url = PIPEBLOCK_ORIGIN;
            isImage = true;
          } else if (nft?.isPB === true) {
            base64Url = PIPEBLOCK_CLASSIC;
            isImage = true;
          } else if (nft.mimeType?.includes("image")) {
            const base64Image = hexToBase64Image(nft.data);
            base64Url = "data:" + nft.mimeType + ";base64," + base64Image;

            isImage = true;
          } else if (nft.mimeType?.includes("text")) {
            const txtData = hexToString(nft.data);
            if (nft.dataType == "R") {
              if (txtData.startsWith("https://ordinals.com/content/")) {
                loadImageFromOrd(txtData).then((result) => {
                  base64Url = result;
                  isImage = true;
                });
              } else if (txtData.startsWith("ipfs://")) {
                const cid = txtData?.replace("ipfs://", "");
                const ipfsGatewayUrl = `https://ipfs.io/ipfs/${cid}`;
                loadImageFromOrd(ipfsGatewayUrl).then((result) => {
                  base64Url = result;
                  isImage = true;
                });
              } else if (txtData.startsWith("ar://")) {
                const transactionId = txtData?.replace("ar://", "");
                const arweaveGatewayUrl = `https://arweave.net/${transactionId}`;
                loadImageFromOrd(arweaveGatewayUrl).then((result) => {
                  base64Url = result;
                  isImage = true;
                });
              } else if (txtData.startsWith("https://arweave.net/")) {
                loadImageFromOrd(txtData).then((result) => {
                  base64Url = result;
                  isImage = true;
                });
              } else {
                base64Url = '"' + txtData + '"';
                isImage = false;
              }
            }
          } else {
            base64Url = '"' + hexToString(nft.data) + '"';
            isImage = false;
          }
          return {
            ...t,
            value: {
              ...t.value,
              img: base64Url,
              isImage,
              symbol: (nft.ticker || nft.tickerID).charAt(0),
            },
          };
        });
    if (type === "tokens")
      return (
        options?.filter(
          (t: any) =>
            t.value.collectionAddr === null &&
            t.value?.isPB === false &&
            t.value?.isPBO === false
        ) || []
      );
    return options;
  };

  const getCurrentToken = (type: "nfts" | "tokens") => {
    const option = getTokensOptions(type)?.find(
      (o: any) => o.value.pid === selectedToken?.pid
    );
    if (option) {
      return { value: option.value, label: option.label, img: option.imageUrl };
    }
  };

  const getWalletTokens = async () => {
    const t = await getTokens(currentWallet.address?.[network]);
    const tokens = t?.result?.filter((el: any) => el.amt > 0);
    const nfts = t?.nfts?.filter((el: any) => el.amt > 0);
    setAppState((prev: any) => ({
      ...prev,
      tokens: tokens,
      nfts: nfts,
    }));
  };

  useEffect(() => {
    getWalletTokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (recipient) {
      const results = addressBook.filter(
        (contact: any) =>
          (contact.address.includes(recipient) &&
            contact.address !== recipient) ||
          (contact.name.includes(recipient) && contact.name !== recipient)
      );
      setSuggestions(results);
    }
  }, [recipient, addressBook]);

  useEffect(() => {
    if (location?.state?.token && tokens?.length) {
      const selected = getTokensOptions(activeTab)?.find(
        (t: any) => t.value.pid === location?.state?.token?.pid
      );
      setSelectedToken(selected?.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, tokens, activeTab]);

  const calcTotal = (fee: any, amount: number, token: any) => {
    const amountSats = amount * 10 ** 8;

    const totalBtc = amount === balance ? balance : (+amountSats + fee) * 10 ** -8;

    if (token?.ticker === "BTC" && token?.id === undefined)
      return setTotal(Number(totalBtc > 0 ? totalBtc?.toFixed(8) : 0));
    setTotal(amount);
  };


  const calculateFee = async (token: any, i: number) => {
    // let mnemonic = currentAccount.mnemonic;
    // if (!currentAccount.mnemonic.length) {
    // const mnemonic = mnemonicFromWIF(currentAccount.wif);
    // }
    // const mnemonic = currentWallet.wif[network]
    const mnemonic = currentWallet.wif.livenet;
    let _debouncedValue = debouncedValue;

    if (typeof _debouncedValue === 'string') {
      _debouncedValue = parseFloat(_debouncedValue);
    }

    if (token?.ticker !== "BTC") {
      const f = await sendTransferTransaction(
        // currentAccount.mnemonic,
        mnemonic,
        // currentAccount.rootkey,
        currentWallet?.address[network],
        selectedToken?.ticker,
        selectedToken?.id,
        debouncedValue,
        i,
        customFee || selectedFee?.amount,
        true,
        false,
        token.amt === _debouncedValue ? true : false
      );
      return f;
    } else {
      const f = await sendSats(
        // currentAccount.mnemonic,
        mnemonic,
        // currentAccount.rootkey,
        currentWallet?.address[network],
        debouncedValue,
        i,
        customFee || selectedFee?.amount,
        true,
        false,
        token.amt === _debouncedValue ? true : false
      );
      return f;
    }
  };

  useEffect(() => {
    if (
      (selectedFee?.amount && debouncedValue && selectedToken) ||
      (customFee && debouncedValue && selectedToken)
    ) {
      for (let i = 0; i < currentAccount.wallets.length; i++) {
        if (
          currentAccount.wallets[i].address.testnet ===
          currentWallet.address.testnet
        ) {
          if (debouncedValue > 0) {
            calculateFee(selectedToken, i).then((fee) => {
              setErrorMessage("");
              calcTotal(fee?.calculatedFee, debouncedValue, selectedToken);

              const formattedFee = parseFloat((fee?.calculatedFee * 10 ** -8).toFixed(8));
              setCalculatedFee(formattedFee);
            })
              .catch((e) => {
                e.message ? setErrorMessage(e.message) : setErrorMessage("Error");
                setTotal(0);
                setCalculatedFee(0);
              });
          }
          else {
            setErrorMessage("");
            setTotal(0);
            setCalculatedFee(0);
          }

        }
      }
    } else {
      setTotal(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFee, selectedToken, debouncedValue, customFee]);

  useEffect(() => {
    if (calculatedFees > 0) {
      convertBtcToUsd(calculatedFees)
        .then((usdValue) => {
          if (usdValue !== undefined) {
            setcalculatedFeesInUSD(usdValue);
          } else {
          }
        })
        ;
    } else {
      setcalculatedFeesInUSD(0);
    }
  }, [calculatedFees]);

  const formValidation = {
    recipient: {
      required: "This field is required",
      validate: (value: string) =>
        validateBitcoinAddress(value, network === "testnet" ? bitcoin.networks.testnet : bitcoin.networks.bitcoin) ||
        "Invalid Bitcoin address",
    }
  };
  
  return (
    <>
      <div className="p-1 w-full grid grid-cols-2 gap-1 bg-modal-dark rounded-md mb-3 overflow-auto">
        <button
          className={`${activeTab === "tokens" ? "bg-black" : ""
            } text-base py-2.5 px-3 rounded-md text-white`}
          onClick={() => {
            setActiveTab("tokens");
            getBtcBalance();
          }}
        >
          Tokens
        </button>
        <button
          className={`${activeTab === "nfts" ? "bg-black" : ""
            } text-base py-2.5 px-3 rounded-md text-white`}
          onClick={() => {
            setActiveTab("nfts");
            setSelectedToken(null);
          }}
        >
          NFT
        </button>
      </div>
      {activeTab === "tokens" ? (
        <div className="mb-3">
          <label htmlFor="Token">Select Token</label>
          <SelectInput
            id="Token"
            styles={styles}
            options={[btc, ...getTokensOptions("tokens")]}
            value={getCurrentToken("tokens") || btc}
            components={customComponents}
            onChange={({ value }: any) => {
              setBalance(value.amt);
              setSelectedToken(value);
              setMax(value.amt);
              setCalculatedFee(0)
            }}
          />
        </div>
      ) : (
        <div className="mb-3">
          <label htmlFor="NFT">Select NFT</label>
          <SelectInput
            id="NFT"
            styles={{
              ...styles,
              control: (provided: any) => ({
                ...provided,
                border: "none",
                height: "60px",
                background: "rgb(37, 35, 35);",
                borderRadius: "6px",
                ":hover": {
                  cursor: "pointer",
                },
              }),
            }}
            components={customNftComponents}
            options={getTokensOptions("nfts")}
            value={getCurrentToken("nfts") || ""}
            onChange={({ value }: any) => {
              setBalance(value.amt);
              setSelectedToken(value);
              setMax(value.amt);
              setCalculatedFee(0)
            }}
          />
        </div>
      )}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="h-full pb-[48px]"
        autoComplete="off"
      >
        <div className="mb-3 w-full">
          <label htmlFor="amount">Receiver Address</label>
          <div className="relative">
            <input
              id="recipient"
              {...register('recipient', formValidation.recipient)}
              style={{ paddingRight: "42px" }}
            />
            <button
              className="h-fit absolute inset-y-1/2 translate-y-[-50%] right-5"
              onClick={() => navigate("/contacts")}
            >
              <UserBook />
            </button>
            {getValues().recipient && suggestions.length ? (
              <div className="w-full absolute top-[120%] bg-dark-gray border border-gray p-3 rounded-md flex flex-col gap-1">
                {suggestions.map((res: any) => (
                  <div
                    key={res.id}
                    className="flex justify-between bg-modal-dark rounded-md hover:bg-black p-3 cursor-pointer"
                    onClick={() => setValue("recipient", res.address)}
                  >
                    <p className="text-base text-white">
                      {getAddress(res.address)}
                    </p>
                    <p className="ml-3 w-fit text-ellipsis overflow-hidden text-white text-base">
                      {res.name}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          {errors.recipient ? (
            <p className="validation-error">{errors.recipient.message}</p>
          ) : null}
        </div>
        <div className="mb-3 w-full">
          <div className="flex justify-between w-full">
            <label htmlFor="amount">Amount to Send</label>
            <p
              className="text-orange font-sm cursor-pointer"
              onClick={() => {
                const maxVal = activeTab === "tokens" ? +max : +selectedToken?.amt || 0;
                setValue("amount", maxVal);
              }}
            >
              Max: <span className="text-white">
                {activeTab === "tokens" ? max : selectedToken?.amt || 0}
              </span>
            </p>
          </div>
          <div className="relative">
            <Controller
              name="amount"
              control={control}
              rules={{
                required: "This field is required",
                max: activeTab === "tokens" ? +max : +selectedToken?.amt || 0,
                pattern: {
                  value: new RegExp(`^\\d*(\\.\\d{0,${selectedToken?.ticker === "BTC" && selectedToken?.id === undefined ? 8 : (selectedToken?.deci || 2)}})?$`),
                  message: `Up to ${selectedToken?.ticker === "BTC" && selectedToken?.id === undefined ? 8 : selectedToken?.deci} decimal places allowed`
                }
              }}
              render={({ field }) => (
                <div className="relative">
                  <input
                    type="text"
                    {...field}
                    value={field.value}
                    onChange={(e) => {
                      let value = e.target.value;
                      const _regEx = new RegExp(`^\\d*(\\.\\d{0,${selectedToken?.ticker === "BTC" && selectedToken?.id === undefined ? 8 : (selectedToken?.deci || 2)}})?$`);
                      if (_regEx.test(value)) {
                        const numericValue = parseFloat(value);
                        const maxValue = activeTab === "tokens" ? +max : +selectedToken?.amt || 0;

                        if (numericValue > maxValue) {
                          value = maxValue.toString();
                        }
                        field.onChange(value);
                      }
                    }}
                    min={0}
                    max={activeTab === "tokens" ? +max : +selectedToken?.amt || 0}
                    className="input pr-16"
                  />
                  {selectedToken?.ticker === "BTC" && calculatedUsdAmount !== null && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray text-sm">
                      ≈ ${calculatedUsdAmount.toFixed(2)}
                    </span>
                  )}
                </div>
              )}
            />
          </div>
          {errors.amount && (
            <p className="validation-error">{errors.amount.message}</p>
          )}
        </div>
        <div className="mb-3 w-full">
          <label htmlFor="fee">Fee</label>
          <SelectInput
            id="fee"
            styles={{
              ...styles,
              control: (provided: any) => ({
                ...provided,
                border: "none",
                height: "53px",
                background: "rgb(37, 35, 35);",
                borderRadius: "6px",
                ":hover": {
                  cursor: "pointer",
                },
              }),
            }}
            components={feeSelectComponents}
            options={fees}
            value={fees.find(
              (opt: any) => opt.value.name === selectedFee?.name
            )}
            onChange={({ value }: any) => { return setValue("fee", value) }}
          />
        </div>
        {selectedFee?.name === "customFee" ? (
          <div className="mb-3 w-full">
            <label htmlFor="feeCustom">Custom Fee</label>
            <NumberInput
              id="feeCustom"
              value={customFee}
              min={fees?.find((fee: any) => fee.label === 'Minimum')?.value?.amount}
              max={fees?.find((fee: any) => fee.label === 'Fastest')?.value?.amount}
              onChange={(value: any) => {
                setCustomFee(value);
                setValue("fee", {
                  ...selectedFee,
                  value: {
                    ...selectedFee.value,
                    amount: value
                  }
                });
              }}
            />
          </div>
        ) : null}
        {/* <div className="flex items-center mb-3">
          <input
            {...register('rbf', { required: true })}
            type="checkbox"
            id="fee"
            checked={rbf}
          />
          <label
            htmlFor="fee"
            className={`ml-3 text-base cursor-pointer mb-0 ${errors.rbf ? 'text-red-500' : 'text-white'}`}
          >
            RBF
          </label>
        </div> */}
        <p className="text-orange text-sm mb-[52px]">
          {errorMessage ? (
            errorMessage
          ) : (
            <>
              Fee: <span className="text-white font-medium">{`${calculatedFees.toString()} BTC ($${calculatedFeesInUSD.toFixed(2)})`}</span>
            </>
          )}
        </p>
        <div className="fixed bottom-0 left-0 w-full">
          <button
            className={`btn btn-primary w-full text-black`}
            type="submit"
            disabled={total == 0 || total < 0 || errorMessage !== "" || total > balance}
          >
            Next
          </button>
        </div>
      </form>
    </>
  );
};

export default Send;
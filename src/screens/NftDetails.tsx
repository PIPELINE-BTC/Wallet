/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import HeaderWithNav from "../common/HeaderWithNav";
import Symbol from "../assets/img/ankr.svg?react";
import Exchange from "../assets/img/exchange-2.svg?react";
import PIPEBLOCK_ORIGIN from "../assets/img/pipeblock_origin.png";
import PIPEBLOCK_CLASSIC from "../assets/img/pipeblock_classic.png";
import { AccountContext } from "../AccountContext";

import {
  decodePB,
  hexToBase64Image,
  hexToString,
  loadImageFromOrd,
  resizeImageIfNecessary
} from "../bitcoin/pipeArt";
import Arrow from "assets/img/arrow.svg?react";
import logo from "assets/img/logo-mini.svg";
import User from "assets/img/user.svg?react";

const NftDetails = () => {
  const { nfts, currentWallet } = useContext(AccountContext);
  const [token, setToken] = useState<any>(null);
  const [image, setImage] = useState("");
  const [content, setContent] = useState("");
  const [PBID, setPBID] = useState(0);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const currToken = nfts.find(
      (t: any) => t.pid.toString() === id?.toString()
    );
    if (currToken) setToken(currToken);
  }, [nfts, id]);

  useEffect(() => {
    if (!token) return;
    if (token?.isPBO === true) {
      setImage(PIPEBLOCK_ORIGIN);
      const result = decodePB(token?.tickerID.split(":")[0]);
      setPBID(result!);
    } else if (token?.isPB === true) {
      setImage(PIPEBLOCK_CLASSIC);
      const result = decodePB(token?.tickerID.split(":")[0]);
      setPBID(result!);
    } else if (token.mimeType?.includes("image")) {
      let image = PIPEBLOCK_CLASSIC;

      const base64Image = hexToBase64Image(token.data);
      const base64Url = "data:" + token.mimeType + ";base64," + base64Image;
      resizeImageIfNecessary(base64Url, 600).then((data) => {
        image = data;
        setImage(image);
      });
    } else if (token.mimeType?.includes("text")) {
      const txtData = hexToString(token.data);
      if (token.dataType == "R" || token.dataType == "I") {
        if (txtData.startsWith("https://ordinals.com/content/")) {
          loadImageFromOrd(txtData).then((result) => {
            setImage(result);
          });
        } else if (txtData.startsWith("ipfs://")) {
          const cid = txtData?.replace("ipfs://", "");
          const ipfsGatewayUrl = `https://ipfs.io/ipfs/${cid}`;
          loadImageFromOrd(ipfsGatewayUrl).then((result) => {
            setImage(result);
          });
        } else if (txtData.startsWith("ar://")) {
          const transactionId = txtData?.replace("ar://", "");
          const arweaveGatewayUrl = `https://arweave.net/${transactionId}`;
          loadImageFromOrd(arweaveGatewayUrl).then((result) => {
            setImage(result);
          });
        } else if (txtData.startsWith("https://arweave.net/")) {
          loadImageFromOrd(txtData).then((result) => {
            setImage(result);
          });
        } else if (txtData.startsWith("https://")) {
          loadImageFromOrd(txtData).then((result) => {
            setImage(result);
          }).catch((_) => setContent('"' + txtData + '"'));
        }
        else {
          setContent('"' + txtData + '"');
        }
      }
      else {
        setContent('"' + txtData + '"');
      }
    } else {
      setContent('"' + hexToString(token.data) + '"');
    }
  }, [token]);

  return (
    <>
      <div className="block md:hidden">
        <HeaderWithNav />
      </div>
      <div className="hidden md:block p-6 bg-modal-dark">
        <div className="grid grid-cols-[114px_1fr_114px]">
          <p className="text-white text-base my-auto">{currentWallet.name}</p>
          <div className="flex justify-center items-center">
            <img
              src={logo}
              alt="PIPELINE"
              className="w-[21.67px] h-5 min-[1200px]:w-[45px] min-[1200px]:h-auto"
            />
          </div>
          <button
            className="flex p-2.5 rounded-md bg-gray-300 text-white text-sm truncate text-nowrap"
            onClick={() => navigate("/wallets")}
          >
            <User className="mr-2.5" />
            Wallets
          </button>
        </div>
      </div>
      <div className="p-6 flex justify-center overflow-auto h-fit">
        <div className="p-5 flex flex-col rounded-md bg-modal-dark w-full h-fit gap-2 md:grid md:grid-cols-2 md:p-6">
          <div className="relative mb-3.5 w-full h-fit md:m-0">
            <button
              onClick={() => navigate(-1)}
              className="hidden md:block absolute p-5"
            >
              <span className="relative block w-[37px] h-[30px]">
                <Arrow
                  width="100%"
                  height="100%"
                  style={{ position: "absolute" }}
                />
              </span>
            </button>
            {image ? (
              <img
                src={image}
                alt="NFT"
                className="rounded-md w-full h-auto md:max-w-[600px]"
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <p className="text-gray text-xl">{content}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col h-full">
            <div className="flex flex-col h-full w-full justify-between">
              <div className="flex flex-col">
                {token?.isPB || token?.isPBO ? (
                  <p className="text-white text-lg uppercase mb-2 md:text-5xl md:mb-7 text-ellipsis w-[85%] md:pt-6">
                    {`PIPEBLOCK ${PBID}`}
                  </p>
                ) : null}
                <p className="text-white text-lg uppercase mb-2 md:text-5xl md:mb-7 text-ellipsis w-[85%] md:pt-6">
                  {token?.tickerID.split(":")[1] !== "0"
                    ? token?.tickerID
                    : token?.tickerID.split(":")[0]}
                </p>
                <p className="text-gray text-lg mb-2 md:text-3xl md:mb-7">
                  PID: {token?.pid} {token?.isPBO && "O"}
                </p>
                <div className="flex items-center">
                  {(token?.isPBO || token?.isPB) && token?.totalAmount !== 0 && (
                    <div className="mr-1 w-[21px]">
                      <Symbol className="mr-1" />
                    </div>
                  )}
                  {token?.totalAmount !== 0 && (
                    <p className="text-xl text-white font-medium">
                      {!token?.isPBO && !token?.isPB
                        ? token?.amt !== 1 ? `Amount: ${token?.amt ? token?.amt : token?.totalAmount}` : ""
                        : token?.amt ? token?.amt : token?.totalAmount
                      }
                    </p>
                  )}
                </div>
              </div>
              <button
                className="hidden md:flex btn btn-primary w-full text-black justify-center items-center rounded-md"
                onClick={() =>
                  navigate("/send", { state: { tab: "nfts", token } })
                }
              >
                <Exchange className="mr-1" />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="block md:hidden absolute bottom-0 left-0 w-full">
        <button
          className="btn btn-primary w-full text-black flex justify-center items-center"
          onClick={() => navigate("/send", { state: { tab: "nfts", token } })}
        >
          <Exchange className="mr-1" />
          Send
        </button>
      </div>
    </>
  );
};

export default NftDetails;

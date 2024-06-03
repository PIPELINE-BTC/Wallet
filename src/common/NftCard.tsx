/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Exchange from "../assets/img/exchange.svg?react";
import Symbol from "../assets/img/ankr.svg?react";
import PIPEBLOCK_ORIGIN from "../assets/img/pipeblock_origin.png";
import PIPEBLOCK_CLASSIC from "../assets/img/pipeblock_classic.png";
import {
  decodePB,
  hexToBase64Image,
  hexToString,
  loadImageFromOrd,
  resizeImageIfNecessary
} from "../bitcoin/pipeArt";
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
const NftCard = ({ token = {} }: any) => {
  const navigate = useNavigate();

  const [image, setImage] = useState("");
  const [content, setContent] = useState("");
  const [PBID, setPBID] = useState(0);

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
      resizeImageIfNecessary(base64Url, 300).then((data) => {
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
        }
        else if (txtData.startsWith("https://")) {
          loadImageFromOrd(txtData).then((result) => {
            setImage(result);
          }).catch((_) => setContent('"' + txtData + '"'));
        }
        else {
          setContent('"' + txtData + '"');
        }
      }
      else {
        setContent('"' + hexToString(token.data) + '"');
      }
    } else {
      setContent('"' + hexToString(token.data) + '"');
    }
  }, [token]);

  return (
    <div
      className="p-5 flex flex-col justify-between rounded-md bg-modal-dark cursor-pointer min-h-[430px] md:min-h-fit md:w-full"
      onClick={() => navigate(`/nft/${token.pid}`)}
    >
      <div className="flex-grow flex flex-col justify-between">
        <p className="text-white mb-3 text-2xl uppercase">
          {token?.isPB || token?.isPBO
            ? `PIPEBLOCK ${PBID}`
            : token?.tickerID.split(":")[1] !== "0"
              ? token?.tickerID
              : token?.tickerID.split(":")[0]}
        </p>
        {image ? (
          <img
            src={image}
            alt="NFT"
            className="rounded-md w-full h-auto md:max-w-[600px]"
          />
        ) : (
          <div className="flex flex-grow items-center justify-center">
            <p className="text-gray text-xl">{content}</p>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <p className="hidden min-[300px]:block text-white font-medium text-lg pb-2">
            {token?.tickerID.split(":")[1] !== "0"
              ? token?.tickerID
              : token?.tickerID.split(":")[0]}
          </p>
          <p className="text-gray text-xl">
            PID: {token.pid} {token?.isPBO && "O"}
          </p>
          <div className="flex items-center">
            {(token?.isPBO || token?.isPB) && token?.totalAmount !== 0 && (
              <div className="mr-1 w-[21px]">
                <Symbol className="mr-1" />
              </div>
            )}
            {token?.totalAmount !== 0 && (
              <p className="text-xl text-white font-medium flex-grow">
                {!token?.isPBO && !token?.isPB
                  ? token?.amt !== 1 ? `Amount: ${token?.amt ? token?.amt : token?.totalAmount}` : ""
                  : token?.amt ? token?.amt : token?.totalAmount
                }
              </p>
            )}
          </div>
        </div>
        <button
          onClick={(e: any) => {
            e.stopPropagation();
            navigate("/send", { state: { tab: "nfts", token } });
          }}
        >
          <Exchange width={30} />
        </button>
      </div>
    </div>
  );
};

export default NftCard;

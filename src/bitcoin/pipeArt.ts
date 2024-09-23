interface PipeArtItem {
  tickerID: string;
  edition: number;
  pid?: number;
  pb: number;
  qty?: number;
  totalAmount: number;
  dataType: string;
  mimeType?: string;
  data?: string;
  traits?: Object;
  isPB: boolean;
  isPBO?: boolean;
}

interface OpTable {
  [key: string]: number;
}

const op_table: OpTable = {
  OP_0: 0,
  OP_PUSHNUM_1: 1,
  OP_PUSHNUM_2: 2,
  OP_PUSHNUM_3: 3,
  OP_PUSHNUM_4: 4,
  OP_PUSHNUM_5: 5,
  OP_PUSHNUM_6: 6,
  OP_PUSHNUM_7: 7,
  OP_PUSHNUM_8: 8,
  OP_PUSHNUM_9: 9,
  OP_PUSHNUM_10: 10,
  OP_PUSHNUM_11: 11,
  OP_PUSHNUM_12: 12,
  OP_PUSHNUM_13: 13,
  OP_PUSHNUM_14: 14,
  OP_PUSHNUM_15: 15,
  OP_PUSHNUM_16: 16,
  OP_FALSE: 0,
  OP_1: 1,
  OP_TRUE: 1,
  OP_2: 2,
  OP_3: 3,
  OP_4: 4,
  OP_5: 5,
  OP_6: 6,
  OP_7: 7,
  OP_8: 8,
  OP_9: 9,
  OP_10: 10,
  OP_11: 11,
  OP_12: 12,
  OP_13: 13,
  OP_14: 14,
  OP_15: 15,
  OP_16: 16,
};

const hexRegex = /\w{2}/g;

export async function getPipeArtData(
  pipeData: any,
  network: string = "livenet",
  witnessD?: string
): Promise<PipeArtItem> {
  if (pipeData.txHash == null) {
    throw "No txHash attached to the pipeArt";
  }

  let tickerID = pipeData.ticker.toUpperCase() + ":" + pipeData.id.toString();
  let edition = 1;
  let totalAmount = 1;
  let mimeType;
  let dataType = "I";
  let pid = null;

  if (pipeData.isPB) {
    const pipeArtItem: PipeArtItem = {
      tickerID: tickerID,
      pid: pipeData.pid ?? undefined,
      pb: pipeData.pb ?? null,
      edition: pipeData.collectionNum ?? edition,
      totalAmount: pipeData.isPB ? /*pipeData.max*/ pipeData.amt : totalAmount,
      dataType: "I",
      mimeType: "_",
      data: "P",
      isPB: pipeData.isPB ?? null,
      isPBO: pipeData.isPBO ?? false,
    };

    return pipeArtItem;
  }
else {

  const data = witnessD ? witnessD : await fetchTxData(pipeData.txHash, network);
  const dataRaw: any[] = [];

  const witnessASMRaw = witnessD ? data : data.vin[0].inner_witnessscript_asm;

  if (witnessASMRaw == null) {
    throw "No witness attached";
  }

  if (witnessASMRaw.length > 0) {
    let witnessASME = witnessASMRaw.split(" ");

    if (pipeData.pid !== undefined) {
      pid = pipeData.pid;
    }

    if (witnessASME[6] == "50" && witnessASME[8] == "41") {
      let index;
      let endIndex = witnessASME.findIndex((it: string) => it === "4e") - 1;

      if (witnessASME[10] == "52") {
        dataType = "R";
        index = witnessASME.findIndex((it: string) => it === "52");
        mimeType = checkMIME(witnessASME[index + 3]);

        return {
          tickerID: tickerID,
          pid: pid ?? undefined,
          pb: pipeData.pb ?? null,
          edition: pipeData.collectionNum ?? edition,
          totalAmount: /*pipeData.max*/ pipeData.amt ?? totalAmount,
          dataType: dataType,
          mimeType: mimeType ?? undefined,
          data: witnessASME[index + 3],
          isPB: pipeData.isPB ?? null,
          isPBO: pipeData.isPBO ?? false,
        };
      } else if (witnessASME[10] == "49") {
        index = witnessASME.findIndex((it: string) => it === "49");

        if (endIndex == null || index == null) {
          throw "Error data not formatted correctly";
        }
        for (let i = index + 2; i < endIndex; i++) {
          if (op_table.hasOwnProperty(witnessASME[i])) {
            dataRaw.push(op_table[witnessASME[i]]);
          } else if (witnessASME[i].includes("OP_")) {
            dataRaw.push(witnessASME[i + 1]);
          }
        }
      }
    }
  }
  const dataFinal = dataRaw.join().trim();
  if (dataRaw.length > 0) {
    mimeType = checkMIME(dataFinal);
  }

  const pipeArtItem: PipeArtItem = {
    tickerID: tickerID,
    pid: pid ?? undefined,
    pb: pipeData.pb ?? null,
    edition: pipeData.collectionNum ?? edition,
    totalAmount: pipeData.isPB ? /*pipeData.max*/ pipeData.amt : totalAmount,
    dataType: dataType,
    mimeType: mimeType ?? undefined,
    data: dataFinal,
    isPB: pipeData.isPB ?? null,
    isPBO: pipeData.isPBO ?? false,
  };

  return pipeArtItem;
}
  
}

export async function fetchTxData(txHash: string, network:string = "livenet"): Promise<any> {
  const url = network === "livenet" ? `https://data2.ppline.app:5020/api/tx/${txHash}`:`https://mempool.space/testnet/api/tx/${txHash}`;
  const response = await fetch(url);

  if (response.status != 200) {
    throw new Error("ERROR");
  }

  return response.json();
}

export function checkMIME(data: string): string | null {
  if (data.length < 8) {
    return null;
  }

  let mimeType;

  const hexSignature6 = data.substring(0, 6);
  const hexSignature8 = data.substring(0, 8);
  const hexSignature12 = data.substring(0, 12);

  switch (true) {
    case ["ffd8ffe0", "ffd8ffe1", "ffd8ffe2", "ffd8ffe3", "ffd8ffe8"].includes(
      hexSignature8
    ):
      mimeType = "image/jpeg";
      break;

    case ["474946383761", "474946383961"].includes(hexSignature12):
      mimeType = "image/gif";
      break;

    case hexSignature8 === "89504e47":
      mimeType = "image/png";
      break;

    case hexSignature6 === "494433":
      mimeType = "audio/mpeg";
      break;

    case hexSignature8 === "4f676753":
      mimeType = "audio/ogg";
      break;

    case hexSignature8 === "664c6143":
      mimeType = "audio/flac";
      break;

    case hexSignature8 === "25504446":
      mimeType = "application/pdf";
      break;
    case hexSignature8 === "3c737667":
      mimeType = "image/svg+xml";
      break;
    default:
      if (hexSignature6 === "3c6874" || hexSignature6 === "3c2144") {
        mimeType = "text/html";
      } else if (hexSignature8 === "52494646" && data.length >= 16) {
        mimeType =
          data.substring(16, 24) === "57454250" ? "image/webp" : "text/plain";
      } else if (data.match(/^[0-9a-fA-F\s]*$/)) {
        mimeType = "text/plain";
      } else {
        mimeType = "unknown";
      }
      break;
  }
  return mimeType;
}

export function hexToString(hex: string): string {
  const matchedHex = hex.match(hexRegex);
  if (!matchedHex) {
    throw new Error("Invalid hex string");
  }
  return matchedHex
    .map((byte) => String.fromCharCode(parseInt(byte, 16)))
    .join("");
}

export function hexToBase64Image(hexString: string): string {
  var matchedHex = hexString.match(hexRegex);
  if (!matchedHex) {
    throw new Error("Invalid hex string");
  }
  return btoa(
    matchedHex
      .map(function (a) {
        return String.fromCharCode(parseInt(a, 16));
      })
      .join("")
  );
}

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function decodePB(ticker: string): number | null {
  let _data = ticker?.substring(5);
  let _str = _data?.toUpperCase();
  let result = 0;
  for (let i = 0; i < _str?.length; i++) {
    const charIndex = alphabet.indexOf(_str[i]);
    if (charIndex === -1) {
      return null;
    }
    result = result * 26 + charIndex;
  }
  return result;
}

export async function loadImageFromOrd(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(image, 0, 0);
        canvas.toBlob((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Data = reader.result as string;
            resolve(base64Data);
          };
          reader.onerror = (error) => {
            reject(error);
          };
          reader.readAsDataURL(blob!);
        });
      }
    };
    image.onerror = (error) => {
      reject(error);
    };
    image.src = url;
  });
}

export async function resizeImageIfNecessary(
  base64Url: string,
  targetSize: number = 300
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = function () {
      let width = img.width;
      let height = img.height;

      if (width === height && width < targetSize) {
        width = targetSize;
        height = targetSize;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, 0, 0, width, height);
          const newBase64 = canvas.toDataURL();
          resolve(newBase64);
        } else {
          reject(new Error("Failed to get canvas context"));
        }
      } else {
        resolve(base64Url);
      }
    };

    img.onerror = function () {
      reject(new Error("Failed to load image"));
    };

    img.src = base64Url;
  });
}
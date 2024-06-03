/* eslint-disable no-undef */
window.addEventListener("sendTransaction", (event) => {
  try {
    chrome.runtime.sendMessage(chrome.runtime.id, {
      action: "sendTransaction",
      path: "/send",
      recipient: event.detail.recipient,
      amount: event.detail.amount,
      psbt: event.detail.psbt,
    });
  } catch (e) {
    console.log(e);
  }
});

window.addEventListener("connect", (event) => {
  if (event.type === "connect") {
    try {
      // eslint-disable-next-line no-undef
      chrome.runtime.sendMessage(
        {
          action: "connect",
          path: "/connect",
          url: window.location.href,
        },
        function (response) {
          const currentAddress = response.connectedWallet.testnet;
          window.postMessage(
            { action: "finishConnect", address: response.connectedWallet.testnet },
            "*"
          );
          return { address: currentAddress };
        }
      );
    } catch (e) {
      console.log(e);
    }
  }
});

window.addEventListener("createPsbt", (event) => {
  if (event.type === "createPsbt") {
    try {
      chrome.runtime.sendMessage(
        chrome.runtime.id,
        {
          action: "createPsbt",
          path: "/create-psbt",
          recipient: event.detail.recipient,
          amount: event.detail.amount,
          ticker: event.detail.ticker,
        },
        function (response) {
          const psbt = response.psbt;
          window.postMessage(
            { action: "createdPsbt", psbt: response.psbt },
            "*"
          );
          return { psbt: psbt };
        }
      );
    } catch (e) {
      console.log(e);
    }
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === "createdPsbt") {
    const psbt = request.psbt;
    // Do something with the psbt...

    const event = new CustomEvent("createdPsbt", {
      detail: { psbt },
    });

    window.dispatchEvent(event);

    // Optionally, send a response.
    sendResponse({ result: "success" });
  }
  if (request.type === "connect") {
    const address = request.address;
    // Do something with the address...

    const event = new CustomEvent("finishConnect", {
      detail: { address },
    });
    window.dispatchEvent(event);

    // Optionally, send a response.
    sendResponse({ result: "success" });
  }
  if (request.type === "sendTransaction") {
    const txid = request.txid;
    // Do something with the txid...

    const event = new CustomEvent("sendTransaction", {
      detail: { txid },
    });
    window.dispatchEvent(event);

    // Optionally, send a response.
    sendResponse({ result: "success" });
  }
  return true;
});

const scriptElement = document.createElement("script");
scriptElement.src = chrome.runtime.getURL("inject.js");
document.head?.appendChild(scriptElement);

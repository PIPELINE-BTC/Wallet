/* eslint-disable no-undef */

window.addEventListener("addListener", (event) => {
  if (event.type === "addListener") {
    try {
      chrome.runtime.sendMessage(
        chrome.runtime.id,
        {
          action: "addListener",
          eventName: event.detail.eventName
        }
      );
    } catch (e) {
      console.log(e);
    }
  }
});

window.addEventListener("sendTransaction", (event) => {
  try {
    chrome.runtime.sendMessage(
      chrome.runtime.id,
      {
        action: "sendTransaction",
        path: "/create-psbt",
        recipient: event.detail.recipient,
        amount: event.detail.amount,
        psbt: event.detail.psbt,
      },
      function (response) {
        const txid = response;
        window.postMessage(
          { action: "createTransactionFromPsbt", txid: response },
          "*"
        );
        return { txid: txid };
      }
    );
  } catch (e) {
    console.log(e);
  }
});

window.addEventListener("connect", (event) => {
  if (event.type === "connect") {
    try {
      // eslint-disable-next-line no-undef
      chrome.runtime.sendMessage(
        chrome.runtime.id,
        {
          action: "connect",
          path: "/connect",
          url: window.location.href,
        },
        function (response) {
          const currentAddress = response.connectedWallet;
          const pubInternalKey = response.pubInternalKey;
          window.postMessage(
            {
              action: "finishConnect",
              address: currentAddress,
              pubInternalKey: pubInternalKey,
            },
            "*"
          );
          return { address: currentAddress, pubInternalKey: pubInternalKey };
        }
      );
    } catch (e) {
      console.log(e);
    }
  }
});

window.addEventListener("signPsbt", (event) => {
  if (event.type === "signPsbt") {
    try {
      chrome.runtime.sendMessage(
        chrome.runtime.id,
        {
          action: "signPsbt",
          path: "/sign-psbt",
          psbtBase64: event.detail.psbtBase64,
        },
        function (response) {

          if(response.error){
            window.postMessage(
              { action: "failedSignedPsbt", error: response.error},
              "*"
            );
            return { error: response.error };
          }
          else{
            const signedPsbtBase64 = response.signedPsbtBase64;
            window.postMessage(
              { action: "signedPsbt", signedPsbtBase64: response.signedPsbtBase64 },
              "*"
            );
            return { signedPsbtBase64: signedPsbtBase64 };
          }
        }
      );
    } catch (e) {
      console.log(e);
    }
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === "connect") {
    const address = request.address;
    const pubInternalKey = request.pubInternalKey;
    const event = new CustomEvent("finishConnect", {
      detail: {
        address, pubInternalKey,
      },
    });
    window.dispatchEvent(event);
    sendResponse({ result: "success" });
  }
  if (request.type === "sendTransaction") {
    const txid = request.txid;
    const event = new CustomEvent("sendTransaction", {
      detail: { txid },
    });
    window.dispatchEvent(event);
    sendResponse({ result: "success" });
  }
  if (request.type === "getAddress") { }

  if (request.action === "accountChanged") {
    window.postMessage({
      action: "accountChanged",
      account: request.account,
    }, "*");
    sendResponse({ result: "success" });
  }
  return true;
});

const scriptElement = document.createElement("script");
scriptElement.src = chrome.runtime.getURL("inject.js");
document.head?.appendChild(scriptElement);

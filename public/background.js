/* eslint-disable no-undef */
let password = "";

const activeListeners = new Set();

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

  if (request.action === "addListener") {
    activeListeners.add(request.eventName);
  } else if (request.action === "removeListener") {
    activeListeners.delete(request.eventName);
  }

  if (request.action === "accountChanged" && activeListeners.has("accountChanged")) {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            action: "accountChanged",
            account: request.account,
          }, (response) => {
            // Vérifier si une erreur est survenue lors de l'envoi du message à chaque onglet
            if (chrome.runtime.lastError) {
              console.warn(`Erreur d'envoi du message à l'onglet ${tab.id}:`, chrome.runtime.lastError.message);
            }
          });
        }
      });
    });

  }

  if (request.action === "sendTransaction") {
    chrome.windows.create({
      url: chrome.runtime.getURL(
        `index.html?path=${request.path}&expanded=true&recipient=${request.recipient}&amount=${request.amount}&psbt=${request.psbt}`
      ),
      type: "popup",
      width: 355,
      height: 628,
      top: 100,
      left: 100,
    });

    chrome.runtime.onMessage.addListener(function (popupMessage) {
      if (popupMessage.action === "createTransactionFromPsbt") {
        chrome.storage.local.get("hex", (result) => {
          sendResponse({ transaction: result });
        });
      }
    });

    return true;
  } else if (request.action === "connect") {
    chrome.windows.create({
      url: chrome.runtime.getURL(
        `index.html?path=${request.path}&expanded=true&url=${request.url}`
      ),
      type: "popup",
      width: 355,
      height: 628,
      top: 100,
      left: 100,
    });

    chrome.runtime.onMessage.addListener(function (popupMessage) {
      if (popupMessage.action === "connectToSite") {
        let pubInternalKey;

        chrome.storage.local.get("pubInternalKey", (result) => {
          pubInternalKey = result.pubInternalKey;
        });
        chrome.storage.local.get("connectedWallet", (result) => {
          sendResponse({
            connectedWallet: result.connectedWallet,
            pubInternalKey: pubInternalKey,
          });
        });
      }
      return true;
    });

    return true;
  } else if (request.action === "signPsbt") {
    chrome.windows.create({
      url: chrome.runtime.getURL(
        `index.html?path=${request.path}&expanded=true&psbtBase64=${request.psbtBase64}`
      ),
      type: "popup",
      width: 355,
      height: 628,
      top: 100,
      left: 100,
    });

    chrome.runtime.onMessage.addListener(function (payload) {
      if (payload.action === "signPsbtSuccess") {
        const signedPsbtBase64 = payload.signedPsbtBase64;
        sendResponse({ signedPsbtBase64: signedPsbtBase64 });
      }

      if (payload.action === "failedSignedPsbt") {
        sendResponse({ error: payload.error });
      }
    });

    return true;
  } else if (request.action === "setPassword") {
    password = request.data;
    sendResponse({});
    return true;
  } else if (request.action === "getPassword") {
    sendResponse({ password });
    return true;
  }
});

setInterval(async () => {
  try {
    await chrome.runtime.sendMessage({ action: "ping" });
  } catch { }
}, 5 * 1000);

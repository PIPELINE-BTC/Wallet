/* eslint-disable no-undef */
let password = '';

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
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
        sendResponse({ connectedWallet: popupMessage.address });
      }
      return true;
    });

    return true;
  } else if (request.action === "createPsbt") {
    chrome.windows.create({
      url: chrome.runtime.getURL(
        `index.html?path=${request.path}&expanded=true&recipient=${request.recipient}&amount=${request.amount}&ticker=${request.ticker}&id=${request.id}`
      ),
      type: "popup",
      width: 355,
      height: 628,
      top: 100,
      left: 100,
    });

    chrome.runtime.onMessage.addListener(function (popupMessage) {
      if (popupMessage.action === "createPsbtForSite") {
        chrome.storage.local.get("psbt", (result) => {
          sendResponse({ psbt: result.psbt });
        });
      }
    });

    return true;
  } else if (request.action === 'setPassword') {
    password = request.data;
    sendResponse({})
    return true;
  } else if (request.action === 'getPassword') {
    sendResponse({ password });
    return true;
  }
});

setInterval(async () => {
  try {
    await chrome.runtime.sendMessage({ action: 'ping' });
  } catch {
  }
}, 5 * 1000);

(function () {

  window.pipeline = window.pipeline || {};

  window.address = window?.pipeline?.address || null;

  window.pipeline._listeners = {};

  window.pipeline.on = function (event, handler) {
    if (!window.pipeline._listeners[event]) {
      window.pipeline._listeners[event] = [];
    }
    window.pipeline._listeners[event].push(handler);
  };

  window.pipeline.removeListener = function (event, handler) {
    if (!window.pipeline._listeners[event]) return;
    window.pipeline._listeners[event] = window.pipeline._listeners[event].filter(
      (h) => h !== handler
    );
  };

  window.pipeline.connect = function () {
    const event = new CustomEvent("connect");
    window.dispatchEvent(event);
  };

  window.pipeline.sendTransaction = function (recipient, amount, psbt) {
    const event = new CustomEvent("sendTransaction", {
      detail: { recipient, amount, psbt },
    });
    window.dispatchEvent(event);
  };

  window.pipeline.signPsbt = function (psbtBase64) {
    return new Promise((resolve, reject) => {
      const timeoutDuration = 15000; 
      let timeoutId;
  
      const handleMessage = (result) => {
        if (result.data?.action === "signedPsbt" || result.data?.action === "failedSignedPsbt") {
          clearTimeout(timeoutId); 
          window.removeEventListener("message", handleMessage);
  
          if (result.data.action === "signedPsbt") {
            resolve(result.data.signedPsbtBase64);
          } else if (result.data.action === "failedSignedPsbt") {
            reject(new Error(result.data.error));
          }
        }
      };
  
      window.addEventListener("message", handleMessage);
  
      timeoutId = setTimeout(() => {
        window.removeEventListener("message", handleMessage);
        reject(new Error("Timeout: please try again."));
      }, timeoutDuration);
  
      const event = new CustomEvent("signPsbt", {
        detail: { psbtBase64 },
      });
  
      window.dispatchEvent(event);
    });
  };
  
  window.addEventListener("message", (result) => {
    const { action, account, address, pubInternalKey, transaction } = result.data || {};

    if (action === "accountChanged") {
      const listeners = window.pipeline._listeners["accountChanged"] || [];
      listeners.forEach((handler) => handler(account));
    }

    if (action === "finishConnect" && address) {
      window.pipeline.address = address;
      window.pipeline.pubInternalKey = pubInternalKey;

      const connectEvent = new CustomEvent("connectToSite", {
        detail: { connectedWallet: address, pubInternalKey: pubInternalKey },
      });
      window.dispatchEvent(connectEvent);
    }

    if (action === "createdTransaction") {
      const createdTransactionEvent = new CustomEvent("createTransactionFromPsbt", {
        detail: { transaction },
      });
      window.dispatchEvent(createdTransactionEvent);
    }
  }, false);

})();

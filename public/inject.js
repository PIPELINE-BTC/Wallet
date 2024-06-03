(function () {
  window.pipe = window.pipe || {};

  window.address = window?.pipe?.address || null;

  window.pipe.connect = function () {
    const event = new CustomEvent("connect");
    window.dispatchEvent(event);
  };

  window.pipe.sendTransaction = function (recipient, amount, psbt) {
    const event = new CustomEvent("sendTransaction", {
      detail: { recipient, amount, psbt },
    });
    window.dispatchEvent(event);
  };

  window.pipe.createPsbt = function (recipient, amount, ticker) {
    const event = new CustomEvent("createPsbt", {
      detail: { amount, ticker, recipient },
    });
    window.dispatchEvent(event);
  };

  window.addEventListener(
    "message",
    (result) => {
      if (result.data.action === "finishConnect") {
        if (result.data.address) {
          window.pipe.address = result.data.address;

          const connectEvent = new CustomEvent("connectToSite", {
            detail: { connectedWallet: result.data.address },
          });
          window.dispatchEvent(connectEvent);
        }
      }
      if (result.data.action === "createdPsbt") {
        const createdPsbtEvent = new CustomEvent("createPsbtForSite", {
          detail: { psbt: result.data.psbt },
        });
        window.dispatchEvent(createdPsbtEvent);
      }
    },
    false
  );
})();

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

  window.pipe.signPsbt = function (psbtBase64) {
    const event = new CustomEvent("signPsbt", {
      detail: { psbtBase64 },
    });
    window.dispatchEvent(event);
  };

  window.addEventListener(
    "message",
    (result) => {
      if (result.data.action === "finishConnect") {
        if (result.data.address) {
          window.pipe.address = result.data.address;
          window.pipe.pubInternalKey = result.data.pubInternalKey;

          const connectEvent = new CustomEvent("connectToSite", {
            detail: { connectedWallet: result.data.address, pubInternalKey: result.data.pubInternalKey },
          });
          window.dispatchEvent(connectEvent);
        }
      }

      if (result.data.action === "signPsbt") {
        const createdPsbtEvent = new CustomEvent("signPsbtFromExtension", {
          detail: { signedPsbtBase64: result.data.signedPsbtBase64 },
        });
        window.dispatchEvent(createdPsbtEvent);
      }

      if (result.data.action === "createdTransaction") {
        const createdTransactionEvent = new CustomEvent("createTransactionFromPsbt", {
          detail: { transaction: result.data.transaction },
        });
        window.dispatchEvent(createdTransactionEvent);
      }
    },
    false
  );
})();

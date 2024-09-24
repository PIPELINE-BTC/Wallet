(function () {

  window.pipeline = window.pipeline || {};

  window.address = window?.pipeline?.address || null;

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
          window.pipeline.address = result.data.address;
          window.pipeline.pubInternalKey = result.data.pubInternalKey;

          const connectEvent = new CustomEvent("connectToSite", {
            detail: { connectedWallet: result.data.address, pubInternalKey: result.data.pubInternalKey },
          });
          window.dispatchEvent(connectEvent);
        }
      }

      if (result.data.action === "signedPsbt") {
        const createdPsbtEvent = new CustomEvent("signPsbtSuccessFromExtension", {
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

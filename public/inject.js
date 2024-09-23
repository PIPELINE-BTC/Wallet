(function () {

  windows.pipeline = windows.pipeline || {};

  window.address = window?.pipeline?.address || null;

  windows.pipeline.connect = function () {
    const event = new CustomEvent("connect");
    window.dispatchEvent(event);
  };

  windows.pipeline.sendTransaction = function (recipient, amount, psbt) {
    const event = new CustomEvent("sendTransaction", {
      detail: { recipient, amount, psbt },
    });
    window.dispatchEvent(event);
  };

  windows.pipeline.signPsbt = function (psbtBase64) {
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
          windows.pipeline.address = result.data.address;
          windows.pipeline.pubInternalKey = result.data.pubInternalKey;

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

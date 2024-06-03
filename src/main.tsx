// import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AccountProvider } from "./AccountContext.tsx";
import * as app from './background';

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <AccountProvider app={app}>
    <App />
  </AccountProvider>
  // </React.StrictMode>
);

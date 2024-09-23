import { MemoryRouter, Routes, Route } from "react-router-dom";

import Welcome from "./screens/Welcome";
import Home from "./screens/Home";
import CreateUser from "./screens/CreateUser";
import Login from "./screens/Login";
import Wallets from "./screens/Wallets";
import HomeLayout from "./layout/HomeLayout";
import Settings from "./screens/Settings";
import Links from "./screens/Links";
import ChangePassword from "./screens/ChangePassword";
import SuccessfulTransaction from "./screens/SuccessfulTransaction";
import AddNewWallet from "./screens/AddNewWallet";
import NewWallet from "./screens/NewWallet";
import ImportWallet from "./screens/ImportWallet";
import ImportAccount from "./screens/ImportAccount";
import Transaction from "./screens/Transaction";
import Accounts from "./screens/Accounts";
import CreateNewAccount from "./screens/CreateNewAccount";
import NftDetails from "./screens/NftDetails";
import SignPsbt from "./screens/SignPsbt";
import SignWebsite from "./screens/SignWebsite";
import ConnectedSites from "./screens/ConnectedSites";
import EditWallet from "./screens/EditWallet";
import EditAccount from "./screens/EditAccount";
import ContactForm from "./screens/ContactForm";
import AddressBook from "./screens/AddressBook";
import ShowSecret from "./screens/ShowSecret";
import Notifications from "./common/Notifications";
import Networks from "./screens/Networks";


function App() {
  const getSize = () => {
    const url = new URL(window.location.href);
    const isExpanded = url.searchParams.get('expanded');
    if (isExpanded) return { width: "100%", height: "100vh" };
    return { width: "356px", height: "600px" };
  };

  return (
    <div
      className="relative bg-black"
      style={getSize()}
    >
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/import" element={<ImportAccount />} />
          <Route path="/send" element={<Transaction />} />
          <Route path="/networks" element={<Networks />} />
          <Route path="/wallet" element={<AddNewWallet />} />
          <Route path="/send/success" element={<SuccessfulTransaction />} />
          <Route path="/create-user" element={<CreateUser />} />
          <Route path="/accounts/create" element={<CreateNewAccount />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/wallet/create" element={<NewWallet />} />
          <Route path="/wallet/import" element={<ImportWallet />} />
          <Route path="/nft/:id" element={<NftDetails />} />
          <Route path="/wallet/edit/:id" element={<EditWallet />} />
          <Route path="/accounts/edit/:id" element={<EditAccount />} />
          <Route path="/sign-psbt" element={<SignPsbt />} />
          <Route path="/contact/edit/:id" element={<ContactForm />} />
          <Route path="/contact/create" element={<ContactForm />} />
          <Route path="/contacts" element={<AddressBook />} />
          <Route path="/secret" element={<ShowSecret />} />
          <Route element={<HomeLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/links" element={<Links />} />
          </Route>
          <Route path="/wallets" element={<Wallets />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/login" element={<Login />} />
          <Route path="/connect" element={<SignWebsite />} />
          <Route path="/connected-sites" element={<ConnectedSites />} />
        </Routes>
      </MemoryRouter>
      <Notifications />
    </div>
  );
}

export default App;

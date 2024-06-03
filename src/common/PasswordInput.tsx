/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import Eye from "../assets/img/eye.svg?react";

const PasswordInput = ({ isSmall, ...props }: any) => {
  const [type, setType] = useState("password");

  const handleToggle = (e: any) => {
    e.preventDefault();
    setType((prev: string) => prev === "password" ? "text" : "password");
  };

  return (
    <div className="relative">
      <input
        type={type}
        style={isSmall ? { padding: "0 22px 0 0" } : { paddingRight: "40px"}}
        { ...props}
      />
      <button
        tabIndex={-1}
        className={`h-fit absolute inset-y-1/2 translate-y-[-50%] ${isSmall ? "right-0" : "right-4"}`}
        onClick={handleToggle}
        type="button"
      >
        <Eye />
      </button>
    </div>
  );
}

export default PasswordInput;

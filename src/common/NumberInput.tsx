/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, ChangeEvent } from "react";

const NumberInput: React.FC<any> = ({ type = "float", value, min, max, onChange, ...props }) => {
  const [internalValue, setInternalValue] = useState<string | number>(value);

  useEffect(() => {
    if (/^0[0-9]/.test(internalValue as string)) {
      setInternalValue((internalValue as string)?.replace(/^0/, ""));
    }
    if (+internalValue !== value) {
      setInternalValue(value);
    }
  }, [internalValue, value, setInternalValue]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();
    if (!value) {
      setInternalValue("");
      onChange(0);
    } else {
      const isValid = type === "int" ? /^\s*\d+\s*$/.test(value) : /^-?\d*\.?\d+$/.test(value);

      if (isValid) {
        const numericValue = parseFloat(value);

        if (numericValue < min! && value !== "") {
          setInternalValue(min!);
          onChange(min!);
        } else if (numericValue > max! && value !== "") {
          setInternalValue(max!);
          onChange(max!);
        } else {
          setInternalValue(value);
          onChange(isNaN(numericValue) || value === "" ? "" : numericValue);
        }
      }
    }
  };

  return (
    <input
      className="form-control"
      autoComplete="off"
      onChange={(event) => handleChange(event)}
      value={internalValue}
      onWheel={(e) => e.currentTarget.blur()}
      {...props}
    />
  );
};

export default NumberInput;

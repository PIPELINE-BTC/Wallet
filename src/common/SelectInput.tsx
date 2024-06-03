/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef } from "react";
import Select from "react-select";

const SelectInput = ({
  styles,
  ...props
}: any) => {
  const selectRef = useRef<any>(null);

  const customStyles = {
    container: (provided: any) => ({
      ...provided,
      width: '100%',
    }),
    control: (provided: any) => ({
      ...provided,
      border: "none",
      lineHeight: "16.41px",
      fontSize: "14px",
      maxHeight: "38px",
      background: '#131212',
      borderRadius: "6px",
      ":hover": {
        cursor: "pointer"
      },
    }),
    singleValue: (provided: any) => ({
      ...provided,
      fontWeight: 400
    }),
    indicatorSeparator: () => ({
      display: "none"
    }),
    indicatorsContainer: () => ({
      display: "flex",
    }),
    menuList: (provided: any) => ({
      ...provided,
      padding: '0 !important',
      borderRadius: '6px',
      color: "#FFFFFF",
      maxHeight: "192px",
      background: '#131212',
    }),
    menu: (provided: any) => ({
      ...provided,
      marginTop: "2px",
      borderRadius: "6px",
      width: "auto",
      "min-width": "100%"
    }),
    option: (provided: any) => ({
      ...provided,
      padding: "11px",
      lineHeight: "16px",
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      flexWrap: "nowrap",
    }),
  };

  return (
    <Select
      ref={selectRef}
      onMenuClose={() => selectRef?.current?.blur()}
      classNamePrefix="react-select"
      styles={styles || customStyles}
      hideSelectedOptions={false}
      theme={(theme: any) => ({
        ...theme,
        borderRadius: 0,
        colors: {
          ...theme.colors,
          primary25: "rgba(29, 30, 42, 0.06)",
          primary: "rgb(19, 18, 18);",
          neutral0: "rgba(29, 30, 42, 0.06)",
          neutral5: "rgba(29, 30, 42, 0.06)",
        },
      })}
      {...props}
    />
  );
};

export default SelectInput;

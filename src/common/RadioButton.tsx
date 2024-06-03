/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from 'react';
import Check from 'assets/img/check.svg?react';

const RadioButton: FC<any> = ({ id, text, ...props }) => {
  return (
    <label htmlFor={id} className="radio-label m-0 cursor-pointer">
      <input
        className="radio-input"
        type="radio"
        id={id}
        {...props}
      />
      <span className={`custom-radio inline-flex justify-center items-center${text ? ' mr-2' : ''}`}>
        <Check />
      </span>
      {text}
    </label>
  );
};

export default RadioButton;

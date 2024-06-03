/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from 'react-router-dom';

import Arrow from 'assets/img/arrow.svg?react';

const GoBackBtn = ({ goBack }: any) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => goBack ? goBack() : navigate(-1)}
      className="relative left-0 p-4 bg-dark-gray"
    >
      <Arrow />
    </button>
  );
};

export default GoBackBtn;

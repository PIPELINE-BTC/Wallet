import React from 'react';

interface IWarningProps {
  text: string;
  className?: string
}

const Warning: React.FC<IWarningProps> = ({ text, className='' }) => {
  if (!text) return null;

  return (
    <div className={`rounded-md bg-danger px-2.5 py-1.5 mb-3 ${className}`}>
      <p className="text-white text-sm">
        {text}
      </p>
    </div>
  );
};

export default Warning;

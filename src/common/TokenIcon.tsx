interface ITokenIcon {
  symbol: string;
}

const TokenIcon: React.FC<ITokenIcon> = ({ symbol }) => {
  return (
    <div className="w-[30px] h-[30px] flex justify-center items-center bg-black" style={{ borderRadius: '5px' }}>
      <p className="text-white text-lg uppercase">
        {symbol}
      </p>
    </div>
  );
};

export default TokenIcon;

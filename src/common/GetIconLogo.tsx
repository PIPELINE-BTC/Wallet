// getIcon.tsx
import Bitcoin from '../assets/tokens/bitcoin.svg?react';
import Lane from '../assets/tokens/lane.png';
import Ins from '../assets/tokens/ins.jpeg';
import Alns from '../assets/tokens/alns.png';
import Troll from '../assets/tokens/troll.jpeg';
import Xidfof from '../assets/tokens/xidfof.png';
import Xpipe from '../assets/tokens/xpipe.png';
import Etch from '../assets/tokens/etch.jpeg';
import Pipe from '../assets/tokens/pipe.jpeg';

import TokenIcon from './TokenIcon';

const icons: { [key: string]: React.ElementType | string } = {
  'BTC': Bitcoin,
  'LANE:0': Lane,
  'INS:0': Ins,
  'TROLL:0': Troll,
  'XIDFOF:0': Xidfof,
  'XPIPE:0': Xpipe,
  'ETCH:0': Etch,
  'ALNS:0': Alns,
  'PIPE:0': Pipe
};

const GetIconLogo = (ticker: string, id: number) => {
  
  if(ticker === undefined || id === undefined){
    return null;
  }
  const IconComponent = icons[`${ticker.toUpperCase()}:${id.toString()}`];

  if (!IconComponent) {
    return <TokenIcon
    symbol={ticker?.charAt(0)}
  /> 
  }
  if (typeof IconComponent === 'string') {
    return <img src={IconComponent} width="30" height="30" style={{ borderRadius: '5px' }}/>;
  } else {
    return <IconComponent width="30" height="30" style={{ borderRadius: '5px' }}/>;
  }
};

export default GetIconLogo;

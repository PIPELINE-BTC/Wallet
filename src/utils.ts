import axios from "axios";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getAddress = (address: string = '') => {
  const firstSymbols = address.slice(0, 5);
  const lastSymbols = address.slice(-5);
  return `${firstSymbols}...${lastSymbols}`;
};

export const copy = (value: string) => navigator.clipboard.writeText(value);

export const times = (n: number, iteratee: (index: number) => any) => {
  const result: any[] = [];

  for (let i = 0; i < n; i++) {
    result.push(iteratee(i));
  }

  return result;
};

export const LINKS = [
  {
    img: '',
    badge: {
      title: 'Service',
      color: 'rgb(79, 161, 99)'
    },
    title: 'Mint Pipe Tokens',
    subTitle:'Mint some Pipe Tokens with our minter tool',
    url: 'https://explorer.ppline.app/M/'
  },
  {
    img: '',
    badge: {
      title: 'Service',
      color: 'rgb(79, 161, 99)'
    },
    title: 'Explore PIPE Assets',
    subTitle:'Browse the PIPE world with our explorer',
    url:'https://explorer.ppline.app/'
  },
  {
    img: '',
    badge: {
      title: 'Service',
      color: 'rgb(79, 161, 99)'
    },
    title: 'PIPELINE Website',
    subTitle:'Read more about the project',
    url:'https://ppline.app/'
  },
  {
    img: '',
    badge: {
      title: 'Follow us on X',
      color: 'rgb(67, 150, 183)'
    },
    title: '',
    subTitle:'',
    url:'https://x.com/Pipeline_btc'
  },
  {
    img: '',
    badge: {
      title: 'Join our Discord',
      color: 'rgb(67, 150, 183)'
    },
    title: '',
    subTitle:'',
    url:'https://discord.com/invite/YnawxDr3PS'
  },
  // {
  //   img: '',
  //   badge: {
  //     title: 'Marketplace',
  //     color: 'rgb(138, 70, 225)'
  //   },
  //   title: 'ALEGORA',
  //   subTitle:' Marketplace For Protocol'
  // },
];

export function assert(condition: unknown, msg: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`)
  }
}

export async function convertBtcToUsd(
  valueInBtc: number,
  options?: { priceOnly?: boolean }
): Promise<number | undefined> {
  try {
    const response = await axios.get<{ USD: number }>('https://mempool.space/api/v1/prices');
    const btcPriceInUsd = response.data.USD;

    if (options?.priceOnly) {
      return btcPriceInUsd;
    }

    const result = btcPriceInUsd * valueInBtc;

    return parseFloat(result.toFixed(2));
  } catch (error) {
    console.error('Error fetching BTC price:', error);
    return undefined;
  }
}

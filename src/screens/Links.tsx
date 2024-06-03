import { FC } from 'react';

import { LINKS } from '../utils';
import logoBg from '../assets/img/logo-link.svg';
import logo from 'assets/img/logo-mini.svg';

const Links: FC = () => {
  return (
    <>
      <div className="flex justify-center w-full p-5">
        <img
          src={logo}
          alt="PIPELINE"
          className="w-[21.67px] h-5 min-[1200px]:w-[45px] min-[1200px]:h-auto"
        />
      </div>
      <div className="p-6">
        {
          LINKS.map((item) =>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className='block'
            >
              <div className='bg-dark-gray rounded-md p-2.5 mb-1.5 flex'>
                <img
                  src={logoBg}
                  alt="PIPELINE"
                  className="w-[21.67px] h-5 min-[1200px]:w-[45px] min-[1200px]:h-auto"
                />
                <div className="flex flex-col ml-3">
                  <span
                    className="inline-block px-2 py-0.5 text-xs text-white w-fit rounded-3xl mb-2"
                    style={{ background: item.badge.color }}
                  >
                    {item.badge.title}
                  </span>
                  <p className="text-white text-[13px] font-medium">
                    {item.title}
                  </p>
                  <p className="text-gray text-xs">
                    {item.subTitle}
                  </p>
                </div>
              </div>
              </a>
              )
        }
            </div>
    </>
      );
};

      export default Links;

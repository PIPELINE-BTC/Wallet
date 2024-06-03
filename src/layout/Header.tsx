/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, MouseEvent } from 'react';

const Header = ({ setUser }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setUser(null);
  };

  return (
    <header className="fixed w-96 top-0 left-0 right-0 bg-white shadow-md p-4 flex justify-between items-center">
      <div className="flex items-center">
        <span className="text-lg font-bold">
          Logo
        </span>
      </div>
      <div className="flex items-center">
        <div className="h-8 w-8 bg-gray-300 rounded-full mr-4" />
        <div className="relative flex items-center">
          <button onClick={toggleDropdown} className="focus:outline-none">
            <svg width="5" height="18" viewBox="0 0 5 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.10645 15.25C4.10645 15.7473 3.9089 16.2242 3.55727 16.5758C3.20564 16.9275 2.72873 17.125 2.23145 17.125C1.73416 17.125 1.25725 16.9275 0.90562 16.5758C0.553989 16.2242 0.356445 15.7473 0.356445 15.25C0.356445 14.7527 0.553989 14.2758 0.90562 13.9242C1.25725 13.5725 1.73416 13.375 2.23145 13.375C2.72873 13.375 3.20564 13.5725 3.55727 13.9242C3.9089 14.2758 4.10645 14.7527 4.10645 15.25ZM4.10645 9C4.10645 9.49728 3.9089 9.97419 3.55727 10.3258C3.20564 10.6775 2.72873 10.875 2.23145 10.875C1.73416 10.875 1.25725 10.6775 0.90562 10.3258C0.553989 9.97419 0.356445 9.49728 0.356445 9C0.356445 8.50272 0.553989 8.02581 0.90562 7.67417C1.25725 7.32254 1.73416 7.125 2.23145 7.125C2.72873 7.125 3.20564 7.32254 3.55727 7.67417C3.9089 8.02581 4.10645 8.50272 4.10645 9ZM4.10645 2.75C4.10645 3.24728 3.9089 3.72419 3.55727 4.07583C3.20564 4.42746 2.72873 4.625 2.23145 4.625C1.73416 4.625 1.25725 4.42746 0.90562 4.07583C0.553989 3.72419 0.356445 3.24728 0.356445 2.75C0.356445 2.25272 0.553989 1.77581 0.90562 1.42417C1.25725 1.07254 1.73416 0.875 2.23145 0.875C2.72873 0.875 3.20564 1.07254 3.55727 1.42417C3.9089 1.77581 4.10645 2.25272 4.10645 2.75Z" fill="black"/>
            </svg>
          </button>
          {
            isOpen && 
              <div className="absolute top-6 right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
                <a
                  href="/#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </a>
                <a
                  href="/#"
                  onClick={handleLogout}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </a>
              </div>
          }
        </div>
      </div>
    </header>
  );
};

export default Header;

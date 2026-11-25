import React, { useEffect } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useWeb3Auth } from './Web3AuthProvider';

const Web3AuthConnection = () => {
  const { login, logout, loggedIn, web3AuthUser } = useWeb3Auth();

    // Optional: React to changes in web3AuthUser, if there's any action to take
    useEffect(() => {
      console.log('User data updated:', web3AuthUser);
      // Here you can perform actions that depend on the updated user data
    }, [web3AuthUser]); // This effect runs whenever web3AuthUser changes
  

  return (
    <div>
      {!loggedIn ? (
        <button
          onClick={login}
          className="text-white font-bold py-3 px-4 rounded bg-violet-800 hover:bg-black"
        >
          Web3Auth
        </button>
      ) : (
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="flex items-center gap-2 text-sm rounded-full bg-gray-800 text-white px-4 py-2 hover:bg-gray-700">
              <img
                src={web3AuthUser?.profileImage || "https://via.placeholder.com/150"}
                alt="Profile"
                className="h-8 w-8 rounded-full"
              />
              {web3AuthUser?.name || "User"}
             
              <ChevronDownIcon className="ml-2 h-5 w-5" aria-hidden="true" />
            </Menu.Button>

            

          </div>
          <Menu.Separator></Menu.Separator>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => {/* Handle profile view action */}}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700`}
                    >
                      Profile
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => {/* TODO: Open phantom / metamask */}}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700`}
                    >
                      {web3AuthUser?.walletAddress || "Wallet@Issuer"}
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={logout}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700`}
                    >
                      Log out
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      )}
    </div>
  );
};

export default Web3AuthConnection;

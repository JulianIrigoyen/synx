import React, { createContext, useState, useEffect, useContext } from "react";
import { Web3Auth } from "@web3auth/modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { CommonPrivateKeyProvider } from "@web3auth/base-provider";

const Web3AuthContext = createContext({ web3Auth: null, provider: null });

export const Web3AuthProvider = ({ children }) => {
  const [web3Auth, setWeb3Auth] = useState(null);
  const [provider, setProvider] = useState(null);

  let chainConfig: {
    chainNamespace: "solana";
    chainId: "0x2"; // Please use 0x1 for Mainnet, 0x2 for Testnet, 0x3 for Devnet
    rpcTarget: "https://api.testnet.solana.com";
    displayName: "Solana Testnet";
    blockExplorer: "https://explorer.solana.com";
    ticker: "SOL";
    tickerName: "Solana";
  };

  useEffect(() => {
    const initWeb3Auth = async () => {
      const privateKeyProvider = new CommonPrivateKeyProvider({
        config: {
          chainConfig,
        },
      });
      
    };

    initWeb3Auth();
  }, []);

  return <Web3AuthContext.Provider value={{ web3Auth, provider }}>{children}</Web3AuthContext.Provider>;
};

export const useWeb3Auth = () => useContext(Web3AuthContext);

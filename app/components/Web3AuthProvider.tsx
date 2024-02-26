import React, { createContext, useState, useEffect, useContext } from "react";
import { Web3Auth } from "@web3auth/modal";
import { CommonPrivateKeyProvider } from "@web3auth/base-provider";
import {
  CustomChainConfig,
  CHAIN_NAMESPACES,
  IProvider,
  UserInfo,
} from "@web3auth/base"; // Adjust imports based on actual package structure
import { jwtDecode } from "jwt-decode";
// Plugins
import { SolanaWalletConnectorPlugin } from "@web3auth/solana-wallet-connector-plugin";
// Adapters
import { SolflareAdapter } from "@web3auth/solflare-adapter";
import { SlopeAdapter } from "@web3auth/slope-adapter";
import { PhantomAdapter } from "@web3auth/phantom-adapter";

const Web3AuthContext = createContext({
  web3Auth: null,
  provider: null,
  web3AuthUser: null,
  loggedIn: false, // login state
  login: async () => {}, // login function
  logout: async () => {}, // logout function
  setUserFromToken: async (idToken: string) => {}, // set web3auth user 

});

/**
 * Decoded Web3Auth JWT Example (Google Wallet Connect)
  aggregateVerifier: "web3auth-google-sapphire"
  aud: "None"
  email: "martinirigoyenj17@gmail.com"
  exp: 1708749002
  iat: 1708662602
  iss: "https://api-auth.web3auth.io"
  name: "Julian Irigoyen"
  nonce: "02248d6df8d5ac3faf9267bcdc82677f7a391fcb59e19a48eae849a603d591627c"
  profileImage: "https://lh3.googleusercontent.com/a/ACg8ocKCNo4ClXU89RSkSqgnArTLExpu8ZuMlUYjSe7CWq6h1UA=s96-c"
  verifier: "web3auth"
  verifierId: "martinirigoyenj17@gmail.com"
  wallets: 
{
    "public_key": "d740cf76a92281848988fd5c40b0b5a54d63d67688b07a4f2035bf76c7691dbe",
    "type": "web3auth_app_key",
    "curve": "ed25519"
}
 */
interface Web3AuthUserInfo extends UserInfo {
  walletAddress?: string;
  walletIssuer?: string;
  chain?: string;
  chainHost?: string;
}

function uiConsole(...args: any[]): void {
  const el = document.querySelector("#console>p");
  if (el) {
    el.innerHTML = JSON.stringify(args || {}, null, 2);
  }
}
/**
 * Decoded Web3Auth JWT Example (Phantom Wallet Connect)
 * @param idToken {
  "iat": 1708637192,
  "iss": "phantom",
  "aud": "localhost",
  "wallets": [
    {
      "address": "FfYdwkHEQoF4FUMZy352wGdJwieGFkQrp7cTzuuMBqkU",
      "type": "solana"
    }
  ],
  "exp": 1708723592
}
 * @returns 
 */
function getUserWalletFromToken(jwtObject) {
  try {
    const decoded = jwtDecode(jwtObject.idToken);
    console.log(decoded);
    const publicKey = decoded?.wallets[0]?.address;
    return publicKey;
  } catch (error) {
    console.error("Failed to decode idToken", error);
    return null;
  }
}

export const Web3AuthProvider = ({ children }) => {
  const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || "None"; // Ensure this is exposed to the client if you're using Next.js

  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [web3AuthUser, setWeb3AuthUser] = useState<Web3AuthUserInfo | null>(null);
  const [walletAddress, setWalletAddress] = useState(null);

  const chainConfig: CustomChainConfig = {
    chainNamespace: CHAIN_NAMESPACES.SOLANA,
    chainId: "0x2", // Example for Solana Testnet
    rpcTarget: "https://api.testnet.solana.com",
    displayName: "Solana Testnet",
    blockExplorerUrl: "https://explorer.solana.com",
    ticker: "SOL",
    tickerName: "Solana",
  };

  useEffect(() => {
    const initWeb3Auth = async () => {
      try {
        const privateKeyProvider = new CommonPrivateKeyProvider({
          config: {
            chainConfig,
          },
        });
        const web3auth = new Web3Auth({
          clientId: clientId,
          chainConfig,
          privateKeyProvider: privateKeyProvider,
          web3AuthNetwork: "sapphire_mainnet",
        });

        // adding solana wallet connector plugin
        const torusPlugin = new SolanaWalletConnectorPlugin({
          torusWalletOpts: {},
          walletInitOptions: {
            whiteLabel: {
              name: "Whitelabel Demo",
              theme: { isDark: true, colors: { torusBrand1: "#00a8ff" } },
              logoDark: "https://web3auth.io/images/web3auth-logo.svg",
              logoLight: "https://web3auth.io/images/web3auth-logo---Dark.svg",
              topupHide: true,
              defaultLanguage: "en",
            },
            enableLogging: true,
          },
        });
        await web3auth.addPlugin(torusPlugin);

        const solflareAdapter = new SolflareAdapter({
          clientId,
        });
        web3auth.configureAdapter(solflareAdapter);

        const slopeAdapter = new SlopeAdapter({
          clientId,
        });
        web3auth.configureAdapter(slopeAdapter);

        const phantomAdapter = new PhantomAdapter({
          clientId,
        });

        web3auth.configureAdapter(phantomAdapter);

        setWeb3auth(web3auth);

        await web3auth.initModal();
        setProvider(web3auth.provider);

        // if (web3auth.connected) {
        //   setLoggedIn(true);
        // }
      } catch (error) {
        console.log(error);
      }
    };

    initWeb3Auth();
  }, []);

  const login = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connect();

    if (web3auth.connected) {
      setLoggedIn(true);
      if (!web3auth) {
        console.error("Web3Auth not initialized");
        return;
      }

      try {
        const jwtTokenObject = await web3auth.authenticateUser();
        const publicKey = getUserWalletFromToken(jwtTokenObject);
        console.log("User's Public Key:", publicKey);
        setWeb3AuthUserFromToken(jwtTokenObject.idToken)
      } catch (error) {
        console.error("An error occurred during authentication", error);
      }
      // setWalletAddress(solanaWalletAddress); // Store the wallet address
    }
    setProvider(web3authProvider);
  };

  const logout = async () => {
    if (!web3auth) {
      console.error("Web3Auth not initialized");
      return;
    }

    try {
      await web3auth.logout();
      setLoggedIn(false);
      setProvider(null);
      setWeb3AuthUser(null); // Optionally clear user data
      console.log("Logged out successfully");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      uiConsole("Web3Auth not initialized yet.");
      return;
    }
    try {
      const userInfo = await web3auth.getUserInfo();
      uiConsole(userInfo); 
      setWeb3AuthUser(userInfo);
    } catch (error) {
      uiConsole("Failed to get user info:", error);
    }
  };

  function setWeb3AuthUserFromToken(idToken: string) {
  try {
    const decoded: any = jwtDecode(idToken); // Assuming the JWT structure is known and consistent
    uiConsole(decoded);

    // Assuming the first wallet contains the desired user info
    const firstWallet = decoded?.wallets?.[0] || {};

    const web3AuthUserInfo: Web3AuthUserInfo = {
      name: decoded?.name,
      email: decoded?.email,
      profileImage: decoded?.profileImage,
      walletAddress: firstWallet?.public_key,
      walletIssuer: decoded?.iss,
      chainHost: decoded?.aud,
      verifier: decoded?.verifier,
      verifierId: decoded?.verifierId,
      typeOfLogin: "line"
    };

    setWeb3AuthUser(web3AuthUserInfo); // Set the user info in the state
  } catch (error) {
    console.error("Failed to decode idToken", error);
  }
}

  return (
    <Web3AuthContext.Provider value={{ web3auth, provider, login, logout, loggedIn, web3AuthUser }}>
      {children}
    </Web3AuthContext.Provider>
  );
};

export const useWeb3Auth = () => useContext(Web3AuthContext);

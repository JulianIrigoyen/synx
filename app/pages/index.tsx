import { NextPage } from "next";
import styles from "../styles/Home.module.css";
import WalletContextProvider from "../components/WalletContextProvider";
import { AppBar } from "../components/AppBar";
import { BalanceDisplay } from "../components/BalanceDisplay";
import { MintToForm } from "../components/MintToForm";
import { CreateTokenAccountForm } from "../components/CreateTokenAccount";
import { CreateMintForm } from "../components/CreateMint";
import { CreateInvestmentPoolButton } from "../components/CreateInvestmentPool";
import Head from "next/head";
import WhitelistInvestorComponent from "../components/WhitelistInvestor";
import UserInfoComponent from "../components/UserInfo";
import { Web3AuthProvider } from "../components/Web3AuthProvider";

const Home: NextPage = (props) => {
  return (
    <div className={styles.App}>
      <Head>
        <title>SynX</title>
        <meta name="description" content="SynX RWAS" />
      </Head>
      <WalletContextProvider>
      <Web3AuthProvider>
        <AppBar />
        <div className={styles.AppBody}>
          <BalanceDisplay />
          <UserInfoComponent />
          {/* <CreateMintForm /> */}
          {/* <CreateTokenAccountForm /> */}
          <CreateInvestmentPoolButton />
          <WhitelistInvestorComponent program={undefined} poolKey={undefined} />
          {/* <MintToForm /> */}
        </div>
        </Web3AuthProvider>
      </WalletContextProvider>

    </div>
  );
};

export default Home;

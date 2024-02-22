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

const Home: NextPage = (props) => {
  return (
    <div className={styles.App}>
      <Head>
        <title>SynX</title>
        <meta name="description" content="SynX RWAS" />
      </Head>
      <WalletContextProvider>
        <AppBar />
        <div className={styles.AppBody}>
          <BalanceDisplay />
          {/* <CreateMintForm /> */}
          {/* <CreateTokenAccountForm /> */}
          <CreateInvestmentPoolButton />
          {/* <MintToForm /> */}
        </div>
      </WalletContextProvider>
    </div>
  );
};

export default Home;

import { FC } from "react";
import styles from "../styles/Home.module.css";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";

export const AppBar: FC = () => {
  return (
    <div className={styles.AppHeader}>
      <Image src="/iSynX0nobg.png" height={100} width={100} />
      <span>SynX - RWA Investment Pools</span>
      <WalletMultiButton />
    </div>
  );
};

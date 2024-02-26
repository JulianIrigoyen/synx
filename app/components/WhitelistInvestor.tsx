import React, { useState } from 'react';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@project-serum/anchor';
import {  Text as CatalystText} from './catalyst/text';
import { Button } from './catalyst/button';

const WhitelistInvestorComponent = ({ program, poolKey }) => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [investorPublicKey, setInvestorPublicKey] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleWhitelist = async () => {
    if (!wallet || !investorPublicKey) {
      setFeedbackMessage('Wallet is not connected or investor public key is missing.');
      return;
    }

    try {
      const investor = new anchor.web3.PublicKey(investorPublicKey);

      // Find the PDA for the whitelist entry
      const [whitelistEntryKey, whitelistEntryBump] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("WHITELIST"), poolKey.toBuffer(), investor.toBuffer()],
        program.programId
      );

      // Whitelist the investor
      const txid = await program.rpc.whitelistInvestor(investor, whitelistEntryBump, {
        accounts: {
          pool: poolKey,
          poolMaster: wallet.publicKey,
          whitelistEntry: whitelistEntryKey,
          investor: investor,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [],
      });

      // console.log(`Transaction submitted to https://explorer.solana.com/tx/${txid}?cluster=devnet`)

      setFeedbackMessage(`Investor successfully whitelisted. Transaction submitted to https://explorer.solana.com/tx/${txid}?cluster=devnet`);
    } catch (error) {
      console.error('Error whitelisting investor:', error);
      setFeedbackMessage('Error whitelisting investor. See console for details.');
    }
  };

  return (
    <div>
      <CatalystText>Whitelist an Investor</CatalystText>
      <input
        type="text"
        placeholder="Enter investor public key"
        value={investorPublicKey}
        onChange={(e) => setInvestorPublicKey(e.target.value)}
        className="input-class-name" //todo
      />
      <Button onClick={handleWhitelist}>Whitelist</Button>
      {feedbackMessage && <CatalystText>{feedbackMessage}</CatalystText>}
    </div>
  );
};

export default WhitelistInvestorComponent;
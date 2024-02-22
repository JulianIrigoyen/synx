import { FC, useState } from 'react';
import { useConnection, useAnchorWallet, AnchorWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@project-serum/anchor';
import {AnchorProvider} from "@project-serum/anchor"

import { Synx } from '../../target/types/synx';
import idl from '../public/idl/synx.json';

export const CreateInvestmentPoolButton: FC = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const [txSig, setTxSig] = useState('');
  const [poolKey, setPoolKey] = useState('');

  const createPool = async () => {

    if (!wallet) {
      console.error('Wallet not connected');
      return;
    }

    const provider = new AnchorProvider(
        connection,
        wallet as unknown as AnchorWallet,
        {}
    );

    const anchoredIdl = idl as anchor.Idl;
    const programId = new anchor.web3.PublicKey("GiWGrEfwScYrTXoTECQR2HbRyCwn5Vu6K1tTbCSXm4x2");
    const program = new anchor.Program(anchoredIdl, programId, provider);

    try {
      const treasury = anchor.web3.Keypair.generate();

      const [poolKey, bump] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from('POOL'), treasury.publicKey.toBuffer()],
        program.programId
      );

      await program.rpc.createPool(
        new anchor.BN(10000), // max_investment
        new anchor.BN(1000),  // min_investment
        bump,
        {
          accounts: {
            pool: poolKey,
            poolMaster: wallet.publicKey,
            treasury: treasury.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          },
          signers: [treasury],
        }
      );

      setPoolKey(poolKey.toString());
    } catch (error) {
      console.error('Error creating investment pool:', error);
    }
  };

  return (
    <div>
      {wallet?.publicKey ? (
        <button onClick={createPool}>Create Investment Pool</button>
      ) : (
        <span>Connect Your Wallet</span>
      )}
      {poolKey && <p>Pool Key: {poolKey}</p>}
    </div>
  );
};

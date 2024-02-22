"use-client";
import { FC, useState } from "react";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import { AnchorProvider } from "@project-serum/anchor";
import idl from "../public/idl/synx.json";
import { Button } from "./catalyst/button";
import {
  Fieldset,
  Legend,
  FieldGroup,
  Field,
  Label,
  Description,
} from "./catalyst/fieldset";
import {
  Badge,
  Input,
  Listbox,
  ListboxLabel,
  ListboxOption,
  Textarea,
} from "./catalyst";
import { Text as CatalystText } from "./catalyst/text";

export const CreateInvestmentPoolButton: FC = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [latestPoolKey, setPoolKey] = useState("");

  const [pools, setPools] = useState([]); // Holds a collection of pools

  // hardoded for now to illustrate concept
  const assetTypes = [
    { value: "land", label: "Land (Agro Yield)" },
    { value: "realEstate", label: "Real Estate (Rent Yield)" },
    { value: "vehicles", label: "Vehicles (Freight/Transport Yields)" },
    {
      value: "eventProduction",
      label: "Event Production (Ticket / Bar Yields)",
    },
  ];

  const createPool = async () => {
    if (!wallet) {
      console.error("Wallet not connected");
      return;
    }

    const provider = new AnchorProvider(connection, wallet, {});
    const anchoredIdl = idl as anchor.Idl;
    const programId = new anchor.web3.PublicKey(
      "GiWGrEfwScYrTXoTECQR2HbRyCwn5Vu6K1tTbCSXm4x2"
    );
    const program = new anchor.Program(anchoredIdl, programId, provider);

    try {
      const treasury = anchor.web3.Keypair.generate();
      const [poolKey, bump] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("POOL"), treasury.publicKey.toBuffer()],
        program.programId
      );

      await program.rpc.createPool(
        new anchor.BN(10000), // max_investment
        new anchor.BN(1000), // min_investment
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
      setPools((prevPools) => [...prevPools, poolKey.toString()]);
    } catch (error) {
      console.error("Error creating investment pool:", error);
    }
  };

  // Inline style for a bigger button
  const bigButtonStyle = {
    padding: "10px 20px 10py",
    margin: "10mt 20px 10py",
    fontSize: "16px",
    cursor: "pointer",
    backgroundColor: "gray",
    color: "white",
    borderRadius: "5px",
    border: "none",
    outline: "none",
    transition: "background-color 0.2s",
  };

  return (
    <form>
      <Fieldset>
        <Legend>Create Investment Pool</Legend>
        <FieldGroup>
          <Field>
            <Label>Pool Name</Label>
            <Input
              name="poolName"
              value="synX"
              // onChange={(e) => setPoolName(e.target.value)}
            />
          </Field>
          <div>
            <Field>
              <Label>Asset Type</Label>
              <Description>
                This will be visible to clients on the project.
              </Description>
              <Listbox name="assetType" defaultValue="land">
                {assetTypes.map((type) => (
                  <ListboxOption key={type.value} value={type.value}>
                    <ListboxLabel>{type.label}</ListboxLabel>
                  </ListboxOption>
                ))}
              </Listbox>
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-4">
            <Field>
              <Label>Max Investment</Label>
              <Input
                name="maxInvestment"
                type="number"
                value={1000}
                //   onChange={(e) => setMaxInvestment(e.target.value)}
              />
            </Field>
            <Field>
              <Label>Min Investment</Label>
              <Input
                name="minInvestment"
                type="number"
                value={100}
                //   onChange={(e) => setMinInvestment(e.target.value)}
              />
            </Field>
          </div>
          <Field>
            <Label>Description</Label>
            <Description>
              Describe this opportunity to your investors
            </Description>
            <Textarea
              name="description"
              value={"synX Tokens"}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
        </FieldGroup>
      </Fieldset>

      {wallet?.publicKey ? (
        <Button style={bigButtonStyle} onClick={createPool}>
          Create Investment Pool
        </Button>
      ) : (
        <CatalystText className="py-10">
          Connect your wallet to interact with SynX
        </CatalystText>
      )}
      {
        /* {latestPoolKey && <p>Pool Key: {latestPoolKey}</p>} */
        <div className="mt-4">
          {pools.map((poolKey, index) => (
            <Badge key={index} color="green" className="mr-2">
              {poolKey}
            </Badge>
          ))}
        </div>
      }
    </form>

    
  );
};

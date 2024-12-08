import { JsonRpcProvider, Wallet } from "ethers";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();
const easContractAddress = "0x4200000000000000000000000000000000000021";
const schemaUID = "0xb7b52c70f0eb4691a11c04221e923fafc8aebf358938d792b1b5792d522aec83";

// Hardcoded values
const nftId = 1; // Replace with your desired NFT ID
const walletId = "0x0000000000000000000000000000000000000000"; // Replace with your desired Wallet ID

const main = async () => {
  try {
    // Initialize provider
    const provider = new JsonRpcProvider("https://base-sepolia.g.alchemy.com/v2/2Zt9ztwHmD4Ny5EnsJwcwTC5AhgOdhko");

    // Initialize signer with private key and provider
    const privateKey =  process.env.PRIVATE_KEY; // Replace with your actual private key
    const signer = new Wallet(privateKey, provider);

    // Initialize EAS instance and connect it to the signer
    const eas = new EAS(easContractAddress);
    await eas.connect(signer);

    console.log("Connected to EAS...");

    // Create schema encoder and encode data
    const schemaEncoder = new SchemaEncoder("uint8 NFTID,address WalletID");
    const encodedData = schemaEncoder.encodeData([
      { name: "NFTID", value: nftId, type: "uint8" },
      { name: "WalletID", value: walletId, type: "address" },
    ]);

    console.log("Creating attestation...");
    const tx = await eas.attest({
      schema: schemaUID,
      data: {
        recipient: walletId,
        expirationTime: 0,
        revocable: false,
        data: encodedData,
      },
    });

    const newAttestationUID = await tx.wait();
    console.log("New Attestation UID:", newAttestationUID);
  } catch (error) {
    console.error("Error:", error.message);
  }
};

main();

import { generatePrivateKey, privateKeyToAccount, signMessage } from "viem/accounts";

async function generateWalletAndSignMessage() {
  // Generate a random wallet
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  const ethereum_address = account.address;

  console.log(`Generated Wallet Address: ${ethereum_address}`);
  console.log(`Private Key: ${privateKey}`);

  // Define a message to sign
  const message = "This is a test message";

  // Sign the message
  const signature = await signMessage({
    message,
    privateKey,
  });

  console.log(`Message: ${message}`);
  console.log(`Signature: ${signature}`);

  return {
    ethereum_address,
    message,
    signature,
  };
}

generateWalletAndSignMessage()
  .then((data) => {
    console.log(JSON.stringify(data, null, 2));
  })
  .catch((error) => {
    console.error("Error generating wallet and signing message:", error);
  });

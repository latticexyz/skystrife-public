import { Wallet } from "ethers";

export const getBurnerWallet = () => {
  const urlKey = new URLSearchParams(window.location.search).get("privateKey");
  if (urlKey) return new Wallet(urlKey).privateKey;

  const storageKey = "mud:burnerWallet";

  const privateKey = localStorage.getItem(storageKey);
  if (privateKey) return privateKey;

  const burnerWallet = Wallet.createRandom();
  localStorage.setItem(storageKey, burnerWallet.privateKey);
  return burnerWallet.privateKey;
};

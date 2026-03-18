const DEFAULT_RPC_URL = "https://rpc.hoodi.ethpandaops.io";
const DEFAULT_CONTRACT = {
  network: "Hoodi",
  address: "0x7fE703af5c66Ea05EF9c589FAB2689a7F4A2F5E9"
};

export const RPC_URL = import.meta.env.VITE_RPC_URL || DEFAULT_RPC_URL;

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || DEFAULT_CONTRACT.address;

export const CONTRACTS = [
  {
    id: contractAddress.toLowerCase(),
    network: import.meta.env.VITE_CONTRACT_NETWORK || DEFAULT_CONTRACT.network,
    address: contractAddress
  }
];

export const NFT_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)"
];

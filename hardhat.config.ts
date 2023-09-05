import "dotenv/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PRIVATE_KEY_LOCAL = process.env.PRIVATE_KEY_LOCAL;
const API_KEY = process.env.API_KEY;
const NETWORK_RPC = process.env.NETWORK_RPC;
module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 999999,
      },
    },
  },
  networks: {
    rpc: {
      url: NETWORK_RPC,
      accounts: [PRIVATE_KEY],
    },
    local: {
      url: "http://127.0.0.1:8545",
      accounts: [PRIVATE_KEY_LOCAL],
    },
  },
  etherscan: {
    apiKey: API_KEY,
  },
};

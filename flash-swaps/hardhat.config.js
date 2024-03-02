require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config({ path: __dirname + '/.env' });

let scriptName;
const MAINNET_FORK_BLOCK_NUMBER = 15969633;
const GOERLI_FORK_BLOCK_NUMBER = 8660077;

if (process.argv[3] != undefined) {
  scriptName = process.argv[3];
} else {
  scriptName = "";
}

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      forking: {
        url: process.env.MAINNET,
        blockNumber: MAINNET_FORK_BLOCK_NUMBER,
      },
    },
  },
};

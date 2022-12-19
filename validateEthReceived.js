const { providers, Contract } = require("ethers");

const { createTxEth, TIME_MARGIN_SAFETY } = require("./utils");

const addressBridgeL1 = "0x99c9fc46f92e8a1c0dec1b1747d010903e884be1";
const addressBridgeL2 = "0x4200000000000000000000000000000000000010";
const SENDING_ETH = "0x0000000000000000000000000000000000000000";

const abiL1 = [
  "event ETHDepositInitiated(address indexed _from, address indexed _to, uint256 _amount, bytes _data)",
];
const abiL2 = [
  "event DepositFinalized(address indexed _l1Token, address indexed _l2Token, address indexed _from, address _to, uint256 _amount, bytes _data)",
];

const providerL1 = new providers.JsonRpcProvider(
  process.env.ALCHEMY_URL_ETHEREUM
);
const providerL2 = new providers.JsonRpcProvider(
  process.env.ALCHEMY_URL_OPTIMISM
);

const contractL1 = new Contract(addressBridgeL1, abiL1, providerL1);
const contractL2 = new Contract(addressBridgeL2, abiL2, providerL2);

const l1ListTxs = [];
const l2ListTxs = [];

function validateEthReceived() {
  for (let i = 0; i < l1ListTxs.length; i++) {
    var txL1 = l1ListTxs[i];

    var ixL2 = l2ListTxs.findIndex((txL2) => {
      return (
        txL2.from == txL1.from &&
        txL2.to == txL1.to &&
        txL2.amount == txL1.amount
      );
    });

    if (ixL2 !== -1) {
      l1ListTxs.splice(i, 1);
      l2ListTxs.splice(ixL2, 1);
    }

    var timePassed = Date.now() - txL1.timestamp;
    if (timePassed > TIME_MARGIN_SAFETY) return false;
  }
  return true;
}

function initSmartContracts() {
  contractL1.on("ETHDepositInitiated", (from, to, amount, data) => {
    l1ListTxs.push(createTxEth({ timestamp: Date.now(), from, to, amount }));
  });

  contractL2.on(
    "DepositFinalized",
    (l1Token, l2Token, from, to, amount, data) => {
      if (l1Token === SENDING_ETH) {
        l2ListTxs.push(
          createTxEth({ timestamp: Date.now(), from, to, amount })
        );
      }
    }
  );
}

module.exports = { validateEthReceived, initSmartContracts };

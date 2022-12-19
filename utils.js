const { utils, BigNumber } = require("ethers");
const axios = require("axios");
require("dotenv").config();

const ONE_MINUTE = 60 * 1000;
const TIME_MARGIN_SAFETY = 20 * ONE_MINUTE; // 20 min
const INTERVAL_VALIDATION = ONE_MINUTE; // 1 min

const bn = (num) => BigNumber.from(num);
const FACTOR = bn("1000000000000000000");

const createTxEth = ({ timestamp, from, to, amount }) => ({
  timestamp,
  from,
  to,
  amount,
});

const URL_STATS_SCAN =
  "https://api-optimistic.etherscan.io/api?module=stats&action=ethsupply";

const TVL_SAFETY_MARGIN = BigNumber.from("30").mul(FACTOR);

function get60MinAverage(arr) {
  const sum = arr.reduce((a, b) => a.add(b));
  const avg = sum.div(arr.length) || 0;
  return avg;
}

async function getCurrentEthSupply() {
  try {
    var eth = await axios.get(URL_STATS_SCAN);
    return [true, BigNumber.from(eth.data.result)];
  } catch (error) {
    console.log("Error getting eth supply", error);
    return [false];
  }
}

module.exports = {
  createTxEth,
  URL_STATS_SCAN,
  TIME_MARGIN_SAFETY,
  INTERVAL_VALIDATION,
  pEth: (wei) => utils.formatEther(wei),
  bn,
  get60MinAverage,
  TVL_SAFETY_MARGIN,
  getCurrentEthSupply,
  FACTOR,
};

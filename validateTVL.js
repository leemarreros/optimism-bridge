const {
  get60MinAverage,
  bn,
  getCurrentEthSupply,
  TVL_SAFETY_MARGIN,
  FACTOR,
} = require("./utils");

var historicEth = [];
var isOk = true;
const AMOUNT_SAMPLE = 60;
const ZERO = bn("0");

async function validateTVL() {
  if (historicEth.length < 60) return true;
  if (!isOk) return false;
  var [success, currentTotalEth] = await getCurrentEthSupply();
  if (!success) return true;
  historicEth.push(currentTotalEth);
  historicEth = historicEth.splice(-AMOUNT_SAMPLE);
  var average =
    historicEth.length == 0
      ? currentTotalEth
      : get60MinAverage([...historicEth]);
  var drop = currentTotalEth.lt(average) ? average.sub(currentTotalEth) : 0;
  if (drop === 0) return true;
  var dropPercentage = average.eq(ZERO) ? ZERO : drop.mul(FACTOR).div(average);
  isOk = dropPercentage.lt(TVL_SAFETY_MARGIN);
  return isOk;
}

module.exports = { validateTVL };

const express = require("express");
const app = express();
const port = 3000;

const { INTERVAL_VALIDATION } = require("./utils");

const { validateTVL } = require("./validateTVL");
const {
  validateEthReceived,
  initSmartContracts,
} = require("./validateEthReceived");

async function isBridgeOk() {
  // Total Value Locked validation
  var validatingTVL = await validateTVL();

  // Eth sent is the same as Eth received
  var validatingEth = validateEthReceived();
  console.log("Bridge is ok?", validatingEth && validatingTVL);
}

app.listen(port, () => {
  console.log("Server is running on port " + port);

  initSmartContracts();
  setInterval(isBridgeOk, INTERVAL_VALIDATION);
});

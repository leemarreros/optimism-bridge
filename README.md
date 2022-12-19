# MONITORING OPTIMISM BRIDGE

### Write a short write-up describing how you would identify in real-time whether the Optimism bridge is working effectively or not.

A bridge is a connection between two different blockchains that allows users to send valuable assets back and forth.

Typically, a bridge architecture is constituted of two smart contracts (one in each chain) and a middleware server that listens to events and triggers functions. It starts with the user wanting to transfer, let's say, ETH from one chain to receive, let's say, WETH in the other chain. At first, the user will send the ETH to a smart contract controlled by the bridge that will lock the funds. The middleware is constantly listening to this event and once one is caught, it triggers a minting process on the other side of the chain. Most of the time, the asset sent over to the other chain is called a wrapped asset.

The process described above has a lot of intricacies and its complexity has been exploited by hackers, resulting in the loss of millions of dollars when transacting over the bridge.

To identify in real-time whether a bridge is working correctly, there should be key indicators at each step of the process. Each key should have a benchmark that will be built over time. Additionally, there are going to be certain safe margins around the benchmark that when crossed should arise an alert to investigate further.

To monitor these key indicators, it will be necessary to include analytics of on-chain data and to develop algorithms that monitor whether the KPIs are within a safe range. API services from The Graph and Etherscan would be helpful. Once a danger is identified, it should automatically trigger some actions (e.g. pausing the bridge contract).

### What all on-chain data would you listen for? Please feel free to read through any docs or research online.

1. <u>Total Value Locked</u>: a significant drop in the number of assets locked within a chain could bring a run in other deposited assets. This could be analyzed by token (e.g. ETH, USDC, USDT)
2. <u>Amount of active validators</u>: the greater the number the more decentralized. The lower the number, the easier to control the validation of wrongful transactions
3. <u>Approve method</u>: users would have to give approval to the smart contract bridge before the bridge makes the transfer from. We could potentially identify an attack by closely monitoring to whom users approve.
4. <u>Owner change</u>: Only a specific address (acting as owner) would be in charge of executing methods or validating transactions. The moment the address owner changes, it could signify that an attacker has gained control over the restricted methods.
5. <u>Equal amount sent and receive</u>: Monitor the amount of Ether or specific tokens that have been sent through the bridge. The same specific amount must be received on the other side of the bridge.

### Write a script (in the language of your choice) to implement your approach and output True if the Optimism bridge is working effectively and vice-versa. Feel free to use Etherscan free APIs for accessing on-chain data.

Basically, there are two scripts being used in this validation algorithm. One scripts listens to events coming from both chains (Ethereum and Optimism) and the other one uses Etherscan API.

```javascript
// index.js
async function isBridgeOk() {
  // Total Value Locked validation
  var validatingTVL = await validateTVL();

  // Eth sent is the same as Eth received
  var validatingEth = validateEthReceived();
  console.log("Bridge is ok?", validatingEth && validatingTVL);
}
```

Those two scripts are broken down next:

1. Verifies that Total Value Locked (ETH) does not drop beyond 20%

```javascript
// validateTVL.js
// ... Finds the average of the last 60 measures of total Eth
// ... If the drop in the last TVL compared with the average is > 20%. Then raise a 'false'
var average = get60MinAverage([...historicEth]);
var dropPercentage = drop.mul(FACTOR).div(average);
isOk = dropPercentage.lt(TVL_SAFETY_MARGIN);
return isOk
```

2. All amount of Ether sent from one side (L1) must have its counterpart in L2

```javascript
// validateEthReceived.js
// find the counter tx from L1 in L2
var ixL2 = l2ListTxs.findIndex((txL2) => {
  return (
    txL2.from == txL1.from &&
    txL2.to == txL1.to &&
    txL2.amount == txL1.amount
  );
});

// if found, remove them from the array validation
if (ixL2 !== -1) {
  l1ListTxs.splice(i, 1);
  l2ListTxs.splice(ixL2, 1);
  return true;
}

// if not found, make sure it has not passed more than the expect time
var timePassed = Date.now() - txL1.timestamp;
if (timePassed > TIME_MARGIN_SAFETY) return false;
```


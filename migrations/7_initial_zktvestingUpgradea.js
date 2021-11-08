const ZKT = artifacts.require("ZKT");
const Timer = artifacts.require("Timer");
const ZKTVesting = artifacts.require("ZKTVesting2");
const ZKTVestingUpgradeableProxy = artifacts.require("ZKTVestingUpgradeableProxy");

const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

module.exports = async function (deployer, network, accounts) {

  console.log("network =", network);
  console.log("accounts =", accounts);

  // accounts
  let owner;
  let proxyAdmin;
  let proxyAdmin = accounts[0];
  if (network == "test" || network == "ganache"){
    owner = accounts[1];
    proxyAdmin = accounts[2];
  } else if (network == "rinkeby"){
    owner = "0xFcdd477dEA9e591A5E508e967264c1c98a821742";
  }


  // proxy init params
  const abiEncodeData = web3.eth.abi.encodeFunctionCall({
      "inputs": [
        {
          "internalType": "address",
          "name": "token_",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "timer_",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "owner_",
          "type": "address"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }, ['0x02C0a5C02b126BD5e0ae1E548a22EA68Fe0D8478', '0x13ebef615187691b08a75417099f6e8f1920fde3', owner]);

    let   zktVestingUpgradeableProxyInstance = ZKTVestingUpgradeableProxy.at('0x3085B6B9791a75289a19F90A9DA1a223cC31F0Ea');
    
    let ret = zktVestingUpgradeableProxyInstance.upgradeToAndCall('0xCe19732dd62fb2E39e4611c4dc8c9684C5FF8e0b', abiEncodeData, {from: proxyAdmin});
    console.log('ret:', ret);
//   // deploy proxy
//   await deployer.deploy(ZKTVestingUpgradeableProxy, zktVestingInstance.address, proxyAdmin, abiEncodeData);
//   let zktVestingUpgradeableProxyInstance = await ZKTVestingUpgradeableProxy.deployed();
//   console.log("zktVesting proxy address =", zktVestingUpgradeableProxyInstance.address);
//   console.log("zktVesting proxy admin() =", await zktVestingUpgradeableProxyInstance.admin.call({from: proxyAdmin}));
//   console.log("zktVesting proxy implementation() =", await zktVestingUpgradeableProxyInstance.implementation.call({from: proxyAdmin}));
};
const ZKT = artifacts.require("ZKT");
const Timer = artifacts.require("Timer");
const ZKTDeposit = artifacts.require("ZKTDeposit");
const ZKTDepositUpgradeableProxy = artifacts.require("ZKTDepositUpgradeableProxy");

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
  let deployerAccount = accounts[0];
  if (network == "test" || network == "ganache"){
    owner = accounts[1];
    proxyAdmin = accounts[2];
  } else if (network == "rinkeby"){
    owner = "0x020C6F69cB8e4930946593D364ba7c12d5dA4901";
    proxyAdmin = "0xD9F36a916045E9865CA4502Aa9ab4324F6948ff8";
  }

  // deployed zkt
  let zktInstance = await ZKT.deployed();

  let timerAddress = constants.ZERO_ADDRESS;
  if (network == "test" || network == "ganache" || network == "rinkeby"){
    // deploy timer contract for test
    await deployer.deploy(Timer);
    let timerInstance = await Timer.deployed();
    timerAddress = timerInstance.address;
  }

  await deployer.deploy(ZKTDeposit, zktInstance.address, timerAddress);
  let zktDepositInstance = await ZKTDeposit.deployed();
  // log
  console.log("timer address=", timerAddress);
  console.log("zktDeposit address=", zktDepositInstance.address);

  // transfer ownerships
  console.log("zktDeposit owner()=", await zktDepositInstance.owner());
  await zktDepositInstance.transferOwnership(owner,{from: deployerAccount});
  console.log("zktDeposit new owner =", await zktDepositInstance.owner());

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
  }, [zktInstance.address, timerAddress, owner]);

  // deploy proxy
  await deployer.deploy(ZKTDepositUpgradeableProxy, zktDepositInstance.address, proxyAdmin, abiEncodeData);
  let zktDepositUpgradeableProxyInstance = await ZKTDepositUpgradeableProxy.deployed();
  console.log("zktDeposit proxy address =", zktDepositUpgradeableProxyInstance.address);
  console.log("zktDeposit proxy admin() =", await zktDepositUpgradeableProxyInstance.admin.call({from: proxyAdmin}));
  console.log("zktDeposit proxy implementation() =", await zktDepositUpgradeableProxyInstance.implementation.call({from: proxyAdmin}));
};
const ZKT = artifacts.require("ZKT");
const Timer = artifacts.require("Timer");
const ZKTVesting = artifacts.require("ZKTVesting");
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
  await deployer.deploy(ZKTVesting, zktInstance.address, timerAddress);
  let zktVestingInstance = await ZKTVesting.deployed();
  // log
  console.log("timer address=", timerAddress);
  console.log("zktVesting address=", zktVestingInstance.address);

  // transfer ownerships
  console.log("zktVesting owner()=", await zktVestingInstance.owner());
  await zktVestingInstance.transferOwnership(owner,{from: deployerAccount});
  console.log("zktVesting new owner =", await zktVestingInstance.owner());

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
  await deployer.deploy(ZKTVestingUpgradeableProxy, zktVestingInstance.address, proxyAdmin, abiEncodeData);
  let zktVestingUpgradeableProxyInstance = await ZKTVestingUpgradeableProxy.deployed();
  console.log("zktVesting proxy address =", zktVestingUpgradeableProxyInstance.address);
  console.log("zktVesting proxy admin() =", await zktVestingUpgradeableProxyInstance.admin.call({from: proxyAdmin}));
  console.log("zktVesting proxy implementation() =", await zktVestingUpgradeableProxyInstance.implementation.call({from: proxyAdmin}));
};
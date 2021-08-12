const ZKT = artifacts.require("ZKT");
const Timer = artifacts.require("Timer");
const ZKTWhiteList = artifacts.require("ZKTWhiteList");
const ZKTWhiteListUpgradeableProxy = artifacts.require("ZKTWhiteListUpgradeableProxy");

const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

module.exports = async function (deployer, network, accounts) {

  console.log("network =", network);
  // console.log("accounts =", accounts);

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
  console.log("zkt address =", zktInstance.address);

  // deploy zktr
  await deployer.deploy(ZKT, "ZKTR", "ZKTR", 200000, owner);
  let zktrInstance = await ZKT.deployed({as: "ZKTR"});
  console.log("zktr address =", zktrInstance.address);

  let timerAddress = constants.ZERO_ADDRESS;
  if (network == "test" || network == "ganache" || network == "rinkeby"){
    // deploy timer contract for test
    await deployer.deploy(Timer);
    let timerInstance = await Timer.deployed();
    timerAddress = timerInstance.address;
  }

  await deployer.deploy(ZKTWhiteList, zktInstance.address, zktrInstance.address, timerAddress);
  let zktWhiteListInstance = await ZKTWhiteList.deployed();

  // log
  console.log("timer address=", timerAddress);
  console.log("zktWhiteList address=", zktWhiteListInstance.address);

  // transfer ownerships
  console.log("zktWhiteList owner()=", await zktWhiteListInstance.owner());
  await zktWhiteListInstance.transferOwnership(owner,{from: deployerAccount});
  console.log("zktWhiteListtr new owner =", await zktWhiteListInstance.owner());

  // proxy init params
  const abiEncodeData = web3.eth.abi.encodeFunctionCall({
    "inputs": [
      {
        "internalType": "address",
        "name": "zktToken_",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "zktrToken_",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "timerAddress_",
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
  }, [zktInstance.address, zktrInstance.address, timerAddress, owner]);

  // deploy proxy
  await deployer.deploy(ZKTWhiteListUpgradeableProxy, zktWhiteListInstance.address, proxyAdmin, abiEncodeData);
  let zktWhiteListUpgradeableProxyInstance = await ZKTWhiteListUpgradeableProxy.deployed();
  console.log("zktWhiteList proxy address =", zktWhiteListUpgradeableProxyInstance.address);
  console.log("zktWhiteList proxy admin() =", await zktWhiteListUpgradeableProxyInstance.admin.call({from: proxyAdmin}));
  console.log("zktWhiteList proxy implementation() =", await zktWhiteListUpgradeableProxyInstance.implementation.call({from: proxyAdmin}));
};
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
    }, ['0x02C0a5C02b126BD5e0ae1E548a22EA68Fe0D8478', '0x67149190Ee41d37F7A3DA2da631BCAb3c4E95147', owner]);

    let   zktVestingUpgradeableProxyInstance = await ZKTVestingUpgradeableProxy.at('0x3085B6B9791a75289a19F90A9DA1a223cC31F0Ea');
    
    let ret = await zktVestingUpgradeableProxyInstance.upgradeToAndCall('0xaB988Bc25CA2C8b15f16B25fCD3B717F8BF809A2', abiEncodeData, {from: proxyAdmin});
    console.log('ret:', ret);
//   // deploy proxy
//   await deployer.deploy(ZKTVestingUpgradeableProxy, zktVestingInstance.address, proxyAdmin, abiEncodeData);
//   let zktVestingUpgradeableProxyInstance = await ZKTVestingUpgradeableProxy.deployed();
//   console.log("zktVesting proxy address =", zktVestingUpgradeableProxyInstance.address);
//   console.log("zktVesting proxy admin() =", await zktVestingUpgradeableProxyInstance.admin.call({from: proxyAdmin}));
//   console.log("zktVesting proxy implementation() =", await zktVestingUpgradeableProxyInstance.implementation.call({from: proxyAdmin}));
};
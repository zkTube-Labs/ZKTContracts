const ZKT = artifacts.require("ZKT");
const Timer = artifacts.require("Timer");
const ZKTVesting3 = artifacts.require("ZKTVesting3");
const ZKTVestingUpgradeableProxy = artifacts.require("ZKTVestingUpgradeableProxy");

const {
  constants,    // Common constants, like the zero address and largest integers
} = require('@openzeppelin/test-helpers');

module.exports = async function (deployer, network, accounts) {

  console.log("network =", network);
  console.log("accounts =", accounts);
  let zktAddress = '0x608f24C2739f6C71188Ab6CB3934D173f5969eFC';
  // accounts
  let owner;
  let deployerAccount = accounts[0];
  if (network == "test" || network == "ganache"){
    owner = accounts[1];
  } else if (network == "rinkeby"){
    owner = "0xFcdd477dEA9e591A5E508e967264c1c98a821742";
  }

  let timerAddress = constants.ZERO_ADDRESS;
  if (network == "test" || network == "ganache" || network == "rinkeby"){
    // deploy timer contract for test
    await deployer.deploy(Timer);
    let timerInstance = await Timer.deployed();
    timerAddress = timerInstance.address;
  }
  await deployer.deploy(ZKTVesting3, zktAddress, timerAddress);
  let zktVestingInstance = await ZKTVesting3.deployed();
  // log
  console.log("timer address=", timerAddress);
  console.log("zktVesting3 address=", zktVestingInstance.address);

  // transfer ownerships
  console.log("zktVesting3 owner()=", await zktVestingInstance.owner());
  await zktVestingInstance.transferOwnership(owner,{from: deployerAccount});
  console.log("zktVesting3 new owner =", await zktVestingInstance.owner());
};
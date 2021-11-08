const ZKT = artifacts.require("ZKT");
const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

module.exports = async function (deployer, network, accounts) {

  console.log("network =", network);
  console.log("accounts =", accounts);

  let zktOwner;
  if (network == "test" || network == "ganache"){
    zktOwner = accounts[1];
  } else if (network == "rinkeby"){
    zktOwner = "0xFcdd477dEA9e591A5E508e967264c1c98a821742";
  }

  // deploy zkt
  await deployer.deploy(ZKT, "ZKT", "ZKT", 200000, zktOwner);
  let zktInstance = await ZKT.deployed();

  // log
  console.log("zkt address =", zktInstance.address);
};
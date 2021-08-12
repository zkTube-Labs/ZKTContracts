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
    zktOwner = "0x020C6F69cB8e4930946593D364ba7c12d5dA4901";
  }

  // deploy zkt
  await deployer.deploy(ZKT, "ZKT", "ZKT", 200000, zktOwner);
  let zktInstance = await ZKT.deployed();

  // log
  console.log("zkt address =", zktInstance.address);
};
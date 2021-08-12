const ZKT = artifacts.require("ZKT");
const ZKTMint = artifacts.require("ZKTMint");

module.exports = async function (deployer, network, accounts) {
  console.log("network=", network);
  console.log("accounts=", accounts);

  let deployerAccount = accounts[0];
  if (network == "rinkeby"){
      bossAccount = "0xEd3c8092f09B08EA05E6a7B31132B4314EAcEcd1";   // test-rinkeby
    // bossAccount = "0xbDc2DEC9bFb38aF26Ce280D7854DC430fE806C27";  //zktube-rinkeby
    //   bossAccount = "0x3013dF492D79715F7FA284b45471672F0dbe77d6";   // rinkeby lance
  } else {
    bossAccount = accounts[1];
  }

  console.log("deployerAccount=", deployerAccount);
  console.log("bossAccount=", bossAccount);

  // deployed zkt
  let zktInstance = await ZKT.deployed();

  // deploy zktmint
  await deployer.deploy(ZKTMint, zktInstance.address);
  let zktMintInstance = await ZKTMint.deployed();

  // log
  console.log("zktMintInstance.address=", zktMintInstance.address);
  console.log("zktMintInstance.owner()=", await zktMintInstance.owner());

  // transfer ownership
  await zktMintInstance.transferOwnership(bossAccount,{from: deployerAccount});
  console.log("ztkMintInstance new owner =", await zktMintInstance.owner());
};

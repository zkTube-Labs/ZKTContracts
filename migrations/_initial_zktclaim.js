const ZKT = artifacts.require("ZKT");
const ZKTClaim = artifacts.require("ZKTClaim");

module.exports = async function (deployer, network, accounts) {
  console.log("network=", network);
  console.log("accounts=", accounts);

  let deployerAccount = accounts[0];
  if (network == "rinkeby"){
      bossAccount = "0x820eCA885B16cfa83827d8f6F8dD7845c8402814";   // test-rinkeby
    // bossAccount = "0xbDc2DEC9bFb38aF26Ce280D7854DC430fE806C27";  //zktube-rinkeby
  } else {
    bossAccount = accounts[1];
  }

  console.log("deployerAccount=", deployerAccount);
  console.log("bossAccount=", bossAccount);

  // deploy zktclaim
  await deployer.deploy(ZKTClaim);
  let zktClaimInstance = await ZKTClaim.deployed();

  // log
  console.log("zktClaimInstance.address=", zktClaimInstance.address);
  console.log("zktClaimInstance.owner()=", await zktClaimInstance.owner());

  // transfer ownership
  await zktClaimInstance.transferOwnership(bossAccount,{from: deployerAccount});
  console.log("zktClaimInstance new owner =", await zktClaimInstance.owner());
};

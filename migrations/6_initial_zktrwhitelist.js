const ZKT = artifacts.require("ZKT");
const ZKTRWhiteList = artifacts.require("ZKTRWhiteList");
const ZKTRWhiteListUpgradeableProxy = artifacts.require("ZKTRWhiteListUpgradeableProxy");

module.exports = async function (deployer, network, accounts) {

  console.log("network =", network);
  // console.log("accounts =", accounts);

  // accounts
  let owner = '0x376f9f609f387D227F2F506165043805779d1013';
  let proxyAdmin = '0x376f9f609f387D227F2F506165043805779d1013';
  let deployerAccount = accounts[0];
  let srcTokenAddress = '0x05C11E99d646cA5530DD2E4Ab82023d3A4f39647'; // zktc contract
  let zktrAddress = '0xc53d46fd66edeb5d6f36e53ba22eee4647e2cdb2';
  if (network == "test" || network == "ganache"){
    owner = accounts[1];
    proxyAdmin = accounts[2];
        // deployed zktc
    await deployer.deploy(ZKT, "ZKTC", "ZKTC", 200000, owner);
    let zktcInstance = await ZKT.deployed({as: "ZKTC"});
    console.log("zktc address =", zktcInstance.address);
    srcTokenAddress = zktcInstance.address;
    // deployed zktr
    await deployer.deploy(ZKT, "ZKTR", "ZKTR", 200000, owner);
    let zktrInstance = await ZKT.deployed({as: "ZKTR"});
    console.log("zktr address =", zktrInstance.address);
    zktrAddress = zktrInstance.address;

  } else if (network == "rinkeby"){
    owner = "0x376f9f609f387D227F2F506165043805779d1013";
    proxyAdmin = "0x376f9f609f387D227F2F506165043805779d1013";
    srcTokenAddress = '0xdbf8b2a2475f1d226f3b1bfc679df837b9c63027' // zktt contract
    // zktrAddress = '0xc53d46fd66edeb5d6f36e53ba22eee4647e2cdb2';
    await deployer.deploy(ZKT, "ZKTR", "ZKTR", 200000, owner);
    let zktrInstance = await ZKT.deployed({as: "ZKTR"});
    console.log("zktr address =", zktrInstance.address);
    zktrAddress = zktrInstance.address;
  }

  await deployer.deploy(ZKTRWhiteList, zktrAddress, srcTokenAddress);
  let zktrWhiteListInstance = await ZKTRWhiteList.deployed();

  // log
  console.log("ZKTRWhiteList address=", zktrWhiteListInstance.address);

  // transfer ownerships
  console.log("ZKTRWhiteList owner()=", await zktrWhiteListInstance.owner());
  await zktrWhiteListInstance.transferOwnership(owner,{from: deployerAccount});
  console.log("ZKTRWhiteList new owner =", await zktrWhiteListInstance.owner());

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
        "name": "owner_",
        "type": "address"
      }
    ],
    "name": "initialize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, [zktrAddress, srcTokenAddress, owner]);

  // deploy proxy
  await deployer.deploy(ZKTRWhiteListUpgradeableProxy, zktrWhiteListInstance.address, proxyAdmin, abiEncodeData);
  let ZKTRWhiteListUpgradeableProxyInstance = await ZKTRWhiteListUpgradeableProxy.deployed();
  console.log("ZKTRWhiteList proxy address =", ZKTRWhiteListUpgradeableProxyInstance.address);
  console.log("ZKTRWhiteList proxy admin() =", await ZKTRWhiteListUpgradeableProxyInstance.admin.call({from: proxyAdmin}));
  console.log("ZKTRWhiteList proxy implementation() =", await ZKTRWhiteListUpgradeableProxyInstance.implementation.call({from: proxyAdmin}));
};
const ZKT = artifacts.require("ZKT");
const ZKTRWhiteList = artifacts.require("ZKTRWhiteList");
const ZKTRWhiteListUpgradeableProxy = artifacts.require("ZKTRWhiteListUpgradeableProxy");

module.exports = async function (deployer, network, accounts) {

  console.log("network =", network);
  // console.log("accounts =", accounts);

  // accounts
  let owner;
  let proxyAdmin;
  let deployerAccount = accounts[0];
  let srcTokenAddress = ''; // zktc contract
  let zktrAddress = '';
  if (network == "test" || network == "ganache"){
    owner = accounts[0];
    proxyAdmin = accounts[1];
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
    owner = "0x0f94d7eF39476EcBcd9137fd4534E0c3041738d7";
    proxyAdmin = "0x5f71aC553fcEBcCB0Aed4428B04B77cf9379Ae38";
    // srcTokenAddress = '0x7A67a4512FED021AdA97949f75175Cb4Ad269ACF' // zktt contract
    // zktrAddress = '0x42339Eb7C4de26A5ad669a3A9f4cf08D7C1ba2f2';
    await deployer.deploy(ZKT, "ZKTC", "ZKTC", 200000, owner);
    let zktcInstance = await ZKT.deployed({as: "ZKTC"});
    console.log("zktc address =", zktcInstance.address);
    srcTokenAddress = zktcInstance.address;
    // deployed zktr
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
const fs = require('fs');
var web3 = require("./tools.js").web3;
var testAccounts = require("./web3_accounts.js").testAccounts;

const sleep = () => new Promise((res, rej) => setTimeout(res, 1000));

const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

// abi
var abi_zkt = JSON.parse(fs.readFileSync('./abi/zkt.json'));
var abi_zktDeposit = JSON.parse(fs.readFileSync('./abi/zktDeposit.json'));

// contract addr
const zktAddr = "0x86d1A8cDA016D5A2d83F1980214eDbB34FAAfbFc";
const depositAddr = "0x9935cbE00a5b4a067Edc2eD83ad1297292263576";   //proxy

// contract instance
const zktContract = new web3.eth.Contract(abi_zkt, zktAddr);
const zktDepositContract = new web3.eth.Contract(abi_zktDeposit, depositAddr);

// account
const ownerAccount = "0x020C6F69cB8e4930946593D364ba7c12d5dA4901";

const oneToken = new BN(10).pow(new BN(18));

async function getBalance(address){
    return await web3.eth.getBalance(address);
}

async function queryBalances(){
    console.log("");
    console.log("query ether");
    console.log("zktAddr balance =", web3.utils.fromWei(await getBalance(zktAddr), 'ether'));
    console.log("depositAddr balance =", web3.utils.fromWei(await getBalance(depositAddr), 'ether'));
    console.log("ownerAccount balance =", web3.utils.fromWei(await getBalance(ownerAccount), 'ether'));
}

async function queryTokens(){
    console.log("");
    console.log("query token");
    console.log("zktAddr token amount =", new BN((await zktContract.methods.balanceOf(zktAddr).call())).div(oneToken).toString());
    console.log("depositAddr token amount =", new BN((await zktContract.methods.balanceOf(depositAddr).call())).div(oneToken).toString());
    console.log("ownerAccount token amount =", new BN((await zktContract.methods.balanceOf(ownerAccount).call())).div(oneToken).toString());
}

async function queryUserTokens(user){
    console.log("");
    console.log("query user");
    console.log("user address =", user);
    console.log("user token amount =", new BN(await zktContract.methods.balanceOf(user).call({from: user})).div(oneToken).toString());
    console.log("user zktdeposit-available amount =", new BN(await zktDepositContract.methods.available(user).call({from: user})).div(oneToken).toString());
    console.log("user zktdeposit-balance amount =", new BN(await zktDepositContract.methods.balanceOf(user).call({from: user})).div(oneToken).toString());
}

async function udpateLockTime(){
    console.log("lockTime =", (await zktDepositContract.methods.lockTime().call()).toString());
    await zktDepositContract.methods.updateLockTime(3).send({from: ownerAccount, gas: 9000000});
    console.log("lockTime =", (await zktDepositContract.methods.lockTime().call()).toString());
}

async function deposit(user){
    console.log("zktdeposit-balance =", (await zktDepositContract.methods.balanceOf(user).call()).toString());
    console.log("zktdeposit-available =", (await zktDepositContract.methods.available(user).call()).toString());

    console.log("approve ...");
    await zktContract.methods.approve(depositAddr, new BN(10).mul(oneToken)).send({from: ownerAccount, gas: 9000000});
    console.log("zktdeposit ...");
    await zktDepositContract.methods.deposit(new BN(10).mul(oneToken)).send({from: ownerAccount, gas: 9000000});

    console.log("zktdeposit-balance =", (await zktDepositContract.methods.balanceOf(user).call()).toString());
    console.log("zktdeposit-available =", (await zktDepositContract.methods.available(user).call()).toString());

}

async function test(){
    // await queryBalances();
    // await queryTokens();
    // await queryUserTokens(ownerAccount);
    // await udpateLockTime();
    // await zktdeposit(ownerAccount);
    // console.log("");
    // console.log("test over !!!");
}

test();
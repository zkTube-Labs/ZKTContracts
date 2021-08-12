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
var abi_zktVesting = JSON.parse(fs.readFileSync('./abi/zktVesting.json'));
// contract addr
const zktAddr = "0x026B5f165880e428FD47ED0602b5E1498ED0b8Cf";     // rinkeby
const vestingAddr = "0x76F97D399cDaf6a6E7018ffACcfE063B82F2870E";  // rinkeby

// const zktAddr = "0xDf2eeE6Bed97c89E830A84b0c4424BB9A7C9F4b2";     // localhost
// const vestingAddr = "0x2D5c01134C48A8D46b223cDF1462EFE8fE9836c7";  // localhost

// contract instance
const zktContract = new web3.eth.Contract(abi_zkt, zktAddr);
const zktVestingContract = new web3.eth.Contract(abi_zktVesting, vestingAddr);

// account
const ownerAccount = "0x020C6F69cB8e4930946593D364ba7c12d5dA4901";   // rinkeby

// const ownerAccount = "0x4Dc1A325364970fCeC5C6e5f5625D3B62Ce48044";   // localhost

const oneToken = (new BN(10)).pow(new BN(18));

async function getBalance(address){
    return await web3.eth.getBalance(address);
}

async function queryBalances(){
    console.log("");
    console.log("query ether");
    console.log("zktAddr balance =", web3.utils.fromWei(await getBalance(zktAddr), 'ether'));
    console.log("vestingAddr balance =", web3.utils.fromWei(await getBalance(vestingAddr), 'ether'));
    console.log("ownerAccount balance =", web3.utils.fromWei(await getBalance(ownerAccount), 'ether'));
}

async function queryTokens(){
    console.log("");
    console.log("query token");
    console.log("zktAddr token amount =", new BN((await zktContract.methods.balanceOf(zktAddr).call())).div(oneToken).toString());
    console.log("vestingAddr token amount =", new BN((await zktContract.methods.balanceOf(vestingAddr).call())).div(oneToken).toString());
    console.log("ownerAccount token amount =", new BN((await zktContract.methods.balanceOf(ownerAccount).call())).div(oneToken).toString());
}

async function queryUserTokens(user){
    console.log("");
    console.log("query reward");
    console.log("user address =", user);
    console.log("user available amount =", new BN(await zktVestingContract.methods.available(user).call({from: user})).div(oneToken).toString());
    console.log("user remain amount =", new BN(await zktVestingContract.methods.remain(user).call({from: user})).div(oneToken).toString());
    console.log("user cumulativeWithdrawals amount =", new BN(await zktVestingContract.methods.cumulativeWithdrawals(user).call({from: user})).div(oneToken).toString());
}

async function batchSend(users, amounts, memeo){
    console.log("");
    console.log(users.length, " users");
    console.log(users.length, " users start test !!! Date.now()=", Date.now(), "ms");
    let resp = await zktVestingContract.methods.batchReward(users, amounts, memeo).send({from: ownerAccount, gas: 9000000});
    console.log("gasUsed =", resp.gasUsed);
    console.log(users.length, " users test over !!! Date.now()=", Date.now(), "ms");
}

async function test() {

    // transfer
    // local account
    // console.log(await web3.eth.getAccounts());
    // await queryBalances();
    await queryTokens();
    await queryUserTokens(ownerAccount);
    // owner->contract transfer 100000 tokens
    await zktContract.methods.transfer(vestingAddr, new BN(100000).mul(oneToken)).send({from: ownerAccount});
    await queryTokens();

    // batchReward
    let users = [];
    let amounts = [];
    for (let i = 0; i < testAccounts.length; i++) {
        users.push(testAccounts[i].address)
        amounts.push(oneToken);
    }
    try{
        await batchSend(users.slice(0,1), amounts.slice(0,1), "test");
        await batchSend(users.slice(1,11), amounts.slice(1,11), "test");
        // await batchSend(users.slice(11,111), amounts.slice(11,111), "test");
        // await batchSend(users.slice(111,1111), amounts.slice(111,1111), "test");
    }catch(e){
        console.log( e );
    }
    console.log("");
    console.log("test over !!!");
}

test();
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
const zktAddr = "0xDE6C8b360D808b51785C5A6D6Da366D0469C79A1";
const vestingAddr = "0xC18aeBddcFeFA72c47E7Ca15b0d30c7AE4288d35";   //proxy

// contract instance
const zktContract = new web3.eth.Contract(abi_zkt, zktAddr);
const zktVestingContract = new web3.eth.Contract(abi_zktVesting, vestingAddr);

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
    console.log(users.length, " users batch");
    let resp = await zktVestingContract.methods.batchReward(users, amounts, memeo).send({from: ownerAccount, gas: 9000000});
    console.log("gasUsed =", resp.gasUsed);
    console.log("");
}

async function testTransfer(){
    try{
        // console.log(await web3.eth.getAccounts());
        // await queryBalances();
        await queryTokens();
        await queryUserTokens(ownerAccount);
        // owner->contract transfer 100000 tokens
        await zktContract.methods.transfer(vestingAddr, new BN(100000).mul(oneToken)).send({from: ownerAccount});
        await queryTokens();
    }catch(e){
        console.log(e);
    }
}

async function testBatchSend() {
    let users = [];
    let amounts = [];
    for (let i = 0; i < testAccounts.length; i++) {
        users.push(testAccounts[i].address)
        amounts.push(oneToken);
    }
    try{
        await batchSend(users.slice(0,1), amounts.slice(0,1), "test");
        await batchSend(users.slice(1,11), amounts.slice(1,11), "test");
        await batchSend(users.slice(11,111), amounts.slice(11,111), "test");
        // await batchSend(users.slice(111,1111), amounts.slice(111,1111), "test");
    }catch(e){
        console.log( e );
    }
}

async function testWidthdraw() {
    try{
        await batchSend([ownerAccount], [oneToken], "test");
        let resp = await zktVestingContract.methods.withdraw().send({from: ownerAccount, gas: 9000000});
        console.log("withdraw");
        console.log("gasUsed =", resp.gasUsed);
    }catch(e){
        console.log( e );
    }
}

async function test(){
    // await testTransfer();
    // await testBatchSend();

    await batchSend(["0x69F8E5485aEc92dE3F34A2663A09B494C37B5fc1","0x2A948Dd041c225e37c02a05d99541Bf673671E11"], [new BN(100).mul(oneToken), new BN(100).mul(oneToken)], "test reward");

    // testWidthdraw();

    console.log("");
    console.log("test over !!!");
}

test();
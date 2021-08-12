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
var abi_zktClaim = JSON.parse(fs.readFileSync('./abi/zktClaim.json'));
// contract addr
// const tokenAddr = "0x61dba64a77262C2544c9b6fc366689Df865158f7";  // rinkeby
// const claimAddr = "0xa47A3b816FA4887460a924b80105e31034c6F6aA";  // rinkeby

const tokenAddr = "0xb3F436B9D8086bE7e854b582cE7DEF4b42FeDEf4";     // localhost
const claimAddr = "0x5f247a4cd3Fd73890B220390219673D9Ef5017A7";  // localhost

// contract instance
const zktContract = new web3.eth.Contract(abi_zkt, tokenAddr);
const zktClaimContract = new web3.eth.Contract(abi_zktClaim, claimAddr);

// account
// const ownerAccount = "0x020C6F69cB8e4930946593D364ba7c12d5dA4901";   // rinkeby

const ownerAccount = "0x93aCe52293f79cC205a8645802E4d946816bEDa7";   // localhost

const oneToken = (new BN(10)).pow(new BN(18));

async function getBalance(address){
    return await web3.eth.getBalance(address);
}

async function batchSend(users, amounts, memeo){
    console.log("");
    console.log(users.length, " users");
    console.log(users.length, " users start test !!! Date.now()=", Date.now(), "ms");
    let resp = await zktClaimContract.methods.batchClaim(tokenAddr, users, amounts, memeo).send({from: ownerAccount, gas: 672197500000});
    console.log("gasUsed =", resp.gasUsed);
    console.log(users.length, " users test over !!! Date.now()=", Date.now(), "ms");
}

async function queryBalances(){
    console.log("");
    console.log("query ether");
    console.log("zktAddr balance =", web3.utils.fromWei(await getBalance(tokenAddr), 'ether'));
    console.log("vestingAddr balance =", web3.utils.fromWei(await getBalance(claimAddr), 'ether'));
    console.log("ownerAccount balance =", web3.utils.fromWei(await getBalance(ownerAccount), 'ether'));
}

async function queryTokens(){
    console.log("");
    console.log("query token");
    console.log("zktAddr token amount =", new BN((await zktContract.methods.balanceOf(tokenAddr).call())).div(oneToken).toString());
    console.log("vestingAddr token amount =", new BN((await zktContract.methods.balanceOf(claimAddr).call())).div(oneToken).toString());
    console.log("ownerAccount token amount =", new BN((await zktContract.methods.balanceOf(ownerAccount).call())).div(oneToken).toString());
}

async function test() {

    // transfer
    // local account
    console.log(await web3.eth.getAccounts());
    await queryBalances();
    await queryTokens();

    // owner->contract transfer 100000 tokens
    // await zktContract.methods.transfer(claimAddr, new BN(100000).mul(oneToken)).send({from: ownerAccount});
    // await queryTokens();
    //
    // batchReward
    let users = [];
    let amounts = [];
    for (let i = 0; i < testAccounts.length; i++) {
        users.push(testAccounts[i].address)
        amounts.push(oneToken);
    }
    try{
        await batchSend(users.slice(0,200), amounts.slice(0,200), "test");
    }catch(e){
        console.log( e );
    }
    console.log("");
    console.log("test over !!!");
}

test();
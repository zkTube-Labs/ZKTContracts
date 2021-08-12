const fs = require('fs');
var web3 = require("./tools.js").web3;
const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

// abi
var abi_zkt = JSON.parse(fs.readFileSync('./abi/zkt.json'));
var abi_zktMint = JSON.parse(fs.readFileSync('./abi/zktMint.json'));
// contract addr
const zktAddr = "0xE1ac74F8A7F9dF7C5a8210C16e94e28f1BE7e3C2";
const mintAddr = "0x6cF354504f6367bb06D4F2798e0982B82120C928";
// contract instance
zktContract = new web3.eth.Contract(abi_zkt, zktAddr);
zktMintContract = new web3.eth.Contract(abi_zktMint, mintAddr);

// account
const ownerAccount = "0xbDc2DEC9bFb38aF26Ce280D7854DC430fE806C27";

const oneToken = (new BN(10)).pow(new BN(18));

// const users = [
//     "0xEBcC87D5C0aB6aF5908c5893B66FC64FE17147E2"
//     ,"0x25DFfc81591f9fF80dE0f2a4A1413c09DE5C75B2"
//     ,"0x1c645194EA74377c97553E1E2ff27b49f85f607D"
//     ,"0x0C9aBA7F9Af69Ff8f7bBEE3CE667aF5bBC68A008"
//     ,"0xB95265c38bE44D551b77916aF54754098C09a442"
//     ,"0x1c645194EA74377c97553E1E2ff27b49f85f607D"
//     ,"0x721Aed7E711b7681088F60373Ca3b0FE3928703D"
//     ,"0x190618ee173a09272ea551cab2cd7afd7bc4ef44"
//     ,"0x1c645194EA74377c97553E1E2ff27b49f85f607D"
//     ,"0x1c645194EA74377c97553E1E2ff27b49f85f607D"
//     ,"0xCeDDaafCBF609a60Db44322E4CB82A0fc14Cf386"
//     ,"0xCeDDaafCBF609a60Db44322E4CB82A0fc14Cf386"
//     ,"0x1c645194EA74377c97553E1E2ff27b49f85f607D"
// ]
//
// const amounts = [
//     (new BN(0.15625*1000000)).mul(oneToken).div(new BN(1000000)),
//     (new BN(0.15625*1000000)).mul(oneToken).div(new BN(1000000)),
//     (new BN(14.375*1000000)).mul(oneToken).div(new BN(1000000)),
//     (new BN(0.3125*1000000)).mul(oneToken).div(new BN(1000000)),
//     (new BN(0.3125*1000000)).mul(oneToken).div(new BN(1000000)),
//     (new BN(12.1875*1000000)).mul(oneToken).div(new BN(1000000)),
//     (new BN(0.625*1000000)).mul(oneToken).div(new BN(1000000)),
//     (new BN(0.3125*1000000)).mul(oneToken).div(new BN(1000000)),
//     (new BN(36.25*1000000)).mul(oneToken).div(new BN(1000000)),
//     (new BN(0.625*1000000)).mul(oneToken).div(new BN(1000000)),
//     (new BN(0.3125*1000000)).mul(oneToken).div(new BN(1000000)),
//     (new BN(0.3125*1000000)).mul(oneToken).div(new BN(1000000)),
//     (new BN(2.5*1000000)).mul(oneToken).div(new BN(1000000))
// ]

async function getBalance(address){
    return await web3.eth.getBalance(address);
}

async function queryBalances(){
    console.log("");
    console.log("query ether");
    console.log("zktAddr balance =", web3.utils.fromWei(await getBalance(zktAddr), 'ether'));
    console.log("vestingAddr balance =", web3.utils.fromWei(await getBalance(vestingAddr), 'ether'));
    console.log("user1 balance =", web3.utils.fromWei(await getBalance(user1), 'ether'));
    console.log("ownerAccount balance =", web3.utils.fromWei(await getBalance(ownerAccount), 'ether'));
}

async function queryTokens(){
    console.log("");
    console.log("query token");
    console.log("zktAddr token amount =", new BN((await zktContract.methods.balanceOf(zktAddr).call())).div(oneToken).toString());
    console.log("mintAddr token amount =", new BN((await zktContract.methods.balanceOf(mintAddr).call())).div(oneToken).toString());
    console.log("ownerAccount token amount =", new BN((await zktContract.methods.balanceOf(ownerAccount).call())).div(oneToken).toString());
}

async function web3test(){
    // await queryTokens();
    // await zktMintContract.methods.batchMint(users, amounts, "minter reward").send({from: ownerAccount});

    // for(let i=0; i<amounts.length; i++){
    //     console.log(users[i] + "=", (await zktContract.methods.balanceOf(users[i]).call()).toString());
    // }
    // console.log("mintAddr token amount =", (await zktContract.methods.balanceOf(mintAddr).call()).toString());

    // console.log("over ------> ")
}

web3test();
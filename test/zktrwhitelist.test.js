const ZKT = artifacts.require("ZKT");
const ZKTRWhiteList = artifacts.require("ZKTRWhiteList");
const ZKTRWhiteListUpgradeableProxy = artifacts.require("ZKTRWhiteListUpgradeableProxy");

const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');


let oneToken = (new BN(10)).pow(new BN(18));

let bossAccount;
let user1;
let user2;
let user3;

let zktrInstance;
let zktcInstance;
let zktrWhiteListInstance;

async function deposit(user, tokenNum){
    let resp = await zktrWhiteListInstance.deposit(new BN(tokenNum).mul(oneToken), { from: user});
    // console.log("zktdeposit gasUsed =", resp.receipt.gasUsed);
}

contract("ZKTRWhiteList", async (accounts) => {
    bossAccount = accounts[0];
    user1 = accounts[3];
    user2 = accounts[4];
    user3 = accounts[5];
    user4 = accounts[6];

    beforeEach(async () => {

    })

    it("check balance", async () => {
        // let proxy = await ZKTRWhiteListUpgradeableProxy.deployed();
        // zktrWhiteListInstance = await ZKTRWhiteList.at(proxy.address);
        zktrWhiteListInstance = await ZKTRWhiteList.deployed();
        console.log("zktrWhiteListInstance.address =", zktrWhiteListInstance.address);
    
        let srcTokenAddress = await zktrWhiteListInstance.srcToken();
        console.log("srcTokenAddress =", srcTokenAddress);
        zktcInstance = await ZKT.at(srcTokenAddress);
    
        let zktrAddress = await zktrWhiteListInstance.zktrToken();
        console.log("zktrAddress =", zktrAddress);
        zktrInstance = await ZKT.at(zktrAddress);
        
        assert.equal((await zktcInstance.balanceOf(zktrWhiteListInstance.address)).toString(), "0");
        assert.equal((await zktrInstance.balanceOf(zktrWhiteListInstance.address)).toString(), "0");
        assert.equal((await zktcInstance.balanceOf(bossAccount)).toString(), (new BN(200000)).mul(oneToken).toString());
        assert.equal((await zktrInstance.balanceOf(bossAccount)).toString(), (new BN(200000)).mul(oneToken).toString());

        await zktcInstance.transfer(user1, new BN(1000).mul(oneToken), {from: bossAccount});
        await zktcInstance.transfer(user2, new BN(1000).mul(oneToken), {from: bossAccount});
        await zktcInstance.transfer(user3, new BN(300).mul(oneToken), {from: bossAccount});
        await zktcInstance.transfer(user4, new BN(300).mul(oneToken), {from: bossAccount});
        assert.equal((await zktcInstance.balanceOf(user1)).toString(), (new BN(1000)).mul(oneToken).toString());
        assert.equal((await zktcInstance.balanceOf(user2)).toString(), (new BN(1000)).mul(oneToken).toString());
        assert.equal((await zktcInstance.balanceOf(user3)).toString(), (new BN(300)).mul(oneToken).toString());
        assert.equal((await zktcInstance.balanceOf(user4)).toString(), (new BN(300)).mul(oneToken).toString());
    });

    it("check deposit", async () => {
        assert.equal((await zktrWhiteListInstance.whiteList()).addrs.toString(), "");
        assert.equal((await zktrWhiteListInstance.whiteList()).amounts, "");
        assert.equal((await zktrWhiteListInstance.round()).toString(), "1");

        await zktcInstance.approve(zktrWhiteListInstance.address, new BN(1000).mul(oneToken), {from: user1});
        await zktcInstance.approve(zktrWhiteListInstance.address, new BN(1000).mul(oneToken), {from: user2});
        assert.equal((await zktcInstance.allowance(user1, zktrWhiteListInstance.address)).toString(), new BN(1000).mul(oneToken).toString());
        assert.equal((await zktcInstance.allowance(user2, zktrWhiteListInstance.address)).toString(), new BN(1000).mul(oneToken).toString());

        await deposit(user1, 100);
        await deposit(user1, 100);
        await deposit(user2, 100);
        await deposit(user2, 100);

        assert.equal((await zktrWhiteListInstance.deposits(1, user1)).toString(), new BN(200).mul(oneToken).toString());
        assert.equal((await zktrWhiteListInstance.deposits(1, user2)).toString(), new BN(200).mul(oneToken).toString());

        assert.equal((await zktrWhiteListInstance.whiteList()).addrs.toString(), "0xb97C9007a7fF6E51B1dc836796b2d3357f75a6b3,0x5272f0dc2f106aa354C7e394c674B8dbd55002e0");
        assert.equal((await zktrWhiteListInstance.whiteList()).amounts.toString(), "2000000000000000000,2000000000000000000");
        assert.equal((await zktrWhiteListInstance.totalDeposits(1)).toString(), new BN(400).mul(oneToken).toString());
        assert.equal((await zktrWhiteListInstance.totalWhites(1)).toString(), new BN(4).mul(oneToken).toString());
    });

    it("pause", async () => {
        console.log("(await zktrWhiteListInstance.paused()).toString()=", (await zktrWhiteListInstance.paused()).toString());
        await zktrWhiteListInstance.pause({from: bossAccount});
        console.log("(await zktrWhiteListInstance.paused()).toString()=", (await zktrWhiteListInstance.paused()).toString());

        await zktcInstance.approve(zktrWhiteListInstance.address, new BN(300).mul(oneToken), {from: user4});
        assert.equal((await zktcInstance.allowance(user4, zktrWhiteListInstance.address)).toString(), new BN(300).mul(oneToken).toString());
        await expectRevert.unspecified(zktrWhiteListInstance.deposit(new BN(100).mul(oneToken), {from: user4}));
        assert.equal((await zktrWhiteListInstance.round()).toString(), "1");
    });

    it("unpause", async () => {
        await zktrWhiteListInstance.unpause({from: bossAccount});
        console.log("(await zktrWhiteListInstance.paused()).toString()=", (await zktrWhiteListInstance.paused()).toString());
        await zktrWhiteListInstance.deposit(new BN(100).mul(oneToken), {from: user4});
        assert.equal((await zktrWhiteListInstance.round()).toString(), "2");
        assert.equal((await zktrWhiteListInstance.deposits(2, user4)).toString(), new BN(100).mul(oneToken).toString());

        
        assert.equal((await zktrWhiteListInstance.whiteList()).addrs.toString(), "0x70B9110C85a76d17b6B1fA2eB169E9F62E9cF82F");
        assert.equal((await zktrWhiteListInstance.whiteList()).amounts.toString(), "1000000000000000000");
        assert.equal((await zktrWhiteListInstance.totalDeposits(2)).toString(), new BN(100).mul(oneToken).toString());
        assert.equal((await zktrWhiteListInstance.totalWhites(2)).toString(), new BN(1).mul(oneToken).toString());
    });
});

//update

const ZKT = artifacts.require("ZKT");
const ZKTWhiteList = artifacts.require("ZKTWhiteList");
const ZKTVestingUpgradeableProxy = artifacts.require("ZKTVestingUpgradeableProxy");

const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

let oneDay = 24 * 60 * 60;
let oneToken = (new BN(10)).pow(new BN(18));

let bossAccount;
let user1;
let user2;
let user3;

let zktInstance;
let zktrInstance;
let zktWhiteListInstance;


async function deposit(delayDays, user, tokenNum){
    if (delayDays > 0){
        await zktWhiteListInstance.setCurrentTime(( await zktWhiteListInstance.getCurrentTime()).add(new BN(oneDay*delayDays)));
    }
    let resp = await zktWhiteListInstance.deposit(new BN(tokenNum).mul(oneToken), { from: user});
    // console.log("zktdeposit gasUsed =", resp.receipt.gasUsed);
}

async function overDays(delayDays){
    if (delayDays > 0){
        await zktWhiteListInstance.setCurrentTime(( await zktWhiteListInstance.getCurrentTime()).add(new BN(oneDay*delayDays)));
    }
}

contract("ZKTWhiteList", async (accounts) => {

    bossAccount = accounts[1];
    user1 = accounts[3];
    user2 = accounts[4];
    user3 = accounts[5];
    user4 = accounts[6];

    beforeEach(async () => {

    })

    it("check balance", async () => {

        let proxy = await ZKTVestingUpgradeableProxy.deployed();
        zktWhiteListInstance = await ZKTWhiteList.at(proxy.address);
        console.log("zktWhiteListInstance.address =", zktWhiteListInstance.address);

        let zktAddress = await zktWhiteListInstance.zktToken();
        console.log("zktAddress =", zktAddress);
        zktInstance = await ZKT.at(zktAddress);

        let zktrAddress = await zktWhiteListInstance.zktrToken();
        console.log("zktrAddress =", zktrAddress);
        zktrInstance = await ZKT.at(zktrAddress);

        assert.equal((await zktInstance.balanceOf(zktWhiteListInstance.address)).toString(), "0");
        assert.equal((await zktrInstance.balanceOf(zktWhiteListInstance.address)).toString(), "0");
        assert.equal((await zktInstance.balanceOf(bossAccount)).toString(), (new BN(200000)).mul(oneToken).toString());
        assert.equal((await zktrInstance.balanceOf(bossAccount)).toString(), (new BN(200000)).mul(oneToken).toString());

        await zktrInstance.transfer(user1, new BN(1000).mul(oneToken), {from: bossAccount});
        await zktrInstance.transfer(user2, new BN(1000).mul(oneToken), {from: bossAccount});
        await zktrInstance.transfer(user3, new BN(300).mul(oneToken), {from: bossAccount});
        await zktrInstance.transfer(user4, new BN(300).mul(oneToken), {from: bossAccount});
        assert.equal((await zktrInstance.balanceOf(user1)).toString(), (new BN(1000)).mul(oneToken).toString());
        assert.equal((await zktrInstance.balanceOf(user2)).toString(), (new BN(1000)).mul(oneToken).toString());
        assert.equal((await zktrInstance.balanceOf(user3)).toString(), (new BN(300)).mul(oneToken).toString());
        assert.equal((await zktrInstance.balanceOf(user4)).toString(), (new BN(300)).mul(oneToken).toString());

        await zktInstance.transfer(zktWhiteListInstance.address, new BN(2000).mul(oneToken), {from: bossAccount});
        assert.equal((await zktInstance.balanceOf(zktWhiteListInstance.address)).toString(), (new BN(2000)).mul(oneToken).toString());
    });

    it("zktdeposit", async () => {
        assert.equal((await zktWhiteListInstance.available(user1)).toString(), "0");
        assert.equal((await zktWhiteListInstance.available(user2)).toString(), "0");
        assert.equal((await zktWhiteListInstance.deposits(user1)).toString(), "0");
        assert.equal((await zktWhiteListInstance.deposits(user2)).toString(), "0");
        assert.equal((await zktWhiteListInstance.withdrawals(user1)).toString(), "0");
        assert.equal((await zktWhiteListInstance.withdrawals(user2)).toString(), "0");

        await zktrInstance.approve(zktWhiteListInstance.address, new BN(1000).mul(oneToken), {from: user1});
        await zktrInstance.approve(zktWhiteListInstance.address, new BN(1000).mul(oneToken), {from: user2});
        assert.equal((await zktrInstance.allowance(user1, zktWhiteListInstance.address)).toString(), new BN(1000).mul(oneToken).toString());
        assert.equal((await zktrInstance.allowance(user2, zktWhiteListInstance.address)).toString(), new BN(1000).mul(oneToken).toString());

        await deposit(0, user1, 100);
        await deposit(0, user1, 100);
        await deposit(0, user2, 100);
        await deposit(0, user2, 100);

        assert.equal((await zktWhiteListInstance.available(user1)).toString(), new BN(0).mul(oneToken).toString());
        assert.equal((await zktWhiteListInstance.available(user2)).toString(), new BN(0).mul(oneToken).toString());
        assert.equal((await zktWhiteListInstance.deposits(user1)).toString(), new BN(200).mul(oneToken).toString());
        assert.equal((await zktWhiteListInstance.deposits(user2)).toString(), new BN(200).mul(oneToken).toString());
        assert.equal((await zktWhiteListInstance.withdrawals(user1)).toString(), new BN(0).mul(oneToken).toString());
        assert.equal((await zktWhiteListInstance.withdrawals(user2)).toString(), new BN(0).mul(oneToken).toString());
        assert.equal((await zktWhiteListInstance.totalDeposits()).toString(), new BN(400).mul(oneToken).toString());
        assert.equal((await zktWhiteListInstance.totalWithdrawals()).toString(), new BN(0).mul(oneToken).toString());
    });

    it("available", async () => {
        await overDays(1);
        assert.equal((await zktWhiteListInstance.available(user1)).toString(),  new BN(0).mul(oneToken).toString());
        assert.equal((await zktWhiteListInstance.available(user2)).toString(),  new BN(0).mul(oneToken).toString());
        await overDays(5);
        assert.equal((await zktWhiteListInstance.available(user1)).toString(),  new BN(0).mul(oneToken).toString());
        assert.equal((await zktWhiteListInstance.available(user2)).toString(),  new BN(0).mul(oneToken).toString());
        await overDays(1);
        assert.equal((await zktWhiteListInstance.available(user1)).toString(),  new BN(200).mul(oneToken).mul(new BN(1)).div(new BN(100)).toString());
        assert.equal((await zktWhiteListInstance.available(user2)).toString(),  new BN(200).mul(oneToken).mul(new BN(1)).div(new BN(100)).toString());

        await overDays(8*7);
        assert.equal((await zktWhiteListInstance.available(user1)).toString(),  new BN(200).mul(oneToken).mul(new BN(8)).div(new BN(100)).toString());
        assert.equal((await zktWhiteListInstance.available(user2)).toString(),  new BN(200).mul(oneToken).mul(new BN(8)).div(new BN(100)).toString());

        await overDays(1*30);
        assert.equal((await zktWhiteListInstance.available(user1)).toString(),  new BN(200).mul(oneToken).mul(new BN(10)).div(new BN(100)).toString());
        assert.equal((await zktWhiteListInstance.available(user2)).toString(),  new BN(200).mul(oneToken).mul(new BN(10)).div(new BN(100)).toString());
        await overDays(9*30);
        assert.equal((await zktWhiteListInstance.available(user1)).toString(),  new BN(200).mul(oneToken).mul(new BN(28)).div(new BN(100)).toString());
        assert.equal((await zktWhiteListInstance.available(user2)).toString(),  new BN(200).mul(oneToken).mul(new BN(28)).div(new BN(100)).toString());

        await overDays(1*30);
        assert.equal((await zktWhiteListInstance.available(user1)).toString(),  new BN(200).mul(oneToken).mul(new BN(31)).div(new BN(100)).toString());
        assert.equal((await zktWhiteListInstance.available(user2)).toString(),  new BN(200).mul(oneToken).mul(new BN(31)).div(new BN(100)).toString());

        await overDays(23*30);
        assert.equal((await zktWhiteListInstance.available(user1)).toString(),  new BN(200).mul(oneToken).mul(new BN(100)).div(new BN(100)).toString());
        assert.equal((await zktWhiteListInstance.available(user2)).toString(),  new BN(200).mul(oneToken).mul(new BN(100)).div(new BN(100)).toString());
    });

    it("withdraw", async () => {
        await zktWhiteListInstance.withdraw(new BN(1).mul(oneToken), {from: user1});
        assert.equal((await zktWhiteListInstance.available(user1)).toString(),  new BN(199).mul(oneToken).toString());
        assert.equal((await zktWhiteListInstance.withdrawals(user1)).toString(),  new BN(1).mul(oneToken).toString());
        assert.equal((await zktWhiteListInstance.totalWithdrawals()).toString(),  new BN(1).mul(oneToken).toString());

        await expectRevert.unspecified(zktWhiteListInstance.withdraw(new BN(200).mul(oneToken), {from: user1}));

        await zktWhiteListInstance.withdraw(new BN(199).mul(oneToken), {from: user1});
        assert.equal((await zktWhiteListInstance.available(user1)).toString(),  new BN(0).mul(oneToken).toString());
        assert.equal((await zktWhiteListInstance.withdrawals(user1)).toString(),  new BN(200).mul(oneToken).toString());
        assert.equal((await zktWhiteListInstance.totalWithdrawals()).toString(),  new BN(200).mul(oneToken).toString());
    });


    it("multi zktdeposit on different days", async () => {

        await zktrInstance.approve(zktWhiteListInstance.address, new BN(300).mul(oneToken), {from: user3});
        assert.equal((await zktrInstance.allowance(user3, zktWhiteListInstance.address)).toString(), new BN(300).mul(oneToken).toString());

        console.log("(await zktrInstance.balanceOf(user3))=",  (await zktrInstance.balanceOf(user3)).div(oneToken).toString());
        console.log("(await zktrInstance.balanceOf(zktWhiteListInstance))=",  (await zktrInstance.balanceOf(zktWhiteListInstance.address)).div(oneToken).toString());

        console.log("");
        await deposit(0, user3, 100);
        console.log("(await zktrInstance.balanceOf(user3))=",  (await zktrInstance.balanceOf(user3)).div(oneToken).toString());
        console.log("(await zktrInstance.balanceOf(zktWhiteListInstance))=",  (await zktrInstance.balanceOf(zktWhiteListInstance.address)).div(oneToken).toString());
        console.log("(await zktWhiteListInstance.deposits(user3))=",  (await zktWhiteListInstance.deposits(user3)).div(oneToken).toString());

        console.log("");
        await deposit(1, user3, 100);
        console.log("(await zktrInstance.balanceOf(user3))=",  (await zktrInstance.balanceOf(user3)).div(oneToken).toString());
        console.log("(await zktrInstance.balanceOf(zktWhiteListInstance))=",  (await zktrInstance.balanceOf(zktWhiteListInstance.address)).div(oneToken).toString());
        console.log("(await zktWhiteListInstance.deposits(user3))=",  (await zktWhiteListInstance.deposits(user3)).div(oneToken).toString());

        console.log("");
        await deposit(1, user3, 100);
        console.log("(await zktrInstance.balanceOf(user3))=",  (await zktrInstance.balanceOf(user3)).div(oneToken).toString());
        console.log("(await zktrInstance.balanceOf(zktWhiteListInstance))=",  (await zktrInstance.balanceOf(zktWhiteListInstance.address)).div(oneToken).toString());
        console.log("(await zktWhiteListInstance.deposits(user3))=",  (await zktWhiteListInstance.deposits(user3)).div(oneToken).toString());

        assert.equal((await zktWhiteListInstance.totalDeposits()).toString(),  new BN(700).mul(oneToken).toString());

        await overDays(5)
        assert.equal((await zktWhiteListInstance.available(user3)).toString(), new BN(100).mul(oneToken).mul(new BN(1)).div(new BN(100)).toString());
        await overDays(1)
        assert.equal((await zktWhiteListInstance.available(user3)).toString(), new BN(100).mul(oneToken).mul(new BN(2)).div(new BN(100)).toString());
        await overDays(1)
        assert.equal((await zktWhiteListInstance.available(user3)).toString(), new BN(100).mul(oneToken).mul(new BN(3)).div(new BN(100)).toString());

        let availTmp = new BN(100).mul(oneToken).mul(new BN(3)).div(new BN(100));
        let withdrawValue = new BN(1).mul(oneToken).div(new BN(2));
        await zktWhiteListInstance.withdraw(withdrawValue, {from: user3});
        assert.equal((await zktWhiteListInstance.withdrawals(user3)).toString(), withdrawValue.toString());
        assert.equal((await zktWhiteListInstance.available(user3)).toString(), availTmp.sub(withdrawValue).toString());
        // zkt
        assert.equal((await zktInstance.balanceOf(user3)).toString(), withdrawValue.toString());
    });

    it("paused", async () => {
        console.log("(await zktWhiteListInstance.paused()).toString()=", (await zktWhiteListInstance.paused()).toString());
        await zktWhiteListInstance.pause({from: bossAccount});
        console.log("(await zktWhiteListInstance.paused()).toString()=", (await zktWhiteListInstance.paused()).toString());

        await zktrInstance.approve(zktWhiteListInstance.address, new BN(300).mul(oneToken), {from: user4});
        assert.equal((await zktrInstance.allowance(user4, zktWhiteListInstance.address)).toString(), new BN(300).mul(oneToken).toString());
        await expectRevert.unspecified(zktWhiteListInstance.deposit(new BN(100).mul(oneToken), {from: user4}));

        await zktWhiteListInstance.unpause({from: bossAccount});
        console.log("(await zktWhiteListInstance.paused()).toString()=", (await zktWhiteListInstance.paused()).toString());
        await zktWhiteListInstance.deposit(new BN(100).mul(oneToken), {from: user4});
        assert.equal((await zktWhiteListInstance.deposits(user4)).toString(), new BN(100).mul(oneToken).toString());

    });
});

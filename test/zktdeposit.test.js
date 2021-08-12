const ZKT = artifacts.require("ZKT");
const ZKTDeposit = artifacts.require("ZKTDeposit");
const ZKTDepositUpgradeableProxy = artifacts.require("ZKTDepositUpgradeableProxy");

const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

let lockTime = new BN(4);
let oneDay = 24 * 60 * 60;
let oneToken = (new BN(10)).pow(new BN(18));

let bossAccount;
let user1;
let user2;

let zktInstance;
let zktDepositInstance;

async function deposit(delayDays, user, tokenNum){
    if (delayDays > 0){
        await zktDepositInstance.setCurrentTime(( await zktDepositInstance.getCurrentTime()).add(new BN(oneDay*delayDays)));
    }
    await zktInstance.approve(zktDepositInstance.address, new BN(tokenNum).mul(oneToken), {from: user});
    let resp = await zktDepositInstance.deposit(new BN(tokenNum).mul(oneToken), { from: user});
    console.log("zktdeposit gasUsed =", resp.receipt.gasUsed);
}

contract("test", async (accounts) => {

    bossAccount = accounts[1];
    user1 = accounts[3];
    user2 = accounts[4];
    user3 = accounts[5];
    user4 = accounts[6];
    user5 = accounts[7];
    user6 = accounts[8];

    it("token balance", async () => {
        // boss account
        zktInstance = await ZKT.deployed();
        assert.equal((await zktInstance.balanceOf(bossAccount)).toString(), (new BN(200000)).mul(oneToken).toString());

        // contract account
        let proxy = await ZKTDepositUpgradeableProxy.deployed();
        zktDepositInstance = await ZKTDeposit.at(proxy.address);

        // zktDepositInstance = await ZKTDeposit.deployed();
        assert.equal((await zktInstance.balanceOf(zktDepositInstance.address)).toString(), "0");

        // user
        assert.equal((await zktInstance.balanceOf(user1)).toString(), "0");
        assert.equal((await zktInstance.balanceOf(user2)).toString(), "0");
    });

    it("transfer", async () => {
        await zktInstance.transfer(user1, (new BN(1000)).mul(oneToken), { from: bossAccount})
        assert.equal((await zktInstance.balanceOf(user1)).toString(), (new BN(1000)).mul(oneToken).toString());

        await zktInstance.transfer(user2, (new BN(1000)).mul(oneToken), { from: bossAccount})
        assert.equal((await zktInstance.balanceOf(user1)).toString(), (new BN(1000)).mul(oneToken).toString());
    });

    it("updateLockTime", async () => {
        assert.equal((await zktDepositInstance.lockTime()).toString(), "90");
        await zktDepositInstance.updateLockTime(lockTime, {from: bossAccount});
        console.log("lockTime =", (await zktDepositInstance.lockTime()).toString());
        assert.equal((await zktDepositInstance.lockTime()).toString(), lockTime.toString());
    });

    it("zktdeposit", async () => {
        await deposit(0, user1, 10);
        await deposit(0, user1, 10);

        await deposit(1, user1, 10);
        await deposit(0, user1, 10);

        await deposit(1, user1, 10);
        await deposit(0, user1, 10);

        await deposit(1, user1, 10);
        await deposit(0, user1, 10);

        await deposit(1, user1, 10);
        await deposit(0, user1, 10);

        assert.equal((await zktDepositInstance.balanceOf(user1)).toString(), (new BN(100)).mul(oneToken).toString());
        assert.equal((await zktDepositInstance.available(user1)).toString(), (new BN(20)).mul(oneToken).toString());
        assert.equal((await zktInstance.balanceOf(user1)).toString(), (new BN(900)).mul(oneToken).toString());
    });

    it("withdraw", async () => {
        let resp = await zktDepositInstance.withdraw(new BN(10).mul(oneToken), {from: user1});
        console.log("withdraw gasUsed =", resp.receipt.gasUsed);

        assert.equal((await zktDepositInstance.balanceOf(user1)).toString(), (new BN(90)).mul(oneToken).toString());
        assert.equal((await zktDepositInstance.available(user1)).toString(), (new BN(10)).mul(oneToken).toString());
        assert.equal((await zktInstance.balanceOf(user1)).toString(), (new BN(910)).mul(oneToken).toString());

        resp = await zktDepositInstance.withdraw(new BN(10).mul(oneToken), {from: user1});
        console.log("withdraw gasUsed =", resp.receipt.gasUsed);
        assert.equal((await zktDepositInstance.balanceOf(user1)).toString(), (new BN(80)).mul(oneToken).toString());
        assert.equal((await zktDepositInstance.available(user1)).toString(), (new BN(0)).mul(oneToken).toString());
        assert.equal((await zktInstance.balanceOf(user1)).toString(), (new BN(920)).mul(oneToken).toString());

        await expectRevert.unspecified(zktDepositInstance.withdraw(new BN(10).mul(oneToken), {from: user1}));
    });


    // it("addFine", async () => {
    //     assert.equal((await zktDepositInstance.balanceOf(user1)).toString(), (new BN(80)).mul(oneToken).toString());
    //
    //     let resp = await zktDepositInstance.addFine(user1, new BN(10).mul(oneToken), "Dropped to punish", {from: bossAccount});
    //     console.log("addFine gasUsed =", resp.receipt.gasUsed);
    //     assert.equal((await zktDepositInstance.totalFines()).toString(), (new BN(10)).mul(oneToken).toString());
    //
    //     resp = await zktDepositInstance.addFine(user1, new BN(20).mul(oneToken), "Dropped to punish", {from: bossAccount});
    //     console.log("addFine gasUsed =", resp.receipt.gasUsed);
    //     assert.equal((await zktDepositInstance.totalFines()).toString(), (new BN(30)).mul(oneToken).toString());
    //
    //     assert.equal((await zktDepositInstance.balanceOf(user1)).toString(), (new BN(50)).mul(oneToken).toString());
    //
    //     resp = await zktDepositInstance.withdrawFine(user3, new BN(10).mul(oneToken), "test", {from: bossAccount});
    //     console.log("withdrawFine gasUsed =", resp.receipt.gasUsed);
    //     assert.equal((await zktInstance.balanceOf(user3)).toString(), (new BN(10)).mul(oneToken).toString());
    //
    //     assert.equal((await zktDepositInstance.totalDeposits()).toString(), (new BN(50)).mul(oneToken).toString());
    //
    //     await expectRevert.unspecified(zktDepositInstance.withdrawFine(user3, new BN(40).mul(oneToken), {from: bossAccount}))
    //     await expectRevert.unspecified(zktDepositInstance.withdrawFine(user3, new BN(10).mul(oneToken), {from: user2}));
    // });
});
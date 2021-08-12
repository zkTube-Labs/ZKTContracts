const ZKTVesting = artifacts.require("ZKTVesting");
const ZKTVestingUpgradeableProxy = artifacts.require("ZKTVestingUpgradeableProxy");
const ZKT = artifacts.require("ZKT");

const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

let oneToken = (new BN(10)).pow(new BN(18));
let oneDay = 24 * 60 * 60;

let bossAccount;
let user1;
let user2;
let user3;
let user4;
let user5;
let user6;

let amount1 = (new BN(200)).mul(oneToken);
let amount2 = (new BN(400)).mul(oneToken);
let amount3 = (new BN(800)).mul(oneToken);
let amount4 = (new BN(1000)).mul(oneToken);

let lockedPosition = new BN(65);
let duration = new BN(200);

let zktInstance;
let zktVestingInstance;

async function reward(delayDays){
    if (delayDays > 0){
        await zktVestingInstance.setCurrentTime(( await zktVestingInstance.getCurrentTime()).add(new BN(oneDay*delayDays)));
    }
    let tos = [user1, user2, user3, user4];
    let amounts = [amount1, amount2, amount3, amount4];
    let resp = await zktVestingInstance.batchReward(tos, amounts, "batch reward", {from: bossAccount});
    // console.log("resp =", resp);
    console.log("gasUsed =", resp.receipt.gasUsed);
}

async function rewardOneToken(delayDays){
    if (delayDays > 0){
        await zktVestingInstance.setCurrentTime(( await zktVestingInstance.getCurrentTime()).add(new BN(oneDay*delayDays)));
    }
    let tos = [user5, user6];
    let amounts = [oneToken, oneToken];
    let resp = await zktVestingInstance.batchReward(tos, amounts, "batch reward", {from: bossAccount});
    // console.log("resp =", resp);
    console.log("gasUsed =", resp.receipt.gasUsed);
}

function getAvailable(days, amount){
    if (days >= duration){
        return amount;
    } else {
        return  amount.mul(new BN(100).sub(lockedPosition)).div(new BN(100)).add(amount.mul(lockedPosition).div(new BN(100)).div(duration).mul(new BN(days)));
    }
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
        // zktVestingInstance = await ZKTVesting.deployed();
        let proxy = await ZKTVestingUpgradeableProxy.deployed();
        zktVestingInstance = await ZKTVesting.at(proxy.address);


        assert.equal((await zktInstance.balanceOf(zktVestingInstance.address)).toString(), "0");

        // user
        assert.equal((await zktInstance.balanceOf(user1)).toString(), "0");
        assert.equal((await zktInstance.balanceOf(user2)).toString(), "0");
        assert.equal((await zktInstance.balanceOf(user3)).toString(), "0");
        assert.equal((await zktInstance.balanceOf(user4)).toString(), "0");
    });

    it("owner->contract transfer 100000 tokens", async () => {
        await zktInstance.transfer(zktVestingInstance.address, (new BN(100000)).mul(oneToken), { from: bossAccount})
        assert.equal((await zktInstance.balanceOf(zktVestingInstance.address)).toString(), (new BN(100000)).mul(oneToken).toString());
    });

    it("contract->reward token not owner", async () => {
        await expectRevert.unspecified(
            zktVestingInstance.batchReward([user2,user3,user4], [oneToken,oneToken,oneToken], "batch reward", {from: user1})
        );
    });

    it("contract->user1、2、3、4 reward token", async () => {

        await zktVestingInstance.setCurrentTime(( await zktVestingInstance.getCurrentTime()));
        await reward(0);
        // console.log("t1=", (await zktVestzktVestingInstanceingInstance.getCurrentTime()).toString());

        // query available
        assert.equal((await zktVestingInstance.available(user1, {from: bossAccount})).toString(), (new BN(100).sub(lockedPosition)).mul(amount1).div(new BN(100)).toString());
        assert.equal((await zktVestingInstance.available(user2, {from: bossAccount})).toString(), (new BN(100).sub(lockedPosition)).mul(amount2).div(new BN(100)).toString());
        assert.equal((await zktVestingInstance.available(user3, {from: bossAccount})).toString(), (new BN(100).sub(lockedPosition)).mul(amount3).div(new BN(100)).toString());
        assert.equal((await zktVestingInstance.available(user4, {from: bossAccount})).toString(), (new BN(100).sub(lockedPosition)).mul(amount4).div(new BN(100)).toString());

        // query remain
        assert.equal((await zktVestingInstance.remain(user1, {from: bossAccount})).toString(), amount1.toString());
        assert.equal((await zktVestingInstance.remain(user2, {from: bossAccount})).toString(), amount2.toString());
        assert.equal((await zktVestingInstance.remain(user3, {from: bossAccount})).toString(), amount3.toString());
        assert.equal((await zktVestingInstance.remain(user4, {from: bossAccount})).toString(), amount4.toString());
    });

    it("contract->user1、2、3、4 continuous reward token", async () => {
        // continuous reward
        await reward(1);
        await reward(1);
        await reward(1);
        await reward(1);
        await reward(96);
        await reward(100);

        // console.log("t2=", (await zktVestingInstance.getCurrentTime()).toString());
        // console.log((await zktVestingInstance.availableAmounts(user1)).toString());
        // for(let i=0; i<200; i++){
        //     let tmp = await zktVestingInstance.vestings(user1,web3.utils.toHex(i));
        //     if (tmp[0].toString() != "0"){
        //         console.log("");
        //         console.log("i=", i);
        //         console.log(tmp[0].toString());
        //         console.log(tmp[1].toString());
        //         console.log(tmp[2].toString());
        //     }
        // }

        // query available
        let avail = amount1.add(getAvailable(0, amount1)).add(getAvailable(100, amount1))
            .add(getAvailable(196, amount1)).add(getAvailable(197, amount1)).add(getAvailable(198, amount1)).add(getAvailable(199, amount1));
        assert.equal((await zktVestingInstance.available(user1, {from: bossAccount})).toString(), avail.toString());

        avail = amount2.add(getAvailable(0, amount2)).add(getAvailable(100, amount2))
            .add(getAvailable(196, amount2)).add(getAvailable(197, amount2)).add(getAvailable(198, amount2)).add(getAvailable(199, amount2));
        assert.equal((await zktVestingInstance.available(user2, {from: bossAccount})).toString(), avail.toString());

        avail = amount3.add(getAvailable(0, amount3)).add(getAvailable(100, amount3))
            .add(getAvailable(196, amount3)).add(getAvailable(197, amount3)).add(getAvailable(198, amount3)).add(getAvailable(199, amount3));
        assert.equal((await zktVestingInstance.available(user3, {from: bossAccount})).toString(), avail.toString());

        avail = amount4.add(getAvailable(0, amount4)).add(getAvailable(100, amount4))
            .add(getAvailable(196, amount4)).add(getAvailable(197, amount4)).add(getAvailable(198, amount4)).add(getAvailable(199, amount4));
        assert.equal((await zktVestingInstance.available(user4, {from: bossAccount})).toString(), avail.toString());

        // query remain
        assert.equal((await zktVestingInstance.remain(user1, {from: bossAccount})).toString(), amount1.mul(new BN(7)).toString());
        assert.equal((await zktVestingInstance.remain(user2, {from: bossAccount})).toString(), amount2.mul(new BN(7)).toString());
        assert.equal((await zktVestingInstance.remain(user3, {from: bossAccount})).toString(), amount3.mul(new BN(7)).toString());
        assert.equal((await zktVestingInstance.remain(user4, {from: bossAccount})).toString(), amount4.mul(new BN(7)).toString());
    });

    it("user1、2、3、4 withdraw", async () => {

        // query balance
        assert.equal((await zktInstance.balanceOf(user1)).toString(), "0");
        assert.equal((await zktInstance.balanceOf(user2)).toString(), "0");
        assert.equal((await zktInstance.balanceOf(user3)).toString(), "0");
        assert.equal((await zktInstance.balanceOf(user4)).toString(), "0");

        let resp = await zktVestingInstance.withdraw({from: user1});
        console.log("user1 withdraw gasUsed =", resp.receipt.gasUsed);
        resp = await zktVestingInstance.withdraw({from: user2});
        console.log("user2 withdraw gasUsed =", resp.receipt.gasUsed);
        resp = await zktVestingInstance.withdraw({from: user3});
        console.log("user3 withdraw gasUsed =", resp.receipt.gasUsed);
        resp = await zktVestingInstance.withdraw({from: user4});
        console.log("user4 withdraw gasUsed =", resp.receipt.gasUsed);

        // query balance
        let avail = amount1.add(getAvailable(0, amount1)).add(getAvailable(100, amount1))
            .add(getAvailable(196, amount1)).add(getAvailable(197, amount1)).add(getAvailable(198, amount1)).add(getAvailable(199, amount1));
        assert.equal((await zktInstance.balanceOf(user1)).toString(), avail.toString());

        avail = amount2.add(getAvailable(0, amount2)).add(getAvailable(100, amount2))
            .add(getAvailable(196, amount2)).add(getAvailable(197, amount2)).add(getAvailable(198, amount2)).add(getAvailable(199, amount2));
        assert.equal((await zktInstance.balanceOf(user2)).toString(), avail.toString());

        avail = amount3.add(getAvailable(0, amount3)).add(getAvailable(100, amount3))
            .add(getAvailable(196, amount3)).add(getAvailable(197, amount3)).add(getAvailable(198, amount3)).add(getAvailable(199, amount3));
        assert.equal((await zktInstance.balanceOf(user3)).toString(), avail.toString());

        avail = amount4.add(getAvailable(0, amount4)).add(getAvailable(100, amount4))
            .add(getAvailable(196, amount4)).add(getAvailable(197, amount4)).add(getAvailable(198, amount4)).add(getAvailable(199, amount4));
        assert.equal((await zktInstance.balanceOf(user4)).toString(), avail.toString());

        // query available
        assert.equal((await zktVestingInstance.available(user1, {from: bossAccount})).toString(), "0");
        assert.equal((await zktVestingInstance.available(user2, {from: bossAccount})).toString(), "0");
        assert.equal((await zktVestingInstance.available(user3, {from: bossAccount})).toString(), "0");
        assert.equal((await zktVestingInstance.available(user4, {from: bossAccount})).toString(), "0");

        // query remain
        assert.equal((await zktVestingInstance.remain(user1, {from: bossAccount})).toString(), amount1.mul(new BN(7)).sub(await zktInstance.balanceOf(user1)).toString());
        assert.equal((await zktVestingInstance.remain(user2, {from: bossAccount})).toString(), amount2.mul(new BN(7)).sub(await zktInstance.balanceOf(user2)).toString());
        assert.equal((await zktVestingInstance.remain(user3, {from: bossAccount})).toString(), amount3.mul(new BN(7)).sub(await zktInstance.balanceOf(user3)).toString());
        assert.equal((await zktVestingInstance.remain(user4, {from: bossAccount})).toString(), amount4.mul(new BN(7)).sub(await zktInstance.balanceOf(user4)).toString());

        // query cumulativeWithdrawals
        assert.equal((await zktVestingInstance.cumulativeWithdrawals(user1, {from: bossAccount})).toString(), (await zktInstance.balanceOf(user1)).toString());
        assert.equal((await zktVestingInstance.cumulativeWithdrawals(user2, {from: bossAccount})).toString(), (await zktInstance.balanceOf(user2)).toString());
        assert.equal((await zktVestingInstance.cumulativeWithdrawals(user3, {from: bossAccount})).toString(), (await zktInstance.balanceOf(user3)).toString());
        assert.equal((await zktVestingInstance.cumulativeWithdrawals(user4, {from: bossAccount})).toString(), (await zktInstance.balanceOf(user4)).toString());
    });

    it("user1、2、3、4 withdraw again", async () => {
        await expectRevert.unspecified( zktVestingInstance.withdraw({from: user1}) );
        await expectRevert.unspecified( zktVestingInstance.withdraw({from: user2}) );
        await expectRevert.unspecified( zktVestingInstance.withdraw({from: user3}) );
        await expectRevert.unspecified( zktVestingInstance.withdraw({from: user4}) );
    });


    // it("reward n days", async () => {
    //
    //     console.log((await zktVestingInstance.available(user5, {from: bossAccount})).toString());
    //     let n = 200;
    //     console.log("n =", n);
    //
    //     for(let i = 0; i < n; i++){
    //         console.log("i --- >", i)
    //         await rewardOneToken(1);
    //     }
    //     let amount = amount1.mul(new BN(0));
    //     for(let i=0; i<n; i++){
    //         amount = amount.add(getAvailable(i, oneToken));
    //     }
    //     console.log("amount=", amount.toString());
    //     assert.equal((await zktVestingInstance.available(user5, {from: bossAccount})).toString(), amount.toString());
    // });
});
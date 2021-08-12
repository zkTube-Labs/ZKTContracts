const ZKTMint = artifacts.require("ZKTMint");
const ZKT = artifacts.require("ZKT");

const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

contract("test", async (accounts) => {
    let oneToken = new BN(10).pow(new BN(18));
    let t200000 = new BN(200000).mul(oneToken);
    let t10000 = new BN(10000).mul(oneToken);
    let t100 = new BN(100).mul(oneToken);
    let t9900 = new BN(9900).mul(oneToken);
    let t200 = new BN(200).mul(oneToken);
    let t300 = new BN(300).mul(oneToken);
    let t400 = new BN(400).mul(oneToken);
    let t9000 = new BN(9000).mul(oneToken);
    let t20 = new BN(20).mul(oneToken);
    let t2200 = new BN(2200).mul(oneToken);
    let t7000 = new BN(7000).mul(oneToken);

    let bossAccount = accounts[1];
    let user1 = accounts[2];
    let user2 = accounts[4];
    let user3 = accounts[5];
    let user4 = accounts[6];

    it("init amount", async () => {
        this.zktInstance = await ZKT.deployed();
        let balance = await this.zktInstance.balanceOf(bossAccount);
        assert.equal(balance.toString(), t200000.toString());
    });

    it("contract token amounts", async () => {
        this.zktMintInstance = await ZKTMint.deployed();
        let balance = await this.zktInstance.balanceOf(this.zktMintInstance.address);
        assert.equal(balance.toString(), "0");
    });

    it("transfer contract 10000 tokens", async () => {
        await this.zktInstance.transfer(this.zktMintInstance.address, t10000, { from: bossAccount})
        let balance = await this.zktInstance.balanceOf(this.zktMintInstance.address);
        assert.equal(balance.toString(), t10000.toString());
    });

    it("transfer user 100 tokens", async () => {
        await this.zktMintInstance.mint(user1, t100, "test mint", {from: bossAccount})
        let balance = await this.zktInstance.balanceOf(user1);
        assert.equal(balance.toString(), t100.toString());

        let contractBalance = await this.zktInstance.balanceOf(this.zktMintInstance.address);
        assert.equal(contractBalance.toString(), t9900.toString());
    });


    it("transfer user 100 tokens, not owner", async () => {
        await expectRevert.unspecified(
            this.zktMintInstance.mint(user1, t100, "测试挖矿奖励", {from: user2})
        );
    });

    it("batchMint", async () => {
        await this.zktMintInstance.batchMint([user2,user3,user4], [t200,t300,t400], "test mint", {from: bossAccount})
        assert.equal(( await this.zktInstance.balanceOf(user2)).toString(), t200.toString());
        assert.equal(( await this.zktInstance.balanceOf(user3)).toString(), t300.toString());
        assert.equal(( await this.zktInstance.balanceOf(user4)).toString(), t400.toString());
        assert.equal((await this.zktInstance.balanceOf(this.zktMintInstance.address)).toString(), t9000.toString());
    });

    it("batchMint, not owner", async () => {
        await expectRevert.unspecified(
            this.zktMintInstance.batchMint([user2,user3,user4], [t200,t300,t400], "test mint", {from: user2})
        );
    });

    it("batchMint 100 users", async () => {
        let tos = [];
        let amounts = [];
        for(let i=0; i<100; i++){
            tos.push(user2);
            amounts.push(t20);
        }
        await this.zktMintInstance.batchMint(tos, amounts, "test mint", {from: bossAccount})
        assert.equal(( await this.zktInstance.balanceOf(user2)).toString(), t2200.toString());
        assert.equal((await this.zktInstance.balanceOf(this.zktMintInstance.address)).toString(), t7000.toString());
    });

    it("zkt mint", async () => {
        let balance = await this.zktInstance.balanceOf(user3);
        await this.zktInstance.mint(user3, oneToken,{from: bossAccount});
        assert.equal((await this.zktInstance.balanceOf(user3)).toString(), (balance.add(oneToken)).toString());
    });

});
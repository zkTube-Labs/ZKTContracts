const ZKTClaim = artifacts.require("ZKTClaim");
const ZKT = artifacts.require("ZKT");

const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

let oneToken = (new BN(10)).pow(new BN(18));

contract("test", async (accounts) => {

    let bossAccount = accounts[1];
    let user1 = accounts[2];
    let user2 = accounts[4];
    let user3 = accounts[5];
    let user4 = accounts[6];

    it("init amount", async () => {
        this.zktInstance = await ZKT.deployed();
        let balance = await this.zktInstance.balanceOf(bossAccount);
        assert.equal(balance.toString(), new BN(200000).mul(oneToken).toString());
    });

    it("contract token amounts", async () => {
        this.zktClaimInstance = await ZKTClaim.deployed();
        let balance = await this.zktInstance.balanceOf(this.zktClaimInstance.address);
        assert.equal(balance.toString(), "0");
    });

    it("transfer contract 100000 tokens", async () => {
        await this.zktInstance.transfer(this.zktClaimInstance.address, new BN(100000).mul(oneToken), { from: bossAccount})
        let balance = await this.zktInstance.balanceOf(this.zktClaimInstance.address);
        assert.equal(balance.toString(), new BN(100000).mul(oneToken).toString());
    });

    // it("transfer user 100 tokens", async () => {
    //     await this.zktClaimInstance.claim(this.zktInstance.address, user1, new BN(100).mul(oneToken), "test claim", {from: bossAccount})
    //     let balance = await this.zktInstance.balanceOf(user1);
    //     assert.equal(balance.toString(), new BN(100).mul(oneToken).toString());
    //     let contractBalance = await this.zktInstance.balanceOf(this.zktClaimInstance.address);
    //     assert.equal(contractBalance.toString(), new BN(99900).mul(oneToken).toString());
    // });

    // it("transfer user 100 tokens, not owner", async () => {
    //     await expectRevert.unspecified(
    //         this.zktClaimInstance.claim(this.zktInstance.address, user1, new BN(100).mul(oneToken), "空投奖励", {from: user2})
    //     );
    // });

    it("batchClaim", async () => {
        await this.zktClaimInstance.batchClaim(this.zktInstance.address, [user2,user3,user4], [new BN(200).mul(oneToken),new BN(300).mul(oneToken),new BN(400).mul(oneToken)], "test claim", {from: bossAccount})
        assert.equal(( await this.zktInstance.balanceOf(user2)).toString(), new BN(200).mul(oneToken).toString());
        assert.equal(( await this.zktInstance.balanceOf(user3)).toString(), new BN(300).mul(oneToken).toString());
        assert.equal(( await this.zktInstance.balanceOf(user4)).toString(), new BN(400).mul(oneToken).toString());
        assert.equal((await this.zktInstance.balanceOf(this.zktClaimInstance.address)).toString(), new BN(99100).mul(oneToken).toString());
    });

    it("batchClaim, not owner", async () => {
        await expectRevert.unspecified(
            this.zktClaimInstance.batchClaim(this.zktInstance.address, [user2,user3,user4], [new BN(200).mul(oneToken),new BN(300).mul(oneToken),new BN(400).mul(oneToken)], "test claim", {from: user2})
        );
    });
});
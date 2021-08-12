const ZKT = artifacts.require("ZKT");

const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

let oneToken = (new BN(10)).pow(new BN(18));

let zktInstance;

contract("test", async (accounts) => {

    let bossAccount = accounts[1];
    let user1 = accounts[2];

    it("initialSupply", async () => {
        zktInstance = await ZKT.deployed();
        assert.equal( await zktInstance.balanceOf(bossAccount), new BN(200000).mul(oneToken).toString());
        assert.equal( await zktInstance.totalSupply(), new BN(200000).mul(oneToken).toString());
    });

    it("transfer", async () => {
        await zktInstance.transfer(user1, new BN(100000).mul(oneToken), { from: bossAccount})
        assert.equal((await zktInstance.balanceOf(user1)).toString(), new BN(100000).mul(oneToken).toString());
        assert.equal( await zktInstance.balanceOf(bossAccount), new BN(100000).mul(oneToken).toString());
    });

    it("burn", async () => {
        await zktInstance.burn(new BN(100000).mul(oneToken), { from: user1})
        assert.equal((await zktInstance.balanceOf(user1)).toString(), new BN(0).mul(oneToken).toString());
        assert.equal( await zktInstance.totalSupply(), new BN(100000).mul(oneToken).toString());
    });
});
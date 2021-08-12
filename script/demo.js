const fs = require('fs');
var Web3 = require("web3");
var web3 = new Web3('http://localhost:7545'); // your geth

const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

var gWei = new BN(10).pow(new BN(9));
var gasPrice = new BN(26).mul(gWei);
var etherPrice = 2000;

function caluGasFee(gasUsed){
    return web3.utils.fromWei(new BN(gasUsed).mul(gasPrice), "ether");
}

function test(gasUsed){
    gasFee = caluGasFee(gasUsed);
    console.log("gasFee=", gasFee + " ether");

    usdt = gasFee * etherPrice;
    console.log("usdt=", usdt);
}

test(6292329);

console.log("MINTER_ROLE=", web3.utils.sha3("MINTER_ROLE"));
console.log("PAUSER_ROLE=", web3.utils.sha3("PAUSER_ROLE"));

console.log(web3.utils.toHex(new BN(3209).mul(new BN(10).pow(new BN(16)))))


console.log(web3.utils.toBN(0x1bd5694fada490000).toString());
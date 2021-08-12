const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const fs = require('fs');

var web3;
var debug = true;

if (debug){
    web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
} else {
    const privateKey = fs.readFileSync("../../test_owner.key").toString().trim();
    const infuraKey = fs.readFileSync("../../infura_rinkeby.key").toString().trim();
    let provider = new HDWalletProvider(privateKey, "https://rinkeby.infura.io/v3/" + infuraKey);
    web3 = new Web3(provider);
}

module.exports = {web3: web3};
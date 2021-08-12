const fs = require('fs');
var Web3 = require("web3");
var web3 = new Web3('http://localhost:7545'); // your geth

var testAccounts = JSON.parse(fs.readFileSync('../../accounts.json').toString().trim());

function batchCreateAccount(){
    let accounts = [];
    for(let i=0; i<10000; i++){
        console.log("batchCreateAccount--->i=", i);
        let account = web3.eth.accounts.create();
        accounts.push({"address": account.address, "privateKey": account.privateKey})
    }
    fs.writeFileSync('../../accounts.json', JSON.stringify(accounts, null, 4));
    console.log("create account over !!!");
}

// batchCreateAccount();

console.log("testAccounts.length=", testAccounts.length);

module.exports = {testAccounts: testAccounts};
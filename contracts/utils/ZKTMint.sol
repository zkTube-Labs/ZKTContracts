// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ZKTMint is Ownable {

    using SafeERC20 for IERC20;

    IERC20 private token;

    constructor (address token_) {
        token = IERC20(token_);
    }

    event Mint(address indexed from, address indexed to, uint value, string memo);

    function mint(address to, uint amount, string calldata memo) public onlyOwner returns(bool){
        _mint(to, amount, memo);
        return true;
    }

    function batchMint(address[] calldata tos, uint[] calldata amounts, string calldata memo) public onlyOwner returns(bool){
        require(tos.length > 0, "ZKTMint: The length is zero");
        require(tos.length == amounts.length, "ZKTMint: Unequal length");
        for(uint i=0; i<tos.length; i++){
            _mint(tos[i], amounts[i], memo);
        }
        return true;
    }

    function _mint(address to, uint amount, string calldata memo) internal {
        require(to != address(0), "ZKTMint: mint to the zero address");
        require(token.balanceOf(address(this)) >= amount, "ZKTMint: amount exceeds balance");
        token.safeTransfer(to, amount);
        emit Mint(msg.sender, to, amount, memo);
    }
}

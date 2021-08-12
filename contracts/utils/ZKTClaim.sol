// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ZKTClaim is Ownable {

    using SafeERC20 for IERC20;

    event Claim(address indexed from, string memo);

    function batchClaim(address token, address[] calldata tos, uint[] calldata amounts, string calldata memo) public onlyOwner returns(bool){
        require(tos.length > 0, "ZKTClaim: The length is zero");
        require(tos.length == amounts.length, "ZKTClaim: Unequal length");
        require(token != address(0), "ZKTClaim: token is zero address");
        IERC20 erc20Token = IERC20(token);
        uint count = tos.length;
        for(uint i=0; i<count; i++){
            erc20Token.safeTransfer(tos[i], amounts[i]);
        }
        emit Claim(address(this), memo);
        return true;
    }
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ZKTVesting.sol";

contract ZKTVesting2 is ZKTVesting {
    function burnAccount (address account) external onlyOwner {
        avails[account] = 0;
        for(uint i = 0; i < DURATION; i++){
            Vesting storage vesting = vestings[account][i];
            if (vesting.total > 0){
                vesting.total = 0;
                vesting.released = 0;
                vesting.startDay = 0;
            }
        }
    }

    function kill() external onlyOwner {
        selfdestruct(msg.sender); // 销毁合约
    }
}
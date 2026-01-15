// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IDisputeManagerV2 {
    event DisputeParamsSet(uint256 openStake, uint16 resolutionFeeBps, uint256 cooldown);

    function isArbitrator(address a) external view returns (bool);
    function openStake() external view returns (uint256);
    function resolutionFeeBps() external view returns (uint16);
    function cooldown() external view returns (uint256);
}

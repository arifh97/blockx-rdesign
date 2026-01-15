// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IDisputeManagerV2} from "./interfaces/IDisputeManagerV2.sol";

contract DisputeManagerV2 is AccessControl, IDisputeManagerV2 {
    bytes32 public constant ARBITRATOR_ROLE = keccak256("ARBITRATOR_ROLE");

    uint256 public _openStake;
    uint16 public _resolutionFeeBps;
    uint256 public _cooldown;

    event ArbitratorGranted(address indexed a);

    constructor(address admin, uint256 openStake_, uint16 resolutionFeeBps_, uint256 cooldown_) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ARBITRATOR_ROLE, admin);
        _openStake = openStake_;
        _resolutionFeeBps = resolutionFeeBps_;
        _cooldown = cooldown_;
    }

    function setParams(uint256 openStake_, uint16 resolutionFeeBps_, uint256 cooldown_)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _openStake = openStake_;
        _resolutionFeeBps = resolutionFeeBps_;
        _cooldown = cooldown_;
        emit DisputeParamsSet(_openStake, _resolutionFeeBps, _cooldown);
    }

    function grantArbitrator(address a) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(ARBITRATOR_ROLE, a);
        emit ArbitratorGranted(a);
    }

    function isArbitrator(address a) external view returns (bool) {
        return hasRole(ARBITRATOR_ROLE, a);
    }

    function openStake() external view returns (uint256) {
        return _openStake;
    }

    function resolutionFeeBps() external view returns (uint16) {
        return _resolutionFeeBps;
    }

    function cooldown() external view returns (uint256) {
        return _cooldown;
    }
}

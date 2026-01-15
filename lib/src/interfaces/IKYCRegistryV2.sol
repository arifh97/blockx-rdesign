// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IKYCRegistryV2 {
    event KycUpdated(address indexed subject, uint8 level, uint64 expiry);

    struct Attestation {
        address subject;
        uint8 level; // 0 = NONE, 1 = L1, 2 = L2
        uint64 expiry; // unix seconds
        uint256 nonce; // per-subject nonce to prevent replay
    }

    function levelOf(address user) external view returns (uint8 level, uint64 expiry);
    function minLevelRequired(address user) external view returns (uint8);

    function setKyc(Attestation calldata att, bytes calldata sig) external;
    function revoke(address subject) external;
    function downgrade(address subject, uint8 newLevel) external;
}

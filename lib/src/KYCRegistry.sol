// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IKYCRegistryV2} from "./interfaces/IKYCRegistryV2.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract KYCRegistryV2 is AccessControl, IKYCRegistryV2 {
    bytes32 public constant ATTESTER_ROLE = keccak256("ATTESTER_ROLE");

    struct Record {
        uint8 level;
        uint64 expiry;
        uint256 nonce;
    }

    mapping(address => Record) private _records;

    bytes32 public constant ATTEST_TYPEHASH =
        keccak256("Attestation(address subject,uint8 level,uint64 expiry,uint256 nonce)");
    bytes32 private immutable _DOMAIN_SEPARATOR;

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ATTESTER_ROLE, admin);
        _DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("KYCRegistryV2")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    function DOMAIN_SEPARATOR() external view returns (bytes32) {
        return _DOMAIN_SEPARATOR;
    }

    function levelOf(address user) external view returns (uint8 level, uint64 expiry) {
        Record memory r = _records[user];
        return (r.level, r.expiry);
    }

    function minLevelRequired(
        address /*user*/
    )
        external
        pure
        returns (uint8)
    {
        return 0;
    } // hook if needed

    function setKyc(Attestation calldata att, bytes calldata sig) external {
        // anyone can submit for subject
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                _DOMAIN_SEPARATOR,
                keccak256(abi.encode(ATTEST_TYPEHASH, att.subject, att.level, att.expiry, att.nonce))
            )
        );
        address signer = ECDSA.recover(digest, sig);
        require(hasRole(ATTESTER_ROLE, signer), "NOT_ATTESTER");
        Record storage r = _records[att.subject];
        require(att.nonce > r.nonce, "STALE_ATTEST");
        r.level = att.level;
        r.expiry = att.expiry;
        r.nonce = att.nonce;
        emit KycUpdated(att.subject, att.level, att.expiry);
    }

    function revoke(address subject) external onlyRole(ATTESTER_ROLE) {
        _records[subject].level = 0;
        _records[subject].expiry = 0; // keep nonce
        emit KycUpdated(subject, 0, 0);
    }

    function downgrade(address subject, uint8 newLevel) external onlyRole(ATTESTER_ROLE) {
        require(newLevel < _records[subject].level, "NOT_DOWNGRADE");
        _records[subject].level = newLevel;
        emit KycUpdated(subject, newLevel, _records[subject].expiry);
    }
}

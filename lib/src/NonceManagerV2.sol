// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {INonceManagerV2} from "./interfaces/INonceManagerV2.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract NonceManagerV2 is Ownable, INonceManagerV2 {
    mapping(address => mapping(uint256 => bool)) public used;
    mapping(address => uint256) public minValid; // high-water mark
    mapping(address => bool) public isOperator; // authorized contracts (e.g., OrderBook)

    bytes32 public constant CANCEL_TYPEHASH = keccak256("CancelByHash(address user,bytes32 hash,uint256 nonce)");
    bytes32 private immutable _DOMAIN_SEPARATOR;

    constructor() Ownable(msg.sender) {
        _DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("NonceManagerV2")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    function DOMAIN_SEPARATOR() external view returns (bytes32) {
        return _DOMAIN_SEPARATOR;
    }

    function isUsed(address user, uint256 nonce) external view returns (bool) {
        return used[user][nonce] || nonce < minValid[user];
    }

    function minValidNonce(address user) external view returns (uint256) {
        return minValid[user];
    }

    modifier onlyOperator() {
        require(isOperator[msg.sender] || msg.sender == owner(), "NOT_AUTHORIZED");
        _;
    }

    function setOperator(address op, bool allowed) external onlyOwner {
        isOperator[op] = allowed;
    }

    function markUsed(address user, uint256 nonce) external onlyOperator {
        require(nonce >= minValid[user], "BELOW_MIN_VALID");
        require(!used[user][nonce], "NONCE_USED");
        used[user][nonce] = true;
        emit NonceUsed(user, nonce);
    }

    function cancelAllBefore(uint256 newMin) external {
        require(newMin > minValid[msg.sender], "NOOP");
        minValid[msg.sender] = newMin;
        emit CancelAllBefore(msg.sender, newMin);
    }

    function cancelByHash(bytes32 hash, bytes calldata sig) external {
        // user-signed message authorizing cancel for this hash (bid/order hash),
        // we emit event for indexers
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01", _DOMAIN_SEPARATOR, keccak256(abi.encode(CANCEL_TYPEHASH, msg.sender, hash, block.number))
            )
        );
        address signer = ECDSA.recover(digest, sig);
        require(signer == msg.sender, "BAD_SIG");
        emit CanceledByHash(msg.sender, hash);
    }
}

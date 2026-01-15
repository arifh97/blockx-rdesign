// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface INonceManagerV2 {
    event NonceUsed(address indexed user, uint256 indexed nonce);
    event CancelAllBefore(address indexed user, uint256 newMinValid);
    event CanceledByHash(address indexed user, bytes32 indexed hash);

    function isUsed(address user, uint256 nonce) external view returns (bool);
    function minValidNonce(address user) external view returns (uint256);

    function markUsed(address user, uint256 nonce) external; // callable by orderbook
    function cancelAllBefore(uint256 minValid) external; // user action
    function cancelByHash(bytes32 hash, bytes calldata sig) external; // gasless off-chain cancel
}

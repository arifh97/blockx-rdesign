// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IVault {
    event Deposit(address indexed user, address indexed token, uint256 amount, uint256 newBalance);
    event Withdraw(address indexed user, address indexed token, uint256 amount, uint256 newBalance);
    event Locked(bytes32 indexed orderId, address indexed user, address indexed token, uint256 amount);
    event Unlocked(bytes32 indexed orderId, address indexed user, address indexed token, uint256 amount);
    event TransferredLocked(
        bytes32 indexed orderId, address indexed from, address indexed to, address token, uint256 amount
    );

    function balanceOf(address user, address token) external view returns (uint256);
    function lockedOf(bytes32 orderId, address user, address token) external view returns (uint256);

    // Helper functions
    function totalBalanceOf(address user, address token) external view returns (uint256 available, uint256 totalLocked);
    function canLockAmount(address user, address token, uint256 amount) external view returns (bool);
    function getBalanceBreakdown(address user, address token)
        external
        view
        returns (uint256 available, uint256 walletBalance, uint256 vaultTotal);

    function deposit(address token, uint256 amount) external;
    function withdraw(address token, uint256 amount) external;

    // convenience with permit (EIP-2612) — optional for tokens supporting it
    function depositWithPermit(
        address token,
        uint256 amount,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    // Permit2 path can be provided via a separate router, if desired

    function lockForOrder(bytes32 orderId, address user, address token, uint256 amount) external;
    function unlockFromOrder(bytes32 orderId, address user, address token, uint256 amount) external;
    function transferLocked(bytes32 orderId, address from, address to, address token, uint256 amount) external;
}

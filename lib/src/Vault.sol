// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IVault} from "./interfaces/IVault.sol";

contract Vault is Ownable, IVault {
    using SafeERC20 for IERC20;

    constructor(address initialOwner) Ownable(initialOwner) {}

    // STORAGE LAYOUT
    // mapping(user => mapping(token => balance))
    mapping(address => mapping(address => uint256)) private _balances;
    // mapping(orderId => mapping(user => mapping(token => locked)))
    mapping(bytes32 => mapping(address => mapping(address => uint256))) private _locked;
    // authorized callers (OrderBook)
    mapping(address => bool) public isOperator;

    modifier onlyOperator() {
        require(isOperator[msg.sender], "NOT_OPERATOR");
        _;
    }

    function setOperator(address op, bool allowed) external onlyOwner {
        isOperator[op] = allowed;
    }

    function balanceOf(address user, address token) external view returns (uint256) {
        return _balances[user][token];
    }

    function lockedOf(bytes32 orderId, address user, address token) external view returns (uint256) {
        return _locked[orderId][user][token];
    }

    // Helper: Get total balance (available + all locked across orders)
    function totalBalanceOf(address user, address token)
        external
        view
        returns (uint256 available, uint256 totalLocked)
    {
        available = _balances[user][token];
        // Note: totalLocked across all orders requires tracking orderIds per user
        // For now, return available balance only. Use lockedOf() for specific orders.
        totalLocked = 0; // Would need additional storage to track efficiently
    }

    // Helper: Check if user has enough available balance for an order
    function canLockAmount(address user, address token, uint256 amount) external view returns (bool) {
        return _balances[user][token] >= amount;
    }

    // Helper: Get balance breakdown for UI display
    function getBalanceBreakdown(address user, address token)
        external
        view
        returns (uint256 available, uint256 walletBalance, uint256 vaultTotal)
    {
        available = _balances[user][token];
        walletBalance = IERC20(token).balanceOf(user);
        vaultTotal = IERC20(token).balanceOf(address(this));
    }

    function deposit(address token, uint256 amount) public {
        uint256 beforeBal = IERC20(token).balanceOf(address(this));
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        uint256 received = IERC20(token).balanceOf(address(this)) - beforeBal; // handles fee-on-transfer
        _balances[msg.sender][token] += received;
        emit Deposit(msg.sender, token, received, _balances[msg.sender][token]);
    }

    function withdraw(address token, uint256 amount) public {
        require(_balances[msg.sender][token] >= amount, "INSUFFICIENT_BAL");
        _balances[msg.sender][token] -= amount;
        IERC20(token).safeTransfer(msg.sender, amount);
        emit Withdraw(msg.sender, token, amount, _balances[msg.sender][token]);
    }

    function depositWithPermit(
        address token,
        uint256 amount,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        // Assumes token implements EIP-2612 permit
        // signature approves this vault for `value`, then we transferFrom `amount`.
        // interface minimal: function permit(owner, spender, value, deadline, v,r,s)
        (bool ok,) = token.call(
            abi.encodeWithSignature(
                "permit(address,address,uint256,uint256,uint8,bytes32,bytes32)",
                msg.sender,
                address(this),
                value,
                deadline,
                v,
                r,
                s
            )
        );
        require(ok, "PERMIT_FAIL");
        deposit(token, amount);
    }

    function lockForOrder(bytes32 orderId, address user, address token, uint256 amount) external onlyOperator {
        require(_balances[user][token] >= amount, "INSUFFICIENT_BAL");
        _balances[user][token] -= amount;
        _locked[orderId][user][token] += amount;
        emit Locked(orderId, user, token, amount);
    }

    function unlockFromOrder(bytes32 orderId, address user, address token, uint256 amount) external onlyOperator {
        require(_locked[orderId][user][token] >= amount, "INSUFFICIENT_LOCK");
        _locked[orderId][user][token] -= amount;
        _balances[user][token] += amount;
        emit Unlocked(orderId, user, token, amount);
    }

    function transferLocked(bytes32 orderId, address from, address to, address token, uint256 amount)
        external
        onlyOperator
    {
        require(_locked[orderId][from][token] >= amount, "INSUFFICIENT_LOCK");
        _locked[orderId][from][token] -= amount;
        IERC20(token).safeTransfer(to, amount);
        emit TransferredLocked(orderId, from, to, token, amount);
    }
}

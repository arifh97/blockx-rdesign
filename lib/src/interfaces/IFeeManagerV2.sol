// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IFeeManagerV2 {
    event FeeConfigSet(address indexed base, address indexed quote, uint16 makerBps, uint16 takerBps, uint256 minFixed);
    event FeeRecipientsSet(address[] recipients, uint16[] splitsBps);
    event FeesPaid(
        bytes32 indexed orderId,
        address indexed payer,
        address indexed token,
        uint256 amountTotal,
        address[] recipients,
        uint256[] amounts
    );

    struct FeeQuote {
        uint16 makerBps;
        uint16 takerBps;
        uint256 minFixed;
    }

    function recipients(uint256 index) external view returns (address);
    function splitsBps(uint256 index) external view returns (uint16);

    function quote(address base, address quote) external view returns (FeeQuote memory);
    function quoteExact(address base, address quote, bool isMaker, uint256 notional) external view returns (uint256);

    function computeAndEmit(
        bytes32 orderId,
        address payer,
        address token,
        address base,
        address quote,
        bool isMaker,
        uint256 notional
    ) external returns (uint256 totalFee, address[] memory recipients, uint256[] memory amounts);
}

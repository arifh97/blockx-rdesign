// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IFeeManagerV2} from "./interfaces/IFeeManagerV2.sol";

contract FeeManagerV2 is Ownable, IFeeManagerV2 {
    struct PairKey {
        address base;
        address quote;
    }

    struct PairFee {
        uint16 makerBps;
        uint16 takerBps;
        uint256 minFixed;
        bool set;
    }

    mapping(bytes32 => PairFee) public feeByPair; // keccak256(abi.encode(base,quote))

    address[] public recipients;
    uint16[] public splitsBps; // sums to 10000

    constructor(address initialOwner) Ownable(initialOwner) {}

    function _key(address base, address quote) internal pure returns (bytes32) {
        return keccak256(abi.encode(base, quote));
    }

    function setFee(address base, address _quote, uint16 makerBps, uint16 takerBps, uint256 minFixed)
        external
        onlyOwner
    {
        require(makerBps <= 10_000 && takerBps <= 10_000, "BPS_OOB");
        feeByPair[_key(base, _quote)] = PairFee(makerBps, takerBps, minFixed, true);
        emit FeeConfigSet(base, _quote, makerBps, takerBps, minFixed);
    }

    function setFeeRecipients(address[] calldata recips, uint16[] calldata splits) external onlyOwner {
        require(recips.length == splits.length && recips.length > 0, "BAD_SPLITS");
        uint256 sum;
        for (uint256 i; i < splits.length; i++) {
            sum += splits[i];
        }
        require(sum == 10_000, "SPLITS_NE_10000");
        recipients = recips;
        splitsBps = splits;
        emit FeeRecipientsSet(recips, splits);
    }

    function quote(address base, address quote) external view returns (FeeQuote memory fq) {
        PairFee memory pf = feeByPair[_key(base, quote)];
        if (pf.set) return FeeQuote(pf.makerBps, pf.takerBps, pf.minFixed);
        return FeeQuote(10, 20, 0); // defaults
    }

    function quoteExact(address base, address quote, bool isMaker, uint256 notional) external view returns (uint256) {
        PairFee memory pf = feeByPair[_key(base, quote)];
        uint256 bps = isMaker ? pf.makerBps : pf.takerBps;
        uint256 fee = (notional * bps) / 10_000;
        if (pf.minFixed > 0 && fee < pf.minFixed) fee = pf.minFixed;
        return fee;
    }

    function computeAndEmit(
        bytes32 orderId,
        address payer,
        address token,
        address base,
        address quote,
        bool isMaker,
        uint256 notional
    ) external returns (uint256 totalFee, address[] memory _rec, uint256[] memory _amts) {
        PairFee memory pf = feeByPair[_key(base, quote)];
        uint256 bps = isMaker ? pf.makerBps : pf.takerBps;
        totalFee = (notional * bps) / 10_000;
        if (pf.minFixed > 0 && totalFee < pf.minFixed) totalFee = pf.minFixed;
        uint256 n = recipients.length;
        _rec = new address[](n);
        _amts = new uint256[](n);
        for (uint256 i; i < n; i++) {
            _rec[i] = recipients[i];
            _amts[i] = (totalFee * splitsBps[i]) / 10_000;
        }
        emit FeesPaid(orderId, payer, token, totalFee, _rec, _amts);
    }
}

import { useMutation } from '@tanstack/react-query';
import { estimateFeesPerGas, estimateGas, getGasPrice } from '@wagmi/core';
import { useCallback } from 'react';
import { type Address, erc20Abi, formatEther, parseUnits, encodeFunctionData } from 'viem';
import { useAccount, useConfig } from 'wagmi';
import { NATIVE_TOKEN } from '@/lib/tokens';

export interface TransferParams {
  tokenAddress: Address;
  to: Address;
  amount: string;
  decimals: number;
}

export interface FeeEstimateResult {
  gasLimit: bigint;
  feePerGas: bigint; // maxFeePerGas (EIP-1559) or gasPrice (legacy)
  maxFeeWei: bigint; // gasLimit * feePerGas
  maxFeeEth: string;
  isEip1559: boolean;
}

export function useTransferFee() {
  const { address } = useAccount();
  const wagmiConfig = useConfig();

  const {
    mutateAsync: estimateAsync,
    isPending: isEstimating,
    error,
    data: fee
  } = useMutation({
    mutationFn: async (params: TransferParams): Promise<FeeEstimateResult> => {
      const { tokenAddress, to, amount, decimals } = params;

      if (!address) throw new Error('Wallet not connected');
      if (!amount || Number.parseFloat(amount) === 0) {
        throw new Error('Invalid amount');
      }

      const valueOrAmount = parseUnits(amount, decimals);

      // 1) GAS LIMIT
      let gasLimit: bigint;
      if (tokenAddress === NATIVE_TOKEN.address) {
        // Native transfer: plain value transfer
        gasLimit = await estimateGas(wagmiConfig, {
          account: address,
          to,
          value: valueOrAmount
        });
      } else {
        // ERC-20 transfer: encode calldata and estimate with to + data
        const data = encodeFunctionData({
          abi: erc20Abi,
          functionName: 'transfer',
          args: [to, valueOrAmount]
        });
        gasLimit = await estimateGas(wagmiConfig, {
          account: address,
          to: tokenAddress,
          data
        });
      }

      // 2) FEE PER GAS
      let feePerGas: bigint;
      let isEip1559 = false;
      try {
        const fees = await estimateFeesPerGas(wagmiConfig);
        if (fees.maxFeePerGas) {
          feePerGas = fees.maxFeePerGas;
          isEip1559 = true;
        } else if (fees.gasPrice) {
          feePerGas = fees.gasPrice;
        } else {
          feePerGas = await getGasPrice(wagmiConfig);
        }
      } catch {
        feePerGas = await getGasPrice(wagmiConfig);
      }

      // 3) MAX FEE
      const maxFeeWei = gasLimit * feePerGas;
      const maxFeeEth = formatEther(maxFeeWei);
      return { gasLimit, feePerGas, maxFeeWei, maxFeeEth, isEip1559 };
    }
  });

  const estimate = useCallback(
    async (params: TransferParams): Promise<FeeEstimateResult> => {
        try {
        return await estimateAsync(params);
        } catch (err) {
            if (err instanceof Error) console.error(err.message);
            throw err;
        }
    },
    [estimateAsync]
  );

  return {
    estimate,
    isLoading: isEstimating,
    error: error?.message || null,
    fee
  };
}

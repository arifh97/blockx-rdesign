import { parseUnits, formatUnits } from "viem"

/**
 * Converts a human-readable numeric value to bigint for smart contract calls
 * @param value - Human-readable value (e.g., "1.02", "100")
 * @param decimals - Token decimals (e.g., 18 for most tokens, 8 for price)
 * @returns BigInt value for contract calls
 */
export function toContractValue(value: string | number, decimals: number): bigint {
  return parseUnits(value.toString(), decimals)
}

/**
 * Converts a bigint value from smart contract to human-readable string
 * @param value - BigInt value from contract
 * @param decimals - Token decimals
 * @returns Human-readable string value
 */
export function fromContractValue(value: bigint, decimals: number): string {
  return formatUnits(value, decimals)
}

/**
 * Converts a human-readable price to bigint for contract calls
 * Price uses 8 decimals by convention
 */
export function priceToContract(price: string | number): bigint {
  return toContractValue(price, 8)
}

/**
 * Converts a contract price (bigint) to human-readable string
 * Price uses 8 decimals by convention
 */
export function priceFromContract(price: bigint): string {
  return fromContractValue(price, 8)
}

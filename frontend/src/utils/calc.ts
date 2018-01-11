
import { BigNumber } from 'api';

export function countPercentageGathered(amountInvested: BigNumber, amountWanted: BigNumber): number {
  return (amountInvested.times(100).dividedBy(amountWanted)).toNumber();;
}
export function countPercentageWanted(amountInvested: BigNumber, amountWanted: BigNumber): number {
  return (new BigNumber(100)).sub(amountInvested.times(100).dividedBy(amountWanted)).toNumber();;
}

export function formatBigNumber(number: BigNumber): string {
  return number.toNumber().toFixed(2);
}

export function formatPercentage(number: number): string {
  return number.toFixed(2);
}

export function permilsToPercentage(number: number): string {
  return (number / 10) + "%";
}

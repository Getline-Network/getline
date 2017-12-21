
import { BigNumber } from 'api';

export function countPercentageGathered(amountGathered: BigNumber, amountWanted: BigNumber): number {
  return (amountGathered.times(100).dividedBy(amountWanted)).toNumber();;
}
export function countPercentageWanted(amountGathered: BigNumber, amountWanted: BigNumber): number {
  return (new BigNumber(100)).sub(amountGathered.times(100).dividedBy(amountWanted)).toNumber();;
}

export function formatPercentage(number: number) {
  return number.toFixed(2);
}

export function permilsToPercentage(number: number): string {
  return (number / 10) + "%";
}

import { BigNumber } from 'api';

export function countPercentage(amountGathered: BigNumber, amountWanted: BigNumber): number {
  return (amountGathered.times(100).dividedBy(amountWanted)).toNumber();;
}
export function countPercentageRemaining(amountGathered: BigNumber, amountWanted: BigNumber): number {
  return (new BigNumber(100)).sub(amountGathered.times(100).dividedBy(amountWanted)).toNumber();;
}

export function formatPercentage(number: number) {
  return number.toFixed(2);
}

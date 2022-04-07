import { useWebWorker } from '../src';
import { useCallback, useMemo } from 'react';

const createHeftyFunctionWorker = () => new Worker(new URL('./heftyFunctionWorker.ts', import.meta.url));

type HeftyFunctionArgs = {
  arg1: string;
  arg2: string;
};

type HeftyFunctionResult = number;

export function useStronglyTypedHeftyFunction() {
  const arg1 = 'foo';
  const arg2 = 'bar';

  const workerCallback = useCallback(createHeftyFunctionWorker, []);
  const memoizedArgs = useMemo(() => ({ arg1, arg2 }), []);

  const { status, result, error } = useWebWorker<HeftyFunctionArgs, HeftyFunctionResult>(workerCallback, memoizedArgs);

  console.log(status, result, error);

  return result;
}

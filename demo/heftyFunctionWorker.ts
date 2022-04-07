import { registerWorker } from "../src";

const computationHeavyFunction = (input: {
  arg1: string;
  arg2: string;
}): number => {
  let sum = 0;
  const limit = 200000000;

  for (let i = 0; i < limit; i++) {
    if (i % 2 === 0) {
      sum += i;
    }
  }
  return sum;
};

registerWorker(computationHeavyFunction);

# react-usewebworker-hook

Wrap web workers in a React hook to use in your components. **react-usewebworker-hook** allows the developer to offload heavy computation that might lock up the main thread, which helps preserve a seamless user experience.

Returns the most recent web worker result along with a 'pending', 'resolved', 'stale', or 'rejected' status of the result's computation.

## Install

`npm install react-usewebworker-hook`

## How to use

### 1. Create a dedicated file that registers your computation heavy function as a worker.

**heftyFunctionWorker.ts**

```javascript
import { registerWorker } from "react-worker";

const computationHeavyFunction = (input: {
  arg1: string,
  arg2: string,
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
```

### 2. Write a callback that generates a worker from the dedicated file.

```javascript
const createHeftyFunctionWorker = () =>
  new Worker(new URL("./heftyFunctionWorker.ts", import.meta.url));
```

### 3. Pass a memoized version of your worker creator and input arguments to the useWebWorker hook

**useHeftyFunction.ts**

```javascript
import { useWebWorker } from "react-usewebworker-hook";
import { useCallback, useMemo } from "react";

const createHeftyFunctionWorker = () =>
  new Worker(new URL("./heftyFunctionWorker.ts", import.meta.url));

export default function useHeftyFunction() {
  const arg1 = "foo";
  const arg2 = "bar";

  const workerCallback = useCallback(createHeftyFunctionWorker, []);
  const memoizedArgs = useMemo(() => ({ arg1, arg2 }), []);

  const { status, result, error } = useWebWorker(workerCallback, memoizedArgs);

  console.log(status, result, error);

  return result;
}
```

## Use with Typescript

Optionally, you can provide type arguments to useWebWorker if you want your result to be strongly typed. There is no type guard, so type safety of the result relies on the implementation of the underlying worker function.

```javascript
import { useWebWorker } from 'react-usewebworker-hook';
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

```

## Contributing

### Issues / Bugs Requests

If you are having an issue with the existing project code, please submit a bug report under the following guidelines:

- Check first to see if your issue has already been reported.
- Check to see if the issue has recently been fixed by attempting to reproduce the issue using the latest master branch in the repository.
- Create a live example of the problem.
- Submit a detailed bug report including your environment & browser, steps to reproduce the issue, actual and expected outcomes, where you believe the issue is originating from, and any potential solutions you have considered.

### Feature Requests

Would love to hear about idea for improved features and functionality!

### Pull Requests

If you have developed a patch, bug fix, or new feature that would improve this library, please submit a pull request. Remember that this project is licensed under the MIT license, and by submitting a pull request, you agree that your work will be too.

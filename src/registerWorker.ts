/* eslint-disable no-restricted-globals */

/**
 * registerWorker
 *
 * registerWorker contains that code that runs inside of the web worker thread when a new Worker is created
 *
 * Notes:
 *
 * - The worker must be registered in a standlone file that can be used as the file location argument for 'new URL()'
 * - The purpose of registering a worker in React is too offload a computation-intensive function from the main thread
 * - The 'func' argment to registerWorker will run when the worker receives a message with data from the main thread
 * - The function must return a value
 * - The function result will be posted back to the main thread when complete
 * - registerWorker can be used in conjunction with useWebWorker from the react-workers library to track the status & state of the worker request
 *
 * Code Example:
 *
 * // heftyFunctionWorker.ts`
 * ```
 * import { registerWorker } from 'react-workers';
 *
 * const computationHeavyFunction = (input: { arg1: string; arg2: string }) => {
 *   let sum = 0;
 *   const limit = 200000000;
 *   for (let i = 0; i < limit; i++) {
 *      if (i % 2 === 0) {
 *        sum += i;
 *      }
 *   }
 *   return { input, sum };
 * };
 *
 * registerWorker(getAllFutureScheduleConflicts);
 * ```
 *
 * Next Steps:
 * - Write a worker creator callback like so:
 * ```
 * export const createFutureScheduleConflictsWorker = () => new Worker(new URL('./getFutureScheduleConflictsWorker.ts', import.meta.url));
 * ```
 *
 * - Use the 'createFutureScheduleConflictsWorker' as an argument to useWebWorker, profit
 */

export function registerWorker<Input, Result>(func: (data: Input) => Result) {
  self.onmessage = async (event: MessageEvent<Input>) => {
    const result = func(event.data);
    self.postMessage(result);
  };
}

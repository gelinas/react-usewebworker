import React, {
  useEffect,
  useLayoutEffect,
  useCallback,
  useReducer,
  useMemo,
  useRef,
} from "react";

/**
 * useWebWorker
 *
 * Returns the latest 'result' from the web worker along with a 'status' indicating whether a request is resolved, pending, stale, or in error state
 *
 * Takes two arguments:
 *
 * 1) a 'createWorker' callback that instantiates the web worker you want to offload computation to.
 * -- Should be wrapped in a useCallback() in the parent component to ensure referential equality
 *
 * 2) an 'input' argument that the web worker expects
 * -- if the input is not a type primitive, should be wrapped in a useMemo() in the parent component to ensure referential equlaity
 *
 */
export function useWebWorker<Input, Result>(
  createWorker: () => Worker,
  input: Input,
  initialState?: Partial<State<Result>>
) {
  const reducerState: State<Result> = {
    status: "idle",
    result: null,
    error: null,
    ...initialState,
  };

  const [state, unsafeDispatch] = useReducer<
    React.Reducer<State<Result>, Action<Result>>
  >(workerMessageReducer, reducerState);

  const dispatch = useSafeDispatch(unsafeDispatch);

  // creates & cleans up the worker when the component mounts/unmounts or if the createWorker function changes
  const worker = useMemo(createWorker, [createWorker]);
  const lastWorker = useRef<Worker>(worker);
  useEffect(() => {
    lastWorker.current = worker;
    worker.onmessage = (e) => dispatch({ type: "resolved", data: e.data });
    worker.onerror = () => {
      const error = new Error("Worker error");
      return dispatch({ type: "rejected", error });
    };
    worker.onmessageerror = () => {
      const error = new Error("Worker message error");
      return dispatch({ type: "rejected", error });
    };

    const cleanup = () => {
      worker.terminate();
    };

    return cleanup;
  }, [worker]);

  useEffect(() => {
    if (state.status === "resolved") {
      dispatch({ type: "stale" });
    } else {
      dispatch({ type: "pending" });
    }
    lastWorker.current.postMessage(input);
  }, [input]);

  return state;
}

/**
 * workerMessageReducer
 *
 * Provides a "pending" state after the main thread posts a message to the worker while awaiting a response
 * When the input changes, it preserves the previous result while awaiting an updated result
 * In the event of an error, preserves the previous result and updates the error attribute
 * */

type Action<T> =
  | { type: "idle" }
  | { type: "pending" } // signals transitions from 'idle' or 'rejected' to first 'resolved' state
  | { type: "stale" } // signals awaiting subsequent results after a frist result has been resolved
  | { type: "resolved"; data: T }
  | { type: "rejected"; error: Error | null };

type State<T> = {
  status: "idle" | "pending" | "stale" | "resolved" | "rejected";
  result: T | null;
  error: Error | null;
};

function workerMessageReducer<T>(state: State<T>, action: Action<T>): State<T> {
  switch (action.type) {
    case "pending": {
      return { status: "pending", result: state.result, error: null };
    }
    case "stale": {
      return { status: "stale", result: state.result, error: null };
    }
    case "resolved": {
      return { status: "resolved", result: action.data, error: null };
    }
    case "rejected": {
      return { status: "rejected", result: null, error: action.error };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

// useSafeDispatch prevents dispatching actions to an unmounted reducer
function useSafeDispatch<T>(dispatch: React.Dispatch<Action<T>>) {
  const mounted = useRef(false);

  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return useCallback(
    (action: Action<T>) => (mounted.current ? dispatch(action) : void 0),
    [dispatch]
  );
}

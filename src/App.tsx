import { Suspense, useDeferredValue, useState, useTransition } from "react";
import "./App.css";

export default function App() {
  const [defaultCount, setDefaultCount] = useState(0);
  const [transitionCount, setTransitionCount] = useState(0);
  const deferredCount = useDeferredValue(defaultCount);

  const [mounted, setMounted] = useState(false);
  const [updateType, setUpdateType] = useState<
    "update" | "transition" | "deferred"
  >("update");

  const [isPending, startTransition] = useTransition();

  const mount = () => setMounted(true);
  const update = () => {
    setDefaultCount(defaultCount + 1);
    setTransitionCount(defaultCount + 1);
    setUpdateType("update");
  };
  const updateTransition = () => {
    startTransition(() => {
      setTransitionCount(count + 1);
    });
    setDefaultCount(defaultCount + 1);
    setUpdateType("transition");
  };
  const updateDeferred = () => {
    setDefaultCount(defaultCount + 1);
    setTransitionCount(defaultCount + 1);
    setUpdateType("deferred");
  };
  const reset = () => {
    suspenseMap.clear();
    setMounted(false);
    setDefaultCount(0);
    setTransitionCount(0);
  };

  let count = 0;
  switch (updateType) {
    case "update":
      count = defaultCount;
      break;
    case "transition":
      count = transitionCount;
      break;
    case "deferred":
      count = deferredCount;
      break;
  }

  const resolve = () => {
    const data = suspenseMap.get(suspendedCount);
    if (data && data.resolvedValue === null) {
      data.resolvedValue = suspendedCount;
      data.resolver(suspendedCount);
    }
  };

  return (
    <div className="App">
      <div className="Row">
        <button disabled={mounted} onClick={mount}>
          Mount
        </button>
        <button disabled={!mounted} onClick={update}>
          Update
        </button>
        <button disabled={!mounted} onClick={updateTransition}>
          Update (startTransition)
        </button>
        <button disabled={!mounted} onClick={updateDeferred}>
          Update (useDeferredValue)
        </button>
        :
        <button disabled={!mounted} onClick={reset}>
          Reset
        </button>
      </div>

      <div className="ComponentRow">
        {mounted && (
          <Suspense fallback={<Fallback />}>
            <Component count={count} />
          </Suspense>
        )}
      </div>

      <div className="Row">
        <button onClick={resolve}>Resolve pending</button>
      </div>
    </div>
  );
}

function Component({ count }: { count: number }) {
  let value;
  try {
    value = fauxSuspense(count);
  } catch (thrown) {
    // Side effect but just for demo
    suspendedCount = count;
    throw thrown;
  }

  return <div className="Component">Component ({value})</div>;
}

function Fallback() {
  return <div className="Fallback">Loading...</div>;
}

const suspenseMap: Map<
  number,
  {
    promise: Promise<number>;
    resolvedValue: number | null;
    resolver: (value: number) => void;
  }
> = new Map();

let suspendedCount = -1;

function fauxSuspense(value: number): number {
  let data = suspenseMap.get(value);
  if (data == null) {
    let resolver: (value: number) => void;
    data = {
      resolvedValue: null,
      resolver: (value) => resolver(value),
      promise: new Promise((resolve) => {
        resolver = resolve;
      }),
    };

    suspenseMap.set(value, data);
  }

  if (data.resolvedValue !== null) {
    return data.resolvedValue;
  } else {
    throw data.promise;
  }
}

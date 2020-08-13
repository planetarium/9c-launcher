import { useRef, useEffect, DependencyList, EffectCallback } from "react";

export default function useDidUpdateEffect<T>(
  effect: EffectCallback,
  depes: DependencyList
) {
  const didMountRef = useRef(false);

  useEffect(() => {
    if (didMountRef.current) effect();
    else didMountRef.current = true;
  }, depes);
}

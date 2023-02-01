import { useRef, useLayoutEffect, useCallback } from "react";

/**
 * An approximate implementation of `useEvent` proposed in a [React RFC](https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md#internal-implementation).
 *
 * @param handler An event handler.
 * @returns An event handler with an always-stable function identity.
 */
export function useEvent<F extends (...args: unknown[]) => unknown>(
  handler: F
): F {
  const handlerRef = useRef<F>();

  // In a real implementation, this would run before layout effects
  useLayoutEffect(() => {
    handlerRef.current = handler;
  });

  return useCallback((...args: Parameters<F>) => {
    // In a real implementation, this would throw if called during render
    const fn = handlerRef.current;
    return fn?.(...args);
  }, []) as F;
}

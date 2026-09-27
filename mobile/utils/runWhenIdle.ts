/** Defer non-critical work (Expo/RN may polyfill requestIdleCallback). */
export function runWhenIdle(task: () => void, timeoutMs = 120) {
  const g = globalThis as typeof globalThis & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  };
  if (typeof g.requestIdleCallback === "function") {
    g.requestIdleCallback(task, { timeout: timeoutMs });
    return;
  }
  setTimeout(task, 1);
}

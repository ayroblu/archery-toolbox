import { BoundResult, Bounds } from "./Params";

export function calculateBounds(
  func: (i: number) => BoundResult,
  initialValue: number,
  crawl: number
): Bounds {
  let counter: number = 0;
  let lowerBound: number;
  let upperBound: number;
  let value: number = initialValue;
  let previousResult: BoundResult & { value: number } | undefined;

  while (++counter < 1e3) {
    const { isLower } = func(value);
    if (previousResult && isLower !== previousResult.isLower) {
      upperBound = Math.max(previousResult.value, value);
      lowerBound = Math.min(previousResult.value, value);
      return { lowerBound, upperBound };
    }
    previousResult = { isLower, value };
    if (isLower) {
      value += crawl;
    } else {
      value -= crawl;
    }
  }
  throw new Error("Failed to calculate bounds");
}

// Bisection method
export function refineBounds(
  func: (i: number) => BoundResult,
  initialBounds: Bounds
): number {
  const tol = 1e-5;
  let counter: number = 0;
  let { lowerBound, upperBound } = initialBounds;

  while (++counter < 1e3) {
    const value = (lowerBound + upperBound) / 2;
    if (upperBound - lowerBound < tol) {
      return value;
    }

    const { isLower } = func(value);
    if (isLower) {
      lowerBound = value;
    } else {
      upperBound = value;
    }
  }
  throw new Error("Failed to refine bounds");
}

export function convergeFunc(
  func: (i: number) => BoundResult,
  initialValue: number,
  crawl: number
): number {
  const bounds: Bounds = calculateBounds(func, initialValue, crawl);
  return refineBounds(func, bounds);
}

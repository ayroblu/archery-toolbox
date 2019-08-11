import { convergeFunc } from "./converger";

describe("Converges", () => {
  const tests = [["basic", 0, 0.1, 5]] as const;
  tests.forEach(([name, initialVal, inc, expected]) => {
    test(name, () => {
      const result = convergeFunc(
        val => {
          return { isLower: val < expected };
        },
        initialVal,
        inc
      );
      expect(result < expected + 1e-3 && result > expected - 1e-3).toBeTruthy();
    });
  });
});

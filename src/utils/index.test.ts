import { cn } from "./";

describe("Returns a class names list", () => {
  const tests = [
    ["simple array", ["First", "Second"], "First Second"],
    ["conditional false", ["First", false && "Second"], "First"],
    ["conditional true", ["First", true && "Second"], "First Second"]
  ] as const;
  tests.forEach(([name, param, expected]) => {
    test(name, () => {
      expect(cn.apply(null, param as any)).toEqual(expected);
    });
  });
});

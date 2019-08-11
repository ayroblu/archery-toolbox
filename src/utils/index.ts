export function cn(...args: (string | null | undefined | false | 0)[]): string {
  return Array.from(args)
    .filter(a => a)
    .join(" ");
}

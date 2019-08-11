// @flow

export function cn(): string{
  return Array.from(arguments).filter(a=>a).join(' ')
}

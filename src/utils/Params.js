export type BoundResult = {
  isLower: boolean
}
export type Bounds = {
  lowerBound: number
, upperBound: number
}
export type SightParams = {
  v: number
, s_v: number
, s_h: number
, arm: number
, jaw: number
}
export type SightResult = {
  theta: number
, alpha: number
, phi: number
, sightHeight: number
}
export type ArrowSpeedParams = {
  farDistance: number
, shortDistance: number
, desiredSightMark: number
, arm?: number
, jaw?: number
}

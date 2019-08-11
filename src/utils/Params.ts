export type BoundResult = {
  isLower: boolean;
};
export type Bounds = {
  lowerBound: number;
  upperBound: number;
};
export type SightParams = {
  v: number; // arrowSpeed...
  s_v: number;
  s_h: number;
  arm: number;
  jaw: number;
};
export type SightResult = {
  theta: number;
  alpha: number;
  phi: number;
  sightHeight: number;
};
export type ArrowPos = {
  x: number;
  y: number;
  velocity: number;
};
export type ArrowParams = {
  m: number;
  A: number;
  Cd: number;
  density: number;
  arrowSpeed: number;
};
export type ArrowSpeedParams = {
  farDistance: number;
  shortDistance: number;
  farDistanceMark: number;
  shortDistanceMark: number;
  arm: number;
  jaw: number;
};

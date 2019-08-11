import { convergeFunc } from "./converger";
import { SightParams, SightResult, ArrowSpeedParams } from "./Params";

export const yardsToMetres = (v: number) => 0.9144 * v;
export const metresToYards = (v: number) => 1.09361 * v;
const g = 9.81; // gravitational force

export function getSight({ v, s_v, s_h, arm, jaw }: SightParams): SightResult {
  const a = 4 * v ** 4 * (s_h ** 2 + s_v ** 2);
  const b = 4 * s_h ** 2 * v ** 2 * (s_v * g - v ** 2);
  const c = g ** 2 * s_h ** 4;

  const sqrt = Math.sqrt(b ** 2 - 4 * a * c);

  const cos2theta = [(-b + sqrt) / (2 * a), (-b - sqrt) / (2 * a)];
  const theta_op = cos2theta.map(c => Math.acos(Math.sqrt(c)));
  const alpha = Math.atan((s_v - jaw * Math.cos(theta_op[0])) / s_h);

  const theta = [theta_op[0], -theta_op[0]].reduce((a, n) =>
    n > alpha && Math.abs(n - alpha) < Math.abs(a - alpha) ? n : a
  );

  const phi = theta - alpha;
  const sightHeight = jaw - arm * Math.tan(phi);
  return { theta, alpha, phi, sightHeight };
}
export function calcArrowSpeed(params: ArrowSpeedParams): number {
  //farDistance(m), shortDistance(m), desiredSightMark(mm)
  const {
    farDistance,
    shortDistance,
    farDistanceMark,
    shortDistanceMark,
    ...extras
  } = params;

  let initialArrowSpeed = 50;
  return convergeFunc(
    (arrowSpeed: number) => {
      const p = { s_v: 0, v: arrowSpeed, ...extras };
      const { sightHeight: firstSight } = getSight({
        s_h: shortDistance,
        ...p
      });
      const { sightHeight: secondSight } = getSight({ s_h: farDistance, ...p });

      const diff = Math.abs(firstSight - secondSight);

      // Slow = lower = bigger sight mark gap
      const isLower = diff > Math.abs(farDistanceMark - shortDistanceMark);
      return { isLower };
    },
    initialArrowSpeed,
    1
  );
}

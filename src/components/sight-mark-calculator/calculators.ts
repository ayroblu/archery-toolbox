import { calcArrowSpeed, getSight, yardsToMetres } from "../../utils/smCalc";
import * as smcnd from "../../utils/smNoDragCalc";
import {
  angles,
  ComputedValues,
  EquipmentInputsUnsafe,
  EquipmentInputsValidated,
  ExtraUserOptions,
  PredefinedConstants,
  SightMarkInputs,
  SightMarkInputsUnsafe
} from "./SightMarkCalculator";

const distances = Array.from(
  new Set(
    Array(90 / 5)
      .fill(null)
      .map((v, i) => (i + 1) * 5)
      .concat(
        Array(100 / 5)
          .fill(null)
          .map((v, i) => Math.round(yardsToMetres((i + 1) * 5)))
      )
  )
)
  .concat([165, 170])
  .sort((a, b) => a - b);

function validateSightMarkInputs(
  params: SightMarkInputsUnsafe
): SightMarkInputs {
  if (
    params.farDistance &&
    params.shortDistance &&
    params.farDistanceMark &&
    params.shortDistanceMark
  ) {
    const farDistance = parseFloat(params.farDistance);
    const shortDistance = parseFloat(params.shortDistance);
    const farDistanceMark = parseFloat(params.farDistanceMark) / 100;
    const shortDistanceMark = parseFloat(params.shortDistanceMark) / 100;
    if (farDistance && shortDistance && farDistanceMark && shortDistanceMark) {
      return {
        farDistance,
        shortDistance,
        farDistanceMark,
        shortDistanceMark
      };
    }
  }
  return {
    farDistance: 60,
    shortDistance: 20,
    farDistanceMark: 0.055,
    shortDistanceMark: 0.004
  };
}
function validateEquipmentInputs(
  { eyeArrowDistance, faceSightDistance }: EquipmentInputsUnsafe,
  { arm, jaw }: PredefinedConstants
): EquipmentInputsValidated {
  return {
    arm: parseFloat(faceSightDistance) || arm,
    jaw: parseFloat(eyeArrowDistance) || jaw
  };
}
function calculateArrowSpeed(
  sightMarkInputs: SightMarkInputs,
  equipmentInputs: EquipmentInputsValidated,
  { Cd }: PredefinedConstants
) {
  const params = {
    ...sightMarkInputs,
    Cd,
    ...equipmentInputs
  };
  const arrowSpeed = calcArrowSpeed(params);
  return arrowSpeed;
}
export function calculateSightMarks(
  sightMarkInputs: SightMarkInputsUnsafe,
  equipmentInputs: EquipmentInputsUnsafe,
  predefinedConstants: PredefinedConstants,
  { useDrag }: ExtraUserOptions
): ComputedValues {
  const validSightMarkInputs = validateSightMarkInputs(sightMarkInputs);
  const validEquipmentInputs = validateEquipmentInputs(
    equipmentInputs,
    predefinedConstants
  );
  const arrowSpeed = calculateArrowSpeed(
    validSightMarkInputs,
    validEquipmentInputs,
    predefinedConstants
  );
  const params = {
    Cd: predefinedConstants.Cd,
    ...validEquipmentInputs,
    v: arrowSpeed
  };

  if (useDrag) {
    const referenceMark =
      smcnd.getSight({
        ...params,
        s_v: 0,
        s_h: validSightMarkInputs.shortDistance
      }).sightHeight + validSightMarkInputs.shortDistanceMark;
    const sightMarks = distances.map(d => {
      const angledMarks = angles
        .map(targetAngle => {
          const s_v = d * Math.sin(targetAngle);
          const s_h = d * Math.cos(targetAngle);
          return smcnd.getSight({ ...params, s_v, s_h });
        })
        .map(m => ({ ...m, sightHeight: referenceMark - m.sightHeight }));
      return {
        angledMarks,
        distance: d
      };
    });
    return { sightMarks, arrowSpeed };
  } else {
    const referenceMark =
      getSight({ ...params, s_v: 0, s_h: validSightMarkInputs.shortDistance })
        .sightHeight + validSightMarkInputs.shortDistanceMark;
    const sightMarks = distances.map(d => {
      const angledMarks = angles
        .map(targetAngle => {
          const s_v = Math.sin(targetAngle) * d;
          const s_h = Math.cos(targetAngle) * d;
          return getSight({ ...params, s_v, s_h });
        })
        .map(m => ({ ...m, sightHeight: referenceMark - m.sightHeight }));
      return {
        angledMarks,
        distance: d
      };
    });
    return { sightMarks, arrowSpeed };
  }
}

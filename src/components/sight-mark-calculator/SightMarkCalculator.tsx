import "./SightMarkCalculator.css";

import { FormControlLabel } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Switch from "@material-ui/core/Switch";
import TextField from "@material-ui/core/TextField";
import React, { useEffect, useState } from "react";

import { SightResult } from "../../utils/Params";
import { metresToYards } from "../../utils/smCalc";
import * as smcnd from "../../utils/smNoDragCalc";
import { calculateSightMarks } from "./calculators";
import { useLocalStorage } from "./helpers";

export const angles = Array((40 / 5) * 2 + 1)
  .fill(null)
  .map((v, i) => ((i - 40 / 5) * 5 * Math.PI) / 180);

export type SightMarkInputs = {
  farDistance: number;
  shortDistance: number;
  farDistanceMark: number;
  shortDistanceMark: number;
};
export type SightMarkInputsUnsafe = { [key in keyof SightMarkInputs]: string };
export type EquipmentInputs = {
  faceSightDistance: number;
  eyeArrowDistance: number;
};
export type EquipmentInputsUnsafe = { [key in keyof EquipmentInputs]: string };
export type EquipmentInputsValidated = {
  arm: number;
  jaw: number;
};
export type ExtraUserOptions = {
  useDrag: boolean;
  showAngles: boolean;
};
export type PredefinedConstants = Readonly<{
  Cd: number;
  arm: number;
  jaw: number;
}>;
export type SightMarks = {
  distance: number;
  angledMarks: SightResult[];
};
export type ComputedValues = {
  arrowSpeed: number;
  sightMarks: SightMarks[];
};
const SightMarksSensitivity: React.FC<
  EquipmentInputsUnsafe & ComputedValues
> = props => {
  const { faceSightDistance, arrowSpeed, eyeArrowDistance } = props;
  const arm = parseFloat(faceSightDistance);
  const jaw = parseFloat(eyeArrowDistance);
  const diffs = [
    {
      dist: 18,
      face: 40
    },
    {
      dist: 30,
      face: 80
    },
    {
      dist: 50,
      face: 80
    },
    {
      dist: 70,
      face: 122
    },
    {
      dist: 90,
      face: 122
    }
  ].map(h => {
    const hDiff =
      (h.face / 5 / 100 / h.dist) * parseFloat(faceSightDistance) * 1000;
    const { sightHeight: flat } = smcnd.getSight({
      v: arrowSpeed,
      s_v: 0,
      s_h: h.dist,
      arm,
      jaw
    });
    const { sightHeight: above } = smcnd.getSight({
      v: arrowSpeed,
      s_v: h.face / 5 / 100,
      s_h: h.dist,
      arm,
      jaw
    });
    const vDiff = (above - flat) * 1000 + hDiff;
    return { ...h, hDiff, vDiff };
  });
  return (
    <div>
      <h3>Sight Marks Sensitivity</h3>
      <p>Relative distances, mm to move per ring</p>
      {diffs.map(d => (
        <p key={d.dist}>
          {d.dist}m, {d.face}cm: movement: {d.hDiff.toFixed(2)}mm horizontally,
          vertically: {d.vDiff.toFixed(2)}mm per coloured ring
        </p>
      ))}
    </div>
  );
};
const CloutAnalysis: React.FC<
  EquipmentInputsUnsafe & ComputedValues
> = props => {
  const { faceSightDistance, arrowSpeed, eyeArrowDistance } = props;
  const arm = parseFloat(faceSightDistance);
  const jaw = parseFloat(eyeArrowDistance);
  const diffs = [
    {
      dist: 165,
      face: 15
    }
  ].map(h => {
    const hDiff = (h.face / 5 / h.dist) * parseFloat(faceSightDistance) * 1000;
    const { sightHeight: flat } = smcnd.getSight({
      v: arrowSpeed,
      s_v: 0,
      s_h: h.dist,
      arm,
      jaw
    });
    const { sightHeight: above } = smcnd.getSight({
      v: arrowSpeed,
      s_v: 0,
      s_h: h.dist + h.face / 5,
      arm,
      jaw
    });
    const vDiff = -(above - flat) * 1000;
    return { ...h, hDiff, vDiff };
  });
  const { theta } = smcnd.getSight({
    v: arrowSpeed,
    s_v: 0,
    s_h: 165,
    arm,
    jaw
  });
  const time = 165 / (arrowSpeed * Math.cos(theta));
  return (
    <div>
      <h3>Clout analysis</h3>
      <p>Relative distances, mm to move per ring</p>
      {diffs.map(d => (
        <p key={d.dist}>
          {d.dist}m, {d.face}m: movement: {d.hDiff.toFixed(2)}mm horizontally,{" "}
          {d.vDiff.toFixed(2)}mm vertically per coloured ring
        </p>
      ))}
      <p>20m lollipop, to match size, you want: 1.8m... gold is 0.36m</p>
      <p>Lollipop: 15cm above ground in a 7.5cm diameter</p>
      <p>Time in the air: {time.toFixed(1)}s</p>
    </div>
  );
};
export const SightMarkCalculator: React.FC = () => {
  const [sightMarkInputs, setSightMarkInputs] = useLocalStorage(
    "sightMarkInputs",
    {
      farDistance: "60",
      shortDistance: "18",
      farDistanceMark: "5.5",
      shortDistanceMark: "0.4"
    }
  );
  const [equipmentInputs, setEquipmentInputs] = useLocalStorage(
    "equipmentInputs",
    {
      faceSightDistance: "0.9",
      eyeArrowDistance: "0.14"
    }
  );
  const predefinedConstants: PredefinedConstants = {
    Cd: 0.1,
    arm: 0.73 + 0.16,
    jaw: 0.14
  };
  const [extraUserOptions, setExtraUserOptions] = useState({
    useDrag: false,
    showAngles: false
  });
  const [sightMarks, setSightMarks] = useState<SightMarks[]>([]);
  const [arrowSpeed, setArrowSpeed] = useState(55.1);
  const runCalculateSightMarks = () => {
    const computedValues = calculateSightMarks(
      sightMarkInputs,
      equipmentInputs,
      predefinedConstants,
      extraUserOptions
    );
    setSightMarks(computedValues.sightMarks);
    setArrowSpeed(computedValues.arrowSpeed);
  };
  useEffect(runCalculateSightMarks, []);
  const computedValues: ComputedValues = { sightMarks, arrowSpeed };

  const {
    farDistance,
    farDistanceMark,
    shortDistance,
    shortDistanceMark
  } = sightMarkInputs;
  const { eyeArrowDistance, faceSightDistance } = equipmentInputs;
  const { showAngles, useDrag } = extraUserOptions;

  const setSightMarkInputsHandler = (name: keyof SightMarkInputs) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSightMarkInputs({ ...sightMarkInputs, [name]: e.target.value });
  };
  const setEquipmentInputsHandler = (name: keyof EquipmentInputs) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEquipmentInputs({ ...equipmentInputs, [name]: e.target.value });
  };
  const setExtraUserOptionsHandler = (name: keyof ExtraUserOptions) => (
    e: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    setExtraUserOptions({ ...extraUserOptions, [name]: checked });
  };

  // computed
  // , arrowSpeed: 55.1

  const angleHeadings = showAngles
    ? angles.map(a => `${((a * 180) / Math.PI).toFixed(0)}deg`)
    : ["Sight Marks"];

  const sm =
    sightMarks && !showAngles
      ? sightMarks.map(sm => {
          return { ...sm, angledMarks: [sm.angledMarks[8]] };
        })
      : sightMarks || [];
  //const referenceDistance = sightMarks.find(s=>s.distance===18)
  return (
    <section className="SightMarkCalculator">
      <h2>Sight Marks Calculator</h2>
      <div className="arrowSpeedCalc">
        <h3>Arrow Speed parameters</h3>
        <div className="SightMarkCalculator-row">
          <TextField
            placeholder="Use a long distance sight mark"
            label="Far distance (m)"
            value={farDistance}
            onChange={setSightMarkInputsHandler("farDistance")}
          />
          <TextField
            placeholder="This is normally found on your sight"
            label="Far Sight Mark (cm)"
            value={farDistanceMark}
            onChange={setSightMarkInputsHandler("farDistanceMark")}
          />
        </div>
        <div className="SightMarkCalculator-row">
          <TextField
            placeholder="Use a short distance sight mark"
            label="Short distance (m)"
            value={shortDistance}
            onChange={setSightMarkInputsHandler("shortDistance")}
          />
          <TextField
            placeholder="This is normally found on your sight"
            label="Short Sight Mark (cm)"
            value={shortDistanceMark}
            onChange={setSightMarkInputsHandler("shortDistanceMark")}
          />
        </div>
      </div>
      <div className="SightMarkCalculator-row">
        <TextField
          placeholder="This is about your draw length + sight length"
          label="Face to sight distance (m)"
          value={faceSightDistance}
          onChange={setEquipmentInputsHandler("faceSightDistance")}
        />
        <TextField
          placeholder="This is the distance from your nock to your eye"
          label="Eye to Arrow distance (m)"
          value={eyeArrowDistance}
          onChange={setEquipmentInputsHandler("eyeArrowDistance")}
        />
      </div>
      <div style={{ width: "250px", margin: "10px 0" }}>
        <FormControlLabel
          control={
            <Switch
              checked={useDrag}
              onChange={setExtraUserOptionsHandler("useDrag")}
            />
          }
          label="Include drag"
        />
      </div>
      <div style={{ width: "250px", margin: "10px 0" }}>
        <FormControlLabel
          control={
            <Switch
              checked={showAngles}
              onChange={setExtraUserOptionsHandler("showAngles")}
            />
          }
          label="Show angles"
        />
      </div>
      <Button
        variant="contained"
        color="primary"
        onClick={runCalculateSightMarks}
      >
        Calculate Sight Marks
      </Button>
      {arrowSpeed && <p>Arrow Speed: {arrowSpeed.toFixed(1)}m/s</p>}
      <SightMarksSensitivity {...equipmentInputs} {...computedValues} />
      <CloutAnalysis {...equipmentInputs} {...computedValues} />
      <table>
        <thead>
          <tr>
            <td />
            {angleHeadings.map(h => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sm.map(s => (
            <tr key={s.distance}>
              <th>
                {s.distance}m ({metresToYards(s.distance).toFixed(1)}y)
              </th>
              {s.angledMarks.map((a, i) => {
                const sightMark = (a.sightHeight * 100).toFixed(1);
                const ref =
                  a.sightHeight - s.angledMarks[showAngles ? 8 : 0].sightHeight;
                //console.log('a,s', s.distance, a.sightHeight, s.angledMarks[8].sightHeight)
                return (
                  <td key={`${s.distance}-${i}`}>
                    {sightMark} ({ref > 0 ? "+" : ""}
                    {(ref * 100).toFixed(1)})
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

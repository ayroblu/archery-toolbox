// @flow
import {convergeFunc} from './converger'
import type {SightParams, SightResult, ArrowPos, ArrowParams, ArrowSpeedParams} from './Params'

export const yardsToMetres = (v: number)=>0.9144*v
export const metresToYards = (v: number)=>1.09361*v
//const distances = Array.from(new Set(Array(90/5).fill().map((v,i)=>(i+1)*5).concat(
//  Array(100/5).fill().map((v,i)=>Math.round(yardsToMetres((i+1)*5)))
//))).sort((a,b)=>a-b)

export function calcPos(angle: number, t:number, params: ArrowParams={}): ArrowPos{
  const g = 9.81
  const {m, A, Cd, density, arrowSpeed} = params

  const v_terminal = Math.sqrt((2*m*g)/(Cd*A*density)) // terminal velocity
  const v_initial = arrowSpeed * Math.sin(angle)
  const u_initial = arrowSpeed * Math.cos(angle)
  const v = v_terminal * (v_initial - v_terminal * Math.tan(t * g/v_terminal)) / (v_terminal + v_initial * Math.tan(t * g/v_terminal))
  const u = v_terminal**2 * u_initial / (v_terminal**2 + g * u_initial * t)
  const velocity = Math.sqrt(u**2 + v**2)

  const y = v_terminal**2/(2*g) * Math.log((v_initial**2+v_terminal**2)/(v**2 + v_terminal**2))
  const x = v_terminal**2/g * Math.log((v_terminal**2 + g*u_initial*t)/v_terminal**2)

  return {x,y,velocity}
}
export function getShotAngle({v, s_v, s_h, arm, jaw}: SightParams): number{
  const arrowParams = {
    m: 0.02 //20grams - 300 grains
  , A: 0.01**2 // square cm approx
  , Cd: 0.1 //Rough coefficient of drag
  , density: 1.225 // density of air
  , arrowSpeed: v
  }
  const initialTime = 0.1
  const targetAngle = Math.atan(1.0*s_v/s_h)
  let counter = 0
  let angle = targetAngle + 1 * Math.PI/180
  while (++counter < 1e3) {
    const time = convergeFunc((t: number)=>{
      const {x} = calcPos(angle, t, arrowParams)
      const isLower = x < s_h
      return {isLower}
    }, initialTime, 0.1)
    const shootingAngle = convergeFunc((angle: number)=>{
      const {y} = calcPos(angle, time, arrowParams)
      const isLower = y < s_v
      return {isLower}
    }, targetAngle, 5*Math.PI/180)

    const {x} = calcPos(angle, time, arrowParams)
    if (Math.abs(s_h - x) < 1e3){
      return shootingAngle
    }
    angle = shootingAngle
  }
  throw new Error('Failed to converge to a shot angle')
}
export function getSightHeight({v, s_v, s_h, arm, jaw}: SightParams, angle: number): SightResult{
  //const vel = 58
  const targetAngle = Math.atan(1.0*s_v/s_h)
  const alpha = targetAngle - Math.atan(jaw*Math.cos(targetAngle)/s_h)
  const phi = angle - alpha
  const sightHeight = jaw - arm*Math.tan(phi)
  return {alpha, phi, sightHeight, theta: angle}
}
export function getSight(params: SightParams): SightResult{
  const angle = getShotAngle(params)
  return getSightHeight(params, angle)
}
export function calcArrowSpeed(params: ArrowSpeedParams){
  const {farDistance, shortDistance, desiredSightMark, ...extras} = params

  let initialArrowSpeed = 50
  return convergeFunc((arrowSpeed: number)=>{
    const p = {s_v: 0, v: arrowSpeed, ...extras}
    const {sightHeight: firstSight} = getSight({s_h: shortDistance, ...p})
    const {sightHeight: secondSight} = getSight({s_h: farDistance, ...p})

    const diff = Math.abs(firstSight - secondSight)

    const isLower = diff > desiredSightMark
    return {isLower}
  }, initialArrowSpeed, 1)
}

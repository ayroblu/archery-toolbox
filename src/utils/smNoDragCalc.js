export const yardsToMetres = v=>0.9144*v
export const metresToYards = v=>1.09361*v
const g = 9.81 // gravitational force
//const arm = 0.73+0.16
//const jaw = 0.14

export function getSight({v, s_v, s_h, arm, jaw}){
  const a = 4 * v**4 * (s_h**2 + s_v**2)
  const b = 4 * s_h**2 * v**2 * (s_v*g - v**2)
  const c = g**2 * s_h**4

  const sqrt = Math.sqrt(b**2 - 4*a*c)

  const cos2theta = [(-b + sqrt)/(2*a), (-b - sqrt)/(2*a)]
  const theta_op = cos2theta.map(c=>Math.acos(Math.sqrt(c)))
  const alpha = Math.atan((s_v-jaw*Math.cos(theta_op[0]))/s_h)

  const theta = [theta_op[0], -theta_op[0]].reduce((a,n)=>n > alpha && Math.abs(n - alpha) < Math.abs(a - alpha) ? n : a) 
  //const theta = theta_op[0]
  const phi = theta - alpha
  const sightHeight = jaw - arm*Math.tan(phi)
  return {theta, alpha, phi, sightHeight}
}
export function calcArrowSpeed(farDistance, shortDistance, desired, params={}){
//farDistance(m), shortDistance(m), desired(mm)
  const tol = 1e-5

  let arrowSpeed = 50
  let previousResult = null
  let upperArrowSpeed = null
  let lowerArrowSpeed = null
  let counter = 0

  while (++counter < 1e3){
    if (upperArrowSpeed !== null){
      arrowSpeed = (upperArrowSpeed + lowerArrowSpeed)/2
    }
    const {sightHeight: firstSight} = getSight({v:arrowSpeed, s_v: 0, s_h: shortDistance, ...params})
    const {sightHeight: secondSight} = getSight({v:arrowSpeed, s_v: 0, s_h: farDistance, ...params})

    const diff = Math.abs(firstSight - secondSight)
    if (upperArrowSpeed !== null){
      if (upperArrowSpeed - lowerArrowSpeed < tol){
        break
      }
      if (diff < desired){
        upperArrowSpeed = arrowSpeed
      } else {
        lowerArrowSpeed = arrowSpeed
      }
    } else {
      if (previousResult && (previousResult.diff-desired > 0)^(diff-desired > 0)){
        upperArrowSpeed = Math.max(previousResult.arrowSpeed, arrowSpeed)
        lowerArrowSpeed = Math.min(previousResult.arrowSpeed, arrowSpeed)
        continue
      }
      previousResult = {arrowSpeed, diff}
      if (diff < desired){
        arrowSpeed -= 1
      } else {
        arrowSpeed += 1
      }
    }
  }
  return arrowSpeed
}
//const refSight = runCalc(arrowSpeed, 0, 18, arm, jaw).sightHeight*100 + 0.3
//const sm = distances.map(d=>{
//  const preSight = runCalc(arrowSpeed, 0, d, arm, jaw)
//  const sightMarks = Array(40/5*2+1).fill().map((v,i)=>(i-40/5)*5*Math.PI/180).map(targetAngle=>{
//    const v = Math.sin(targetAngle)*d
//    const {theta, alpha, phi, sightHeight} = runCalc(arrowSpeed, v, d*Math.cos(targetAngle), arm, jaw)
//    const anchoredSightHeight = refSight - sightHeight*100
//    const diff = sightHeight - preSight.sightHeight
//    return {sightMark: anchoredSightHeight.toFixed(3), targetAngle, diff, theta, alpha, phi}
//  })
//  return sightMarks
//})


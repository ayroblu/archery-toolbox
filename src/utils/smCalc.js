export const yardsToMetres = v=>0.9144*v
export const metresToYards = v=>1.09361*v
//const distances = Array.from(new Set(Array(90/5).fill().map((v,i)=>(i+1)*5).concat(
//  Array(100/5).fill().map((v,i)=>Math.round(yardsToMetres((i+1)*5)))
//))).sort((a,b)=>a-b)

export function calcPos(angle, t, params={}){
  const g = 9.81
  const m = params.m || 0.02 //20grams - 300 grains
  const A = params.A || 0.01**2 // square cm approx
  const Cd = params.Cd || 0.1 //Rough coefficient of drag
  const density = params.density || 1.225 // density of air
  const arrowSpeed = params.arrowSpeed || 58 //metres per second

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
export function getShotAngle(dist=30, targetAngle=20*Math.PI/180, params={}){
  const dist_horizontal = dist * Math.cos(targetAngle)
  const dist_vertical = dist * Math.sin(targetAngle)
  const maxAngle = 90 * Math.PI/180
  //console.log(`dist: ${dist_horizontal}m, ${dist_vertical}m`)

  let t = 0
  let counter = 0
  let tol = 1e-5
  let angle = targetAngle + 5 * Math.PI/180

  // first we crawl
  t = 0
  let upperT = null
  let lowerT = 0
  while (++counter < 1e5 && upperT === null){
    const {x,y} = calcPos(angle, t+=0.1, params)

    // we want bounding, where at x > dist_horizontal -> y > dist_vertical
    if (x > dist_horizontal){
      if (y < dist_vertical) {
        angle += 5*Math.PI/180
        if (angle > maxAngle){
          console.log('Did not reach the distance')
          return
        }
        t = 0
        continue
      } else {
        upperT = t
        lowerT = t - 0.1
        break
      }
    }
  }

  let lowerAngle = targetAngle
  let upperAngle = angle
  let result = null
  // get x right
  while (++counter < 1e4){
    t = (upperT + lowerT) / 2
    angle = (upperAngle + lowerAngle) / 2
    //console.log('t', upperT, lowerT, upperT - lowerT, t, 'angle', upperAngle, lowerAngle, upperAngle - lowerAngle, angle)

    const {x,y,velocity} = calcPos(angle, t, params)

    if (Math.abs(upperT - lowerT) > tol) {
      if (x > dist_horizontal){
        upperT = t
      } else {
        lowerT = t
      }
      continue
    }
    if (Math.abs(upperAngle - lowerAngle) > tol) {
      if (y > dist_vertical){
        upperAngle = angle
      } else {
        lowerAngle = angle
      }
      continue
    }
    result = {x,y,velocity, angle, t}
    break
  }
  if (result === null){
    console.log('result (exceeded counter?)', result, counter)
  }
  return result
}
export function getSightHeight(dist, targetAngle, angle, params={}){
  //const vel = 58
  const arm = params.arm || 0.73+0.16 // drawlength + sight length = 0.73+0.16
  const jaw = params.jaw || 0.14
  const dist_horizontal = dist * Math.cos(targetAngle)
  const alpha = targetAngle - Math.atan(jaw*Math.cos(targetAngle)/dist_horizontal)
  const phi = angle - alpha
  const sightHeight = jaw - arm*Math.tan(phi)
  return {alpha, phi, sightHeight}
}
export function getSight(dist, targetAngle, params={}){
  const {x, y, velocity, angle, t} = getShotAngle(dist, targetAngle, params)
  const {sightHeight} = getSightHeight(dist, targetAngle, angle, params)
  return {x, y, velocity, angle, t, sightHeight}
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
    const p = {...params, arrowSpeed}
    const {sightHeight: firstSight} = getSight(shortDistance, 0, p)
    const {sightHeight: secondSight} = getSight(farDistance, 0, p)

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

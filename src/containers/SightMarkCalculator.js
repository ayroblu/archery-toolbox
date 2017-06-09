import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as smActions from '../actions/sightMarkCalculator'
import {getSight, calcArrowSpeed} from '../utils/smCalc'
import './SightMarkCalculator.css'

class SightMarkCalculator extends Component {
//function run(){
//  const params = {Cd: 0.1}
//  const arrowSpeed = calcArrowSpeed(0.06-0.003, params)
//  console.log(`arrowSpeed: ${arrowSpeed.toFixed(1)}m/s`)
//  const targetAngle = 0 //10*Math.PI/180
//  Object.assign(params, {arrowSpeed})
//
//  const {angle: preAngle} = getShotAngle(18, targetAngle, params)
//  const {sightHeight: firstSm} = getSightHeight(18, targetAngle, preAngle)
//  const refPoint = firstSm*100 + 0.3
//
//  distances.forEach(dist=>{
//    const {x,y,velocity, angle, t} = getShotAngle(dist, targetAngle, params)
//    const {sightHeight} = getSightHeight(dist, targetAngle, angle)
//    //console.log('dist', dist, '- angle:', angle * 180/Math.PI, '- sight:', sightHeight)
//    console.log(`${dist}m: ${(refPoint-sightHeight*100).toFixed(1)}cm, velocity: ${velocity.toFixed(1)}m/s`)
//  })
//  // lets get some sight marks - get angles at the different distances
//}
  render() {
    const angleHeadings = [
      '-5 deg', '5 deg'
    ]
    return (
      <section className='SightMarkCalculator'>
        <h2>Archery Toolbox</h2>
        <p>Far distance (m)</p>
        <p>Close distance (m)</p>
        <p>Difference between far and close sight mark (cm)</p>
        <p>Reference distance</p>
        <table>
          <thead>
            <tr>
              <td />
              {angleHeadings.map(h=>(
                <th>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sightMarks.map(s=>(
            <tr>
              <th>{s.distance}</th>
              {s.angledMarks.map(a=>(
                <td>{a.value}</td>
              ))}
            </tr>))}
          </tbody>
        </table>
      </section>
    )
  }
}

export default connect(state=>({
  smc: state.sightMarkCalculator
}), dispatch=>({
  smActions: bindActionCreators(smActions, dispatch)
}))(SightMarkCalculator)

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as smActions from '../actions/sightMarkCalculator'
import {yardsToMetres, metresToYards, getSight, calcArrowSpeed} from '../utils/smCalc'
import './SightMarkCalculator.css'

const distances = Array.from(new Set(Array(90/5).fill().map((v,i)=>(i+1)*5).concat(
  Array(100/5).fill().map((v,i)=>Math.round(yardsToMetres((i+1)*5)))
))).sort((a,b)=>a-b)
const angles = Array(40/5*2+1).fill().map((v,i)=>(i-40/5)*5*Math.PI/180)

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
    const params = {Cd: 0.1, arm: 0.73+0.16, jaw: 0.14}
    const arrowSpeed = calcArrowSpeed(0.06-0.003, params)
    Object.assign(params, {arrowSpeed})
    const sightMarks = distances.map(d=>{
      //const arm = 0.73+0.16
      //const jaw = 0.14
      const angledMarks = angles.map(targetAngle=>{
        //const v = Math.sin(targetAngle)*d
        //console.log(d, targetAngle, params)
        return getSight(d, targetAngle, params)
        //return getSight(arrowSpeed, v, d*Math.cos(targetAngle), arm, jaw)
        //const anchoredSightHeight = 10.9 - sightHeight*100
        //const diff = sightHeight - preSight.sightHeight
        //return {sightMark: anchoredSightHeight.toFixed(3), targetAngle, diff}
      })
      return {
        angledMarks
      , distance: d
      }
    })
    const angleHeadings = angles.map(a=>(
      `${(a*180/Math.PI).toFixed(0)}deg`
    ))
    //console.log(sightMarks)

    return (
      <section className='SightMarkCalculator'>
        <h2>Archery Toolbox</h2>
        <p>Far distance (m)</p>
        <p>Close distance (m)</p>
        <p>Difference between far and close sight mark (cm)</p>
        <p>Reference distance</p>
        {arrowSpeed && <p>Arrow Speed: {arrowSpeed}m/s</p>}
        <table>
          <thead>
            <tr>
              <td />
              {angleHeadings.map(h=>(
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sightMarks.map(s=>(
            <tr key={s.distance}>
              <th>{s.distance}</th>
              {s.angledMarks.map((a,i)=>(
                <td key={`${s.distance}-${i}`}>{(a.sightHeight*100).toFixed(1)}</td>
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

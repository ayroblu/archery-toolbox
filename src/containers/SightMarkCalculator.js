import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import Toggle from 'material-ui/Toggle'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'

import * as smActions from '../actions/sightMarkCalculator'
import {yardsToMetres, metresToYards, getSight, calcArrowSpeed} from '../utils/smCalc'
import * as smcnd from '../utils/smNoDragCalc'
import './SightMarkCalculator.css'

const distances = Array.from(new Set(Array(90/5).fill().map((v,i)=>(i+1)*5).concat(
  Array(100/5).fill().map((v,i)=>Math.round(yardsToMetres((i+1)*5)))
))).concat([165, 170]).sort((a,b)=>a-b)
const angles = Array(40/5*2+1).fill().map((v,i)=>(i-40/5)*5*Math.PI/180)

class SightMarkCalculator extends Component {
  async componentWillMount(){
    await this._calculateArrowSpeed()
    await this._calculateSightMarks()
  }
  _validateArrowSpeed(){
    let {farDistance, shortDistance, diffSightMarks} = this.props.smc
    if (farDistance && shortDistance && diffSightMarks){
      farDistance = parseFloat(farDistance)
      shortDistance = parseFloat(shortDistance)
      diffSightMarks = parseFloat(diffSightMarks)/100
      if (farDistance && shortDistance && diffSightMarks) {
        return {
          farDistance
        , shortDistance
        , diffSightMarks
        }
      }
    }
    return {farDistance: 60, shortDistance: 20, diffSightMarks: 0.055-0.004}
  }
  _calculateArrowSpeed = ()=>{
    const {farDistance, shortDistance, diffSightMarks} = this._validateArrowSpeed()
    const {Cd, arm, jaw, faceSightDistance, eyeArrowDistance} = this.props.smc
    const params = {Cd, arm: parseFloat(faceSightDistance) || arm
    , jaw: parseFloat(eyeArrowDistance) || jaw}
    const arrowSpeed = calcArrowSpeed(farDistance, shortDistance, diffSightMarks, params)
    this.props.smActions.set({arrowSpeed})
  }
  _calculateSightMarks = ()=>{
    const {Cd, arm, jaw, arrowSpeed, useDrag, faceSightDistance, eyeArrowDistance} = this.props.smc
    const params = {Cd, arm: parseFloat(faceSightDistance) || arm
    , jaw: parseFloat(eyeArrowDistance) || jaw, arrowSpeed}

    if (useDrag){
      const referenceMark = smcnd.getSight({v: arrowSpeed, s_v: 0, s_h:18, arm, jaw}).sightHeight + 0.003
      const sightMarks = distances.map(d=>{
        const angledMarks = angles.map(targetAngle=>{
          const s_v = d*Math.sin(targetAngle)
          const s_h = d*Math.cos(targetAngle)
          return smcnd.getSight({v: arrowSpeed, s_v, s_h, arm, jaw})
        }).map(m=>({...m, sightHeight: referenceMark - m.sightHeight}))
        return {
          angledMarks
        , distance: d
        }
      })
      this.props.smActions.set({sightMarks})
    } else {
      const referenceMark = getSight(18, 0, params).sightHeight + 0.003
      const sightMarks = distances.map(d=>{
        const angledMarks = angles.map(targetAngle=>{
          return getSight(d, targetAngle, params)
        }).map(m=>({...m, sightHeight: referenceMark - m.sightHeight}))
        return {
          angledMarks
        , distance: d
        }
      })
      this.props.smActions.set({sightMarks})
    }
  }
  _renderSightMarksSensitivity(){
    const {faceSightDistance, arrowSpeed, eyeArrowDistance} = this.props.smc
    const arm = parseFloat(faceSightDistance)
    const jaw = parseFloat(eyeArrowDistance)
    const diffs = [{
      dist: 18, face: 40
    }, {
      dist: 30, face: 80
    }, {
      dist: 50, face: 80
    }, {
      dist: 70, face: 122
    }, {
      dist: 90, face: 122
    }].map(h=>{
      const hDiff = h.face/5/100/h.dist * parseFloat(faceSightDistance) * 1000
      const {sightHeight: flat} = smcnd.getSight({v: arrowSpeed, s_v: 0, s_h: h.dist, arm, jaw})
      const {sightHeight: above} = smcnd.getSight({v: arrowSpeed, s_v: h.face/5/100, s_h: h.dist, arm, jaw})
      const vDiff = (above - flat)*1000+hDiff
      return {...h, hDiff, vDiff}
    })
    return (
      <div>
        <h3>Sight Marks Sensitivity</h3>
        <p>Relative distances, mm to move per ring</p>
        {diffs.map(d=>(
          <p key={d.dist}>{d.dist}m, {d.face}cm: movement: {d.hDiff.toFixed(2)}mm horizontally, vertically: {d.vDiff.toFixed(2)}mm per coloured ring</p>
        ))}
      </div>
    )
  }
  _renderClout(){
    const {faceSightDistance, arrowSpeed, eyeArrowDistance} = this.props.smc
    const arm = parseFloat(faceSightDistance)
    const jaw = parseFloat(eyeArrowDistance)
    const diffs = [{
      dist: 165, face: 15
    }].map(h=>{
      const hDiff = h.face/5/h.dist * parseFloat(faceSightDistance) * 1000
      const {sightHeight: flat} = smcnd.getSight({v: arrowSpeed, s_v: 0, s_h: h.dist, arm, jaw})
      const {sightHeight: above} = smcnd.getSight({v: arrowSpeed, s_v: 0, s_h: h.dist + h.face/5, arm, jaw})
      const vDiff = -(above - flat)*1000
      return {...h, hDiff, vDiff}
    })
    const {theta} = smcnd.getSight({v: arrowSpeed, s_v: 0, s_h: 165, arm, jaw})
    const time = 165 / (arrowSpeed * Math.cos(theta))
    return (
      <div>
        <h3>Clout analysis</h3>
        <p>Relative distances, mm to move per ring</p>
        {diffs.map(d=>(
          <p key={d.dist}>{d.dist}m, {d.face}m: movement: {d.hDiff.toFixed(2)}mm horizontally, {d.vDiff.toFixed(2)}mm vertically per coloured ring</p>
        ))}
        <p>20m lollipop, to match size, you want: 1.8m... gold is 0.36m</p>
        <p>Lollipop: 15cm above ground in a 7.5cm diameter</p>
        <p>Time in the air: {time.toFixed(1)}s</p>
      </div>
    )
  }
  render() {
    const {smActions} = this.props
    const {farDistance, shortDistance, diffSightMarks, refDistance
    , faceSightDistance, eyeArrowDistance, arrowSpeed
    , useDrag, showAngles, sightMarks
    } = this.props.smc

    const angleHeadings = showAngles
    ? angles.map(a=>(
        `${(a*180/Math.PI).toFixed(0)}deg`
      ))
    : ['Sight Marks']

    const sm = (sightMarks && !showAngles)
    ? sightMarks.map(sm=>{
        return {...sm, angledMarks: [sm.angledMarks[8]]}
      })
    : sightMarks || []
    //const referenceDistance = sightMarks.find(s=>s.distance===18)

    return (
      <section className='SightMarkCalculator'>
        <h2>Sight Marks Calculator</h2>
        <div className='arrowSpeedCalc'>
          <h3>Arrow Speed parameters</h3>
          <div>
            <TextField
              hintText="Use a long distance sight mark"
              floatingLabelText="Far distance (m)"
              value={farDistance}
              onChange={e=>smActions.set({farDistance:e.target.value})}
            />
          </div>
          <div>
            <TextField
              hintText="Use a short distance sight mark"
              floatingLabelText="Short distance (m)"
              value={shortDistance}
              onChange={e=>smActions.set({shortDistance:e.target.value})}
            />
          </div>
          <div>
            <TextField
              hintText="Difference between sight marks"
              floatingLabelText="Sight Mark Difference (cm)"
              value={diffSightMarks}
              onChange={e=>smActions.set({diffSightMarks: e.target.value})}
            />
          </div>
          <RaisedButton label="Calculate Arrow Speed" primary={true} 
            onTouchTap={this._calculateArrowSpeed} />
          {arrowSpeed && <p>Arrow Speed: {arrowSpeed.toFixed(1)}m/s</p>}
        </div>
        <div>
          <SelectField
            floatingLabelText="Reference Distance (optional)"
            value={refDistance}
            maxHeight={300}
            onChange={(e,i,v)=>smActions.set({refDistance: v})}
          >
            {distances.map(d=>(
              <MenuItem value={d} primaryText={`${d}`} key={d} />
            ))}
          </SelectField>
        </div>
        <div>
          <TextField
            hintText="This is about your draw length + sight length"
            floatingLabelText="Face to sight distance"
            value={faceSightDistance}
            onChange={e=>smActions.set({faceSightDistance: e.target.value})}
          />
        </div>
        <div>
          <TextField
            hintText="This is the distance from your nock to your eye"
            floatingLabelText="Eye to Arrow distance"
            value={eyeArrowDistance}
            onChange={e=>smActions.set({eyeArrowDistance: e.target.value})}
          />
        </div>
        <div style={{width: '250px', margin: '10px 0'}}>
          <Toggle
            label="Include drag"
            toggled={useDrag}
            onToggle={(e, useDrag)=>smActions.set({useDrag})}
          />
        </div>
        <div style={{width: '250px', margin: '10px 0'}}>
          <Toggle
            label="Show angles"
            toggled={showAngles}
            onToggle={(e, showAngles)=>smActions.set({showAngles})}
          />
        </div>
        <RaisedButton label="Calculate Sight Marks" primary={true}
          onTouchTap={this._calculateSightMarks} />
        {this._renderSightMarksSensitivity()}
        {this._renderClout()}
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
            {sm.map(s=>(
            <tr key={s.distance}>
              <th>{s.distance}m ({metresToYards(s.distance).toFixed(1)}y)</th>
              {s.angledMarks.map((a,i)=>{
                const sightMark = (a.sightHeight*100).toFixed(1)
                const ref = a.sightHeight-s.angledMarks[showAngles ? 8 : 0].sightHeight
                //console.log('a,s', s.distance, a.sightHeight, s.angledMarks[8].sightHeight)
                return <td key={`${s.distance}-${i}`}>{sightMark} ({ref > 0 ? '+' : ''}{(ref*100).toFixed(1)})</td>
              })}
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

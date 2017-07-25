import { SET, RESET } from '../types/sightMarkCalculator'

const initialState = {
  // arrow speed calculator
  farDistance: '60'
, shortDistance: '18'
, farDistanceMark: '5.5'
, shortDistanceMark: '0.4'
, Cd: 0.1
, arm: 0.73+0.16
, jaw: 0.14

, refDistance: 18
, faceSightDistance: '0.9'
, eyeArrowDistance: '0.14'


, useDrag: false
, showAngles: false

// computed
, arrowSpeed: 55.1
}

export default function reducer(state=initialState, action) {
  switch (action.type) {
    case SET:
      return {...state, ...action.payload}
    case RESET:
      return {...initialState, ...action.payload}
    default:
      return state
  }
}

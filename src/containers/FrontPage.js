import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Link } from 'react-router-dom'

import * as mainActions from '../actions/main'
import './FrontPage.css'

class FrontPage extends Component {
  render() {
    return (
      <section className='FrontPage'>
        <h1>Archery Toolbox</h1>
        <ul>
          <li><Link to='/smc'>Calculate Sight Marks</Link></li>
          <li>Bow Tuning
            <ul>
              <li>Alignment</li>
              <li>Plunger tuning</li>
              <li>Spine</li>
              <li>Nocking point</li>
              <li>Tiller - static and dynamic</li>
              <li>Centre shot</li>
            </ul>
          </li>
          <li>Outline of some clout tips</li>
          <li>Bow efficiency</li>
        </ul>
      </section>
    )
  }
}

export default connect(state=>({
  main: state.main
}), dispatch=>({
  mainActions: bindActionCreators(mainActions, dispatch)
}))(FrontPage)

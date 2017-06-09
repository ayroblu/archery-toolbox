import React, {Component} from 'react'
//import PropTypes from 'prop-types'
import {Switch, Route} from 'react-router-dom'

import FrontPage from '../containers/FrontPage'
import SightMarkCalculator from '../containers/SightMarkCalculator'
import './Layout.css'

class Layout extends Component {
  static propTypes = {
  }
  render() {
    return (
      <Switch>
        <Route exact path='/' component={FrontPage} />
        <Route path='/smc' component={SightMarkCalculator} />
      </Switch>
    )
  }
}

export default Layout

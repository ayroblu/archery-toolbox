import React, { Component } from 'react'
import { withRouter, Switch, Route } from 'react-router-dom'
//import { connect } from 'react-redux'
//import { bindActionCreators } from 'redux'

import Layout from '../components/Layout'
//import NoMatch from '../components/NoMatch'

//import * as userActions from '../actions/user'

import './App.css'

class App extends Component {
  render() {
    return (
      <Switch>
        <Route path='/' component={Layout} />
      </Switch>
    );
  }
}

export default withRouter(App)

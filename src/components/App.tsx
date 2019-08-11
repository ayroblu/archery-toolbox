import React from "react";
import { withRouter, Switch, Route } from "react-router-dom";

//import NoMatch from '../components/NoMatch'

import "./App.css";

import { FrontPage } from "../components/front-page/FrontPage";
import { SightMarkCalculator } from "../components/sight-mark-calculator/SightMarkCalculator";

const AppComp: React.FC = () => {
  return (
    <Switch>
      <Route exact path="/" component={FrontPage} />
      <Route path="/smc" component={SightMarkCalculator} />
    </Switch>
  );
};

export const App = withRouter(AppComp);

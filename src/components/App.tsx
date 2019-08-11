import "./App.css";

import React from "react";
import { HashRouter, Route, Switch, BrowserRouter } from "react-router-dom";

import { FrontPage } from "../components/front-page/FrontPage";
import { SightMarkCalculator } from "../components/sight-mark-calculator/SightMarkCalculator";

//import NoMatch from '../components/NoMatch'

const Routes: React.FC = () => (
  <Switch>
    <Route exact path="/" component={FrontPage} />
    <Route path="/smc" component={SightMarkCalculator} />
  </Switch>
);
export const App: React.FC = () => {
  const isHashRouter = process.env.REACT_APP_GH_PAGES;
  // For some reason couldn't define another component with types
  if (isHashRouter) {
    return (
      <HashRouter>
        <Routes />
      </HashRouter>
    );
  }
  return (
    <BrowserRouter>
      <Routes />
    </BrowserRouter>
  );
};

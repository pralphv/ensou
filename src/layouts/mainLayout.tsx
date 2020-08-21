import React from "react";
import { Router, Switch } from "react-router-dom";
import { createBrowserHistory } from "history";

import * as pages from "../pages";
import CustomRoute from "./customRoute";
import { Pages } from "./constants";

const history = createBrowserHistory();

interface RouteProps {
  path: string;
  Component: React.ReactType;
  isPrivate: boolean;
}

const ROUTES: RouteProps[] = [
  { path: Pages.Login, Component: pages.Login, isPrivate: false },
  { path: Pages.Home, Component: pages.Home, isPrivate: false },
  { path: Pages.Interface, Component: pages.Interface, isPrivate: false },
  // { path: Pages.Login, Component: pages.Login, isPrivate: false },
  // {
  //   path: Pages.Register,
  //   Component: pages.Register,
  //   isPrivate: false,
  // },
  // {
  //   path: Pages.ForgotPassword,
  //   Component: pages.ForgotPassword,
  //   isPrivate: false,
  // },
];

function MainLayout(): JSX.Element {
  return (
    <Router history={history}>
      <Switch>
        {ROUTES.map(({ path, Component, isPrivate }: RouteProps) => (
          <CustomRoute
            key={path}
            exact
            path={path}
            Component={Component}
            isPrivate={isPrivate}
          />
        ))}
        {/* <Route component={pages.Error404Page} /> */}
      </Switch>
    </Router>
  );
}

export default MainLayout;

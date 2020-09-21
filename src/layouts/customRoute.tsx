import React from "react";
import clsx from "clsx";
import { Route, Redirect } from "react-router-dom";

import { makeStyles } from "@material-ui/core";

import Navigation from "./navigation";
import { Pages } from "./constants";
import { useIsMobile } from "utils/customHooks";

export interface CustomRouteProps {
  Component: React.ElementType;
  isPrivate: boolean;
  [x: string]: any;
}

function CustomRoute({
  Component,
  isPrivate = false,
  ...rest
}: CustomRouteProps) {
  // const isLoggedIn = useLoggedIn();
  // const isVerified = useIsVerified();
  // const isAuthLoaded = useIsAuthLoaded();
  const isLoggedIn = true;
  const isVerified = true;
  const isAuthLoaded = true;

  return (
    <Route
      {...rest}
      render={(renderProps: any) => {
        if (isAuthLoaded && isPrivate && !isLoggedIn) {
          return <Redirect to={{ pathname: Pages.Login }} />;
        } else if (isAuthLoaded && isPrivate && !isVerified) {
          return <Redirect to={{ pathname: Pages.Verify }} />;
        } else {
          return (
            <Navigation>
              <div>
                <Component {...renderProps} />
              </div>
            </Navigation>
          );
        }
      }}
    />
  );
}

export default CustomRoute;

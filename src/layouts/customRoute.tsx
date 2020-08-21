import React from "react";
import clsx from "clsx";
import { Route, Redirect } from "react-router-dom";

import { makeStyles } from "@material-ui/core";

import Navigation from "./navigation";
import { Pages } from "./constants";
import { useIsMobile } from "utils/customHooks";

const useStyles = makeStyles((theme) => ({
  paddingLeft: {
    paddingLeft: theme.spacing(7) + 1,
  },
  paddingBottom: {
    paddingBottom: "60px",
  },
}));

export interface CustomRouteProps {
  Component: React.ReactType;
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
  const isMobile: boolean = useIsMobile();
  const classes = useStyles();

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
              <div
                className={clsx({
                  [classes.paddingLeft]: !isMobile,
                  [classes.paddingBottom]: isMobile,
                })}
              >
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

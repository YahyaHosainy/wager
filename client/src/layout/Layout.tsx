import * as React from "react";
import { Route, RouteProps } from "react-router-dom";
import UpdatedHeader from "./UpdatedHeader";

interface LayoutProps extends RouteProps {
  children?: React.ReactNode;
}

const Layout = ({ children, ...routeProps }: LayoutProps) => (
  <Route
    {...routeProps}
    render={(matchProps: RouteProps) => (
      <>
        <UpdatedHeader />
        {children}
      </>
    )}
  />
);

export default Layout;

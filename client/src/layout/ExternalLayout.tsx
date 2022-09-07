import * as React from "react";
import { Route, RouteProps } from "react-router-dom";

interface LayoutProps extends RouteProps {
  children?: React.ReactNode;
}

const Layout = ({ children, ...routeProps }: LayoutProps) => (
  <Route {...routeProps} render={(matchProps: RouteProps) => <>{children}</>} />
);

export default Layout;

import React from "react";
import { connect } from "react-redux";
import { Route, Redirect } from "react-router-dom";

interface PrivateRouteProps {
  component: any;
  token: string;
  isAuthenticated: boolean;
  // All other props
  [key: string]: React.ReactNode;
}

const PrivateRoute: React.FunctionComponent<PrivateRouteProps> = ({
  ...props
}) => {
  const isAuthenticated = Boolean(props.isAuthenticated && props.token);
  const { component: PropComponent, ...rest } = props;

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? <PropComponent {...props} /> : <Redirect to="/" />
      }
    />
  );
};
const mapStateToProps = (state) => ({
  isAuthenticated: state.user.isAuthenticated,
  token: state.user.token,
});

export default connect(mapStateToProps)(PrivateRoute);

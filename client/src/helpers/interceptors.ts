import axios, { AxiosResponse } from "axios";
import { UserActionTypes } from "../user/types";
import * as Sentry from "@sentry/react";

export function setupInterceptors(dispatch) {
  const handleResponse = function (response: AxiosResponse) {
    return response;
  };

  const handleError = function (response: AxiosResponse) {
    if (!response) {
      return;
    }

    if ([401, 403].includes(response.status || response.request?.status)) {
      // auto logout if 401 or 403 response returned from api

      Sentry.addBreadcrumb({
        category: "auth",
        message: "Auth error request",
        data: response,
        level: Sentry.Severity.Info,
      });

      dispatch({
        type: UserActionTypes.LOGOUT,
        isAuthenticated: false,
        user: null,
        token: null,
      });
    }
  };
  axios.interceptors.response.use(handleResponse, handleError);
}

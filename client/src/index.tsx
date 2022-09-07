import React from "react";
import ReactDOM from "react-dom";
import { createStore, applyMiddleware } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { composeWithDevTools } from "redux-devtools-extension/developmentOnly";
import { Provider } from "react-redux";
import storage from "redux-persist/lib/storage";
import * as serviceWorker from "./serviceWorker";
import rootReducer from "./reducers";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { setupInterceptors } from "./helpers/interceptors";
import createSagaMiddleware from "redux-saga";
import rootSaga from "./sagas";
import App from "./App";
import moment from "moment";

Sentry.init({
  dsn: "https://accc15e6f5624d12b220c8c8def0f824@o508446.ingest.sentry.io/5600982",
  autoSessionTracking: true,
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: 1.0,
  enabled: process.env.NODE_ENV === "production",
});

moment.locale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "seconds",
    ss: "%ss",
    m: "a minute",
    mm: "%dm",
    h: "an hour",
    hh: "%dh",
    d: "a day",
    dd: "%dd",
    M: "a month",
    MM: "%dM",
    y: "a year",
    yy: "%dY",
  },
});

const persistConfig = {
  key: "root",
  storage,
  blacklist: ["party"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  persistedReducer,
  composeWithDevTools(applyMiddleware(sagaMiddleware))
);
const persistor = persistStore(store);
sagaMiddleware.run(rootSaga);
setupInterceptors(store.dispatch);

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

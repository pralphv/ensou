import React from "react";
import ReactDOM from "react-dom";
import store from "./app/store";
import App from "./app/App";
import { Provider } from "react-redux";

import "./index.css";

const VERSION = "1.0.0";
const LOCAL_STORAGE_VERSION_KEY = "appVersion";

function render() {
  const userVersion = localStorage.getItem(LOCAL_STORAGE_VERSION_KEY);
  if (userVersion !== VERSION) {
    localStorage.clear();
    localStorage.setItem(LOCAL_STORAGE_VERSION_KEY, VERSION);
    window.location.reload();
  }

  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById("root")
  );
}

render();

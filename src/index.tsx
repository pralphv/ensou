import React from "react";
import ReactDOM from "react-dom";
import store from "./app/store";
import App from "./app/App";
import { Provider } from "react-redux";

import "./index.css";

function render() {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById("root")
  );
}

render();

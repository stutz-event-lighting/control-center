var React = require("react");
var ReactDOM = require("react-dom");
var moment = require("moment");
var client = require("./client");
var localize = require("react-widgets/lib/localizers/moment");
var { RootComponent } = require("react-route-system");
require("moment/locale/de");
require("babel-polyfill");
require("whatwg-fetch");

moment.locale("de-CH");
localize(moment);

var App = require("./views/app");

Object.assign = function (obj) {
  for (var i = 1; i < arguments.length; i++) {
    for (var key in arguments[i]) {
      obj[key] = arguments[i][key];
    }
  }
  return obj;
};

window.onload = async function () {
  try {
    ReactDOM.render(
      React.createElement(RootComponent, { component: App }),
      document.body
    );
  } catch (e) {
    alert(e.message + e.stack);
    console.error(e);
  }
};

"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tableMy = void 0;
var _index = _interopRequireDefault(require("./index.vue"));
var withInstall = function withInstall(component, alias) {
  component.install = function (app) {
    var compName = component.name || component.displayName;
    if (!compName) return;
    app.component(compName, component);
    if (alias) {
      app.config.globalProperties[alias] = component;
    }
  };
  return component;
};
var tableMy = exports.tableMy = withInstall(_index.default);
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _vue = require("vue");
var _default = exports.default = (0, _vue.defineComponent)({
  compatConfig: {
    MODE: 3
  },
  // emits: ['click', 'mousedown'],
  setup: function setup(_props, _ref) {
    var expose = _ref.expose;
    (0, _vue.onMounted)(function () {
      console.log("开始挂载");
    });
    expose({});
    return function () {
      return (0, _vue.createVNode)("div", null, [(0, _vue.createTextVNode)("\u4F60\u597D")]);
    };
  }
});
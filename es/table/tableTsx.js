import { createVNode as _createVNode, createTextVNode as _createTextVNode } from "vue";
import { defineComponent, onMounted } from 'vue';
export default defineComponent({
  compatConfig: {
    MODE: 3
  },
  // emits: ['click', 'mousedown'],
  setup: function setup(_props, _ref) {
    var expose = _ref.expose;
    onMounted(function () {
      console.log("开始挂载");
    });
    expose({});
    return function () {
      return _createVNode("div", null, [_createTextVNode("\u4F60\u597D")]);
    };
  }
});
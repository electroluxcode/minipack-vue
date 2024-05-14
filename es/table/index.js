import Table from './index.vue';
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
export var tableMy = withInstall(Table);
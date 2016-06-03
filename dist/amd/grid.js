define(["require", "exports", './grid/config', './grid/constants', './grid/column', './grid/grid', './grid/pluginability', './grid/grid-internals', './grid/grid-options'], function (require, exports, config_1, constants_1, column_1, grid_1, pluginability_1, grid_internals_1, grid_options_1) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    function configure(aurelia, configFunc) {
        aurelia.globalResources('./grid/grid');
        aurelia.globalResources('./grid/converters/translate');
        if (typeof configFunc === "function") {
            configFunc(config_1.gridConfig);
        }
    }
    exports.configure = configure;
    __export(constants_1);
    __export(column_1);
    __export(grid_1);
    __export(pluginability_1);
    __export(grid_internals_1);
    __export(grid_options_1);
});

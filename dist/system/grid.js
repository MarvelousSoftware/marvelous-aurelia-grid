System.register(['./grid/config', './grid/constants', './grid/column', './grid/grid', './grid/pluginability', './grid/grid-internals', './grid/grid-options'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var config_1;
    function configure(aurelia, configFunc) {
        aurelia.globalResources('./grid/grid');
        aurelia.globalResources('./grid/converters/translate');
        if (typeof configFunc === "function") {
            configFunc(config_1.gridConfig);
        }
    }
    exports_1("configure", configure);
    var exportedNames_1 = {
        'configure': true
    };
    function exportStar_1(m) {
        var exports = {};
        for(var n in m) {
            if (n !== "default"&& !exportedNames_1.hasOwnProperty(n)) exports[n] = m[n];
        }
        exports_1(exports);
    }
    return {
        setters:[
            function (config_1_1) {
                config_1 = config_1_1;
            },
            function (constants_1_1) {
                exportStar_1(constants_1_1);
            },
            function (column_1_1) {
                exportStar_1(column_1_1);
            },
            function (grid_1_1) {
                exportStar_1(grid_1_1);
            },
            function (pluginability_1_1) {
                exportStar_1(pluginability_1_1);
            },
            function (grid_internals_1_1) {
                exportStar_1(grid_internals_1_1);
            },
            function (grid_options_1_1) {
                exportStar_1(grid_options_1_1);
            }],
        execute: function() {
        }
    }
});

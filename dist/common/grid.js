System.register(['./grid/constants', './grid/column', './grid/grid', './grid/gridRenderer', './grid/pluginability', './grid/gridInternals', './grid/gridOptions'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function configure(aurelia) {
        aurelia.globalResources('./grid/grid');
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
            function (constants_1_1) {
                exportStar_1(constants_1_1);
            },
            function (column_1_1) {
                exportStar_1(column_1_1);
            },
            function (grid_1_1) {
                exportStar_1(grid_1_1);
            },
            function (gridRenderer_1_1) {
                exportStar_1(gridRenderer_1_1);
            },
            function (pluginability_1_1) {
                exportStar_1(pluginability_1_1);
            },
            function (gridInternals_1_1) {
                exportStar_1(gridInternals_1_1);
            },
            function (gridOptions_1_1) {
                exportStar_1(gridOptions_1_1);
            }],
        execute: function() {
        }
    }
});

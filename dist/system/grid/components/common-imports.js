System.register(['../data-source/data-source', '../grid-options', '../grid-internals', '../pluginability'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    return {
        setters:[
            function (data_source_1_1) {
                exports_1({
                    "DataSource": data_source_1_1["DataSource"]
                });
            },
            function (grid_options_1_1) {
                exports_1({
                    "GridOptions": grid_options_1_1["GridOptions"]
                });
            },
            function (grid_internals_1_1) {
                exports_1({
                    "GridInternals": grid_internals_1_1["GridInternals"]
                });
            },
            function (pluginability_1_1) {
                exports_1({
                    "GridComponent": pluginability_1_1["GridComponent"]
                });
            }],
        execute: function() {
        }
    }
});

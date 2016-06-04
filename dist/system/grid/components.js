System.register(['./components/pagination', './components/filter-row', './components/sorting', './components/grouping', './components/query-language', './components/column-chooser', './components/toolbox', './components/column-reordering', './components/selection'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function exportStar_1(m) {
        var exports = {};
        for(var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_1(exports);
    }
    return {
        setters:[
            function (pagination_1_1) {
                exportStar_1(pagination_1_1);
            },
            function (filter_row_1_1) {
                exportStar_1(filter_row_1_1);
            },
            function (sorting_1_1) {
                exportStar_1(sorting_1_1);
            },
            function (grouping_1_1) {
                exportStar_1(grouping_1_1);
            },
            function (query_language_1_1) {
                exportStar_1(query_language_1_1);
            },
            function (column_chooser_1_1) {
                exportStar_1(column_chooser_1_1);
            },
            function (toolbox_1_1) {
                exportStar_1(toolbox_1_1);
            },
            function (column_reordering_1_1) {
                exportStar_1(column_reordering_1_1);
            },
            function (selection_1_1) {
                exportStar_1(selection_1_1);
            }],
        execute: function() {
        }
    }
});

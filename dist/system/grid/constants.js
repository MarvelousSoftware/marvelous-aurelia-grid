System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var componentPosition, componentLayout, sortingMode, dataSourceMode;
    return {
        setters:[],
        execute: function() {
            exports_1("componentPosition", componentPosition = {
                footer: 'footer',
                top: 'top',
                afterColumns: 'afterColumns',
                background: 'background'
            });
            exports_1("componentLayout", componentLayout = {
                forEachColumn: 'forEachColumn',
                full: 'full'
            });
            exports_1("sortingMode", sortingMode = {
                single: 'single',
                multiple: 'multiple'
            });
            exports_1("dataSourceMode", dataSourceMode = {
                clientSide: 'clientSide',
                serverSide: 'serverSide',
            });
        }
    }
});

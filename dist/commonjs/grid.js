"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var config_1 = require('./grid/config');
function configure(aurelia, configFunc) {
    aurelia.globalResources('./grid/grid');
    aurelia.globalResources('./grid/converters/translate');
    if (typeof configFunc === "function") {
        configFunc(config_1.gridConfig);
    }
}
exports.configure = configure;
__export(require('./grid/constants'));
__export(require('./grid/column'));
__export(require('./grid/grid'));
__export(require('./grid/pluginability'));
__export(require('./grid/grid-internals'));
__export(require('./grid/grid-options'));

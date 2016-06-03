"use strict";
var utils_1 = require('marvelous-aurelia-core/utils');
var client_side_data_source_1 = require('./client-side-data-source');
var server_side_data_source_1 = require('./server-side-data-source');
var DataSourceManager = (function () {
    function DataSourceManager(grid) {
        var _this = this;
        this.grid = grid;
        this._dataSources = {};
        this._options = this.createOptions();
        // TODO: custom data sources (on app configure?)
        this.add(client_side_data_source_1.ClientSideDataSource.modeName, function (x) { return new client_side_data_source_1.ClientSideDataSource(x, _this._options); });
        this.add(server_side_data_source_1.ServerSideDataSource.modeName, function (x) { return new server_side_data_source_1.ServerSideDataSource(x, _this._options); });
    }
    DataSourceManager.prototype.add = function (mode, create) {
        if (this._dataSources[mode]) {
            throw new Error("DataSource with " + mode + " mode already declared.");
        }
        this._dataSources[mode] = create;
    };
    DataSourceManager.prototype.createDataSource = function () {
        var mode = this._options.mode;
        if (!this._dataSources[mode]) {
            throw new Error("'" + mode + "' mode is not defined.");
        }
        return this._dataSources[mode](this.grid, this._options);
    };
    DataSourceManager.prototype.createOptions = function () {
        var ds = this.grid.options.codeBased.dataSource || {};
        var domDs = this.grid.domSettingsReader.getSingleOrDefault('data-source');
        ds.read = ds.read || domDs.get('read').evaluate();
        if (!ds.read) {
            throw new Error('dataSource.read method not defined. Please delare it in the options.');
        }
        var read = utils_1.Utils.createReadFunction(ds.read, {
            params: function (context) { return context.params; },
            allowData: true,
            allowUndefined: true,
            shouldReturnUrlOrPromiseError: '`read` function should return url or promise or data.'
        });
        ds.read = read;
        ds.mode = ds.mode || domDs.get('mode').evaluate() || client_side_data_source_1.ClientSideDataSource.modeName;
        ds.debounce = ds.debounce || 50;
        return ds;
    };
    DataSourceManager.createReadMethod = function (read) {
        if (read instanceof Function) {
            return read;
        }
        if (typeof read == "string") {
            // read should be an url
            return function (context) { return utils_1.Utils.sendAjax(read, context.params); };
        }
        return function () {
            var result = {
                then: undefined
            };
            result.then = function (callback) {
                callback(read);
                return result;
            };
            return result;
        };
    };
    return DataSourceManager;
}());
exports.DataSourceManager = DataSourceManager;

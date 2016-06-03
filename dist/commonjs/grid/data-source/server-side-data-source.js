"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var all_1 = require('../all');
var constants_1 = require('../constants');
var ServerSideDataSource = (function (_super) {
    __extends(ServerSideDataSource, _super);
    function ServerSideDataSource(grid, options) {
        var _this = this;
        _super.call(this, grid, options);
        this._getOnlyVisible = false;
        this._getOnlyVisible = this.grid.optionsReader.get('data-source get-only-visible-columns').evaluate();
        this.grid.subs.push(this.grid.aureliaUtils.observe(this.grid.internals, 'mainColumns', function () {
            // before the initialization finish mainColumns may change, but this module is not
            // resposible for handling it - the main grid is
            if (!_this.grid.initialized) {
                return;
            }
            // refresh is needed only if only visible columns are being downloaded
            // otherwise all columns are already in the memory so there's no point 
            // in refreshing the grid
            if (!_this._getOnlyVisible) {
                return;
            }
            _this.grid.internals.refresh();
        }));
    }
    /**
     * Serializes parameters.
     */
    ServerSideDataSource.prototype.beforeRead = function (params) {
        if (params.sortBy) {
            params.sortBy = params.sortBy.map(function (x) {
                return {
                    member: x.column.field,
                    direction: x.direction
                };
            });
        }
        params.fields = this.grid.internals.mainColumns.map(function (x) { return x.field; });
        if (this._getOnlyVisible) {
            params.getOnlyVisibleColumns = true;
        }
        // TODO: window.btoa doesn't work on IE9
        return {
            marvelousParams: window.btoa(JSON.stringify(params))
        };
    };
    ServerSideDataSource.prototype.transformResult = function (result, params) {
        if (result.total === undefined) {
            throw new Error("'total' field is missing from the server-side response.");
        }
        if (result.data === undefined) {
            throw new Error("'data' field is missing from the server-side response.");
        }
        if (params.pageSize) {
            // removes data if server side returens too many items
            result.data.splice(params.pageSize, result.data.length - params.pageSize);
        }
        return {
            total: result.total,
            data: result.data
        };
    };
    ServerSideDataSource.prototype.addItem = function (item) {
        this.rawResult.data.unshift(item);
        this.setNewResult(this.rawResult, this.lastParams);
    };
    ServerSideDataSource.prototype.removeItem = function (item) {
        this.rawResult.data.splice(this.rawResult.data.indexOf(item), 1);
        this.setNewResult(this.rawResult, this.lastParams);
    };
    ServerSideDataSource.modeName = constants_1.dataSourceMode.serverSide;
    return ServerSideDataSource;
}(all_1.DataSource));
exports.ServerSideDataSource = ServerSideDataSource;

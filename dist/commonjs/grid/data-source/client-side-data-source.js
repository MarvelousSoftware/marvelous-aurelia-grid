"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var utils_1 = require('marvelous-aurelia-core/utils');
var all_1 = require('../all');
var constants_1 = require('../constants');
var ClientSideDataSource = (function (_super) {
    __extends(ClientSideDataSource, _super);
    function ClientSideDataSource() {
        _super.apply(this, arguments);
    }
    ClientSideDataSource.prototype.transformResult = function (result, params) {
        var total = result.length;
        result = result.slice(result);
        if (params.sortBy && params.sortBy.length) {
            var sortBy_1 = [];
            params.sortBy.forEach(function (x) {
                sortBy_1.push({
                    name: x.column.field,
                    order: x.direction
                });
            });
            result = result.sort(utils_1.Utils.sortByMultiple(sortBy_1));
        }
        if (params.page && params.pageSize) {
            var skip = (params.page - 1) * params.pageSize;
            result.splice(0, skip);
            result.splice(params.pageSize, result.length - params.pageSize);
        }
        return {
            total: total,
            data: result
        };
    };
    ClientSideDataSource.prototype.addItem = function (item) {
        this.rawResult.unshift(item);
        this.setNewResult(this.rawResult, this.lastParams);
    };
    ClientSideDataSource.prototype.removeItem = function (item) {
        this.rawResult.splice(this.rawResult.indexOf(item), 1);
        this.setNewResult(this.rawResult, this.lastParams);
    };
    ClientSideDataSource.modeName = constants_1.dataSourceMode.clientSide;
    return ClientSideDataSource;
}(all_1.DataSource));
exports.ClientSideDataSource = ClientSideDataSource;

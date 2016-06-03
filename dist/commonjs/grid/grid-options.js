"use strict";
var column_1 = require('./models/column');
var GridOptions = (function () {
    function GridOptions(_gridInternals, reader, domBased, codeBasedOptions) {
        this._gridInternals = _gridInternals;
        this.reader = reader;
        this.domBased = domBased;
        /**
         * Array of all defined columns.
         * NOTE: code based defined columns has higher priority.
         */
        this.columns = [];
        /**
         * All code based defined options.
         */
        this.codeBased = {};
        this._parseDomBasedOptions();
        this._parseCodeBasedOptions(codeBasedOptions);
    }
    GridOptions.prototype.validate = function () {
        var ids = {};
        if (!this.columns.length) {
            throw new Error('Grid needs at least one defined column.');
        }
        this.columns.forEach(function (x) {
            var uniqueId = x.getUniqueId();
            if (ids[uniqueId] === true) {
                throw new Error(("Columns has to provide unique id and '" + uniqueId + "' is not unique. By default id is a concatenation of field, heading and template. ") +
                    "This kind of concatenation not always results in unique id. If it doesn't in your case then just " +
                    "provide 'explicit-id=\"someUniqueValue\"' on the column definition.");
            }
            ids[uniqueId] = true;
        });
    };
    GridOptions.prototype._parseDomBasedOptions = function () {
        var _this = this;
        var id = 0;
        var columns = this.reader.getAll('columns column');
        columns.forEach(function (c) {
            var attrs = {};
            c.getAllProperties().forEach(function (x) { return attrs[x.name] = x.evaluate(); });
            var element = c.element || {};
            // TODO: allow to specify a template in code based approach
            _this.columns.push(new column_1.Column(++id, attrs, element.innerHTML, _this._gridInternals));
        });
    };
    GridOptions.prototype._parseCodeBasedOptions = function (options) {
        this.codeBased = options || this.codeBased;
    };
    // TODO: ColumnsArray extends Column[] ??
    GridOptions.prototype.getColumnById = function (id) {
        var columns = this.columns.filter(function (x) { return x.id == id; });
        if (!columns.length) {
            return undefined;
        }
        return columns[0];
    };
    GridOptions.prototype.getColumnByUniqueId = function (uniqueId) {
        var columns = this.columns.filter(function (x) { return x.getUniqueId() === uniqueId; });
        if (!columns.length) {
            return undefined;
        }
        return columns[0];
    };
    GridOptions.prototype.getColumnByElement = function (element) {
        return this.getColumnById(element.attributes["data-id"].value);
    };
    return GridOptions;
}());
exports.GridOptions = GridOptions;

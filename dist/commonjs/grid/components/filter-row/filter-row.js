"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var aurelia_dependency_injection_1 = require('aurelia-dependency-injection');
var pluginability_1 = require('../../pluginability');
var data_source_1 = require('../../data-source/data-source');
var grid_internals_1 = require('../../grid-internals');
var grid_options_1 = require('../../grid-options');
var column_1 = require('../../models/column');
var aureliaUtils_1 = require('marvelous-aurelia-core/aureliaUtils');
var FilterRowComponent = (function (_super) {
    __extends(FilterRowComponent, _super);
    function FilterRowComponent(_dataSource, _aureliaUtils, _gridInternals, _gridOptions, _column) {
        _super.call(this);
        this._dataSource = _dataSource;
        this._aureliaUtils = _aureliaUtils;
        this._gridInternals = _gridInternals;
        this._gridOptions = _gridOptions;
        this._column = _column;
        this.compareOperators = [];
        this.allCompareOperators = {
            'Equal': {
                name: 'Equal',
                value: 'filter-row/equal',
                textRequired: true
            },
            'NotEqual': {
                name: 'NotEqual',
                value: 'filter-row/not-equal',
                textRequired: true
            },
            'Empty': {
                name: 'Empty',
                value: 'filter-row/empty',
                textRequired: false
            },
            'NotEmpty': {
                name: 'NotEmpty',
                value: 'filter-row/not-empty',
                textRequired: false
            },
            'StartsWith': {
                name: 'StartsWith',
                value: 'filter-row/starts-with',
                textRequired: true
            },
            'EndsWith': {
                name: 'EndsWith',
                value: 'filter-row/ends-with',
                textRequired: true
            },
            'Contains': {
                name: 'Contains',
                value: 'filter-row/contains',
                textRequired: true
            },
            'GreaterThan': {
                name: 'GreaterThan',
                value: 'filter-row/greater-than',
                textRequired: true
            },
            'GreaterThanOrEqual': {
                name: 'GreaterThanOrEqual',
                value: 'filter-row/greater-than-or-equal',
                textRequired: true
            },
            'LessThan': {
                name: 'LessThan',
                value: 'filter-row/less-than',
                textRequired: true
            },
            'LessThanOrEqual': {
                name: 'LessThanOrEqual',
                value: 'filter-row/less-than-or-equal',
                textRequired: true
            },
            'IsTrue': {
                name: 'IsTrue',
                value: 'filter-row/is-true',
                textRequired: false
            },
            'IsFalse': {
                name: 'IsFalse',
                value: 'filter-row/is-false',
                textRequired: false
            }
        };
    }
    FilterRowComponent.prototype.start = function () {
        var _this = this;
        this.type = this._column.other.type || 'string';
        this.nullable = this._column.other.nullable !== undefined ? this._column.other.nullable !== 'false' : true;
        this.compareOperators = this._getCompareOperators(this.type, this.nullable);
        this.subs = [
            this._dataSource.subscribe('DataRead', function (params) { return _this._onDataRead(params); }),
            this._aureliaUtils.observe(this, 'selectedCompareOperator', function (n, o) { _this._selectedCompareOperatorChanged(n, o); })
        ];
    };
    FilterRowComponent.prototype.saveState = function (state) {
        if (!this.selectedCompareOperator && !this.compareText) {
            return;
        }
        state[this._column.getUniqueId()] = {
            selectedCompareOperator: this.selectedCompareOperator,
            compareText: this.compareText
        };
    };
    FilterRowComponent.prototype.loadState = function (state) {
        var filtering = state[this._column.getUniqueId()];
        if (!filtering) {
            return;
        }
        if (filtering.selectedCompareOperator) {
            this.selectCompareOperator(filtering.selectedCompareOperator.name);
        }
        this.compareText = filtering.compareText;
    };
    FilterRowComponent.prototype.selectCompareOperator = function (name) {
        var operator = this.compareOperators.filter(function (x) { return x.name === name; });
        if (operator.length === 0) {
            return;
        }
        this.selectedCompareOperator = operator[0];
    };
    FilterRowComponent.prototype._onDataRead = function (params) {
        if (!this.selectedCompareOperator) {
            return;
        }
        if (this.selectedCompareOperator.textRequired && !this.compareText) {
            return;
        }
        params.filtering = params.filtering || {};
        var fieldFilterings = params.filtering[this._column.field] || [];
        fieldFilterings.push({
            compareOperator: this.selectedCompareOperator.name,
            value: this.compareText
        });
        params.filtering[this._column.field] = fieldFilterings;
    };
    FilterRowComponent.prototype._getCompareOperators = function (type, nullable) {
        var _this = this;
        var operators;
        switch (type) {
            case 'string':
                operators = ['Equal', 'NotEqual', 'StartsWith', 'EndsWith', 'Contains'];
                break;
            case 'number':
            case 'date':
                operators = ['Equal', 'NotEqual', 'GreaterThan', 'GreaterThanOrEqual',
                    'LessThan', 'LessThanOrEqual'];
                break;
            case 'boolean':
                operators = ['IsTrue', 'IsFalse'];
                break;
            default:
                throw new Error("Type '" + this.type + "' is not supported by filter row.");
        }
        if (nullable) {
            operators.push('Empty');
            operators.push('NotEmpty');
        }
        return operators.map(function (x) { return _this.allCompareOperators[x]; });
    };
    FilterRowComponent.prototype.refresh = function () {
        if (this.selectedCompareOperator.textRequired) {
            if (this._lastSubmittedCompareOperator === this.selectedCompareOperator && this._lastSubmittedCompareText === this.compareText) {
                return;
            }
            if (!this._lastSubmittedCompareText && !this.compareText) {
                // there's no text to compare and text wasn't just removed
                // so there's no need to refresh
                return;
            }
        }
        else {
            if (this._lastSubmittedCompareOperator === this.selectedCompareOperator) {
                // compare operator not changed
                return;
            }
        }
        if (!this.selectedCompareOperator && this._prevCompareOperator && this._prevCompareOperator.textRequired && !this.compareText) {
            // if previous compare operator was not used then there's no need to refresh
            // and it was not used if compareText is null and operator required it to have
            // some text
            return;
        }
        this._lastSubmittedCompareOperator = this.selectedCompareOperator;
        this._lastSubmittedCompareText = this.compareText;
        this._gridInternals.refresh();
    };
    FilterRowComponent.prototype._selectedCompareOperatorChanged = function (newOp, oldOp) {
        if (oldOp === undefined) {
            // first call, no need to react
            return;
        }
        if (newOp.textRequired && !this.compareText) {
            return;
        }
        this._prevCompareOperator = oldOp;
        this.refresh();
        if (!newOp) {
            this.compareText = undefined;
        }
    };
    FilterRowComponent.prototype._onCompareTextWrite = function (event) {
        if (event.which === 13) {
            // on enter
            this.refresh();
            return false;
        }
        return true;
    };
    FilterRowComponent.prototype.createOptions = function () {
        if (!this._gridOptions.domBased.has('filter-row') && !this._gridOptions.codeBased.filterRow) {
            return false;
        }
        if (this._column.other['row-filtering-disabled']) {
            return false;
        }
        if (!this._column.field) {
            return false;
        }
        return {};
    };
    FilterRowComponent = __decorate([
        aurelia_dependency_injection_1.inject(data_source_1.DataSource, aureliaUtils_1.AureliaUtils, grid_internals_1.GridInternals, grid_options_1.GridOptions, column_1.Column)
    ], FilterRowComponent);
    return FilterRowComponent;
}(pluginability_1.GridComponent));
exports.FilterRowComponent = FilterRowComponent;

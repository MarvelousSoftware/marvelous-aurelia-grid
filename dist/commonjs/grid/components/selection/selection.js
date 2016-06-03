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
var common_imports_1 = require('../common-imports');
var grid_renderer_1 = require('../../grid-renderer');
var SelectionComponent = (function (_super) {
    __extends(SelectionComponent, _super);
    function SelectionComponent(_gridInternals, _gridOptions, _dataSource) {
        _super.call(this);
        this._gridInternals = _gridInternals;
        this._gridOptions = _gridOptions;
        this._dataSource = _dataSource;
        this.selectedItems = [];
    }
    SelectionComponent.prototype.start = function () {
        var _this = this;
        this.subs = [
            this._gridInternals.subscribe('RowClick', function (event) { return _this._onRowClick(event); }),
            this._dataSource.subscribe('DataRead', function (params) { return _this.clear(); })
        ];
    };
    SelectionComponent.prototype.clear = function () {
        this.selectedItems.splice(0);
    };
    SelectionComponent.prototype._onRowClick = function (event) {
        var selectedClass = 'm-row-selected';
        if (event.row.type !== grid_renderer_1.rowTypes.data) {
            return;
        }
        if (this.options.multiple === false) {
            this._gridInternals.renderer.rows.forEach(function (row) { return row.removeClass(selectedClass); });
            this.selectedItems.splice(0);
        }
        if (event.row.hasClass(selectedClass)) {
            event.row.removeClass(selectedClass);
            var itemIndex = this.selectedItems.indexOf(event.row.data);
            if (itemIndex === -1) {
                return;
            }
            this.selectedItems.splice(itemIndex, 1);
            return;
        }
        this.selectedItems.push(event.row.data);
        event.row.addClass(selectedClass);
    };
    SelectionComponent.prototype.createOptions = function () {
        var selection = this._gridOptions.reader.get('selection');
        if (!selection.defined) {
            return;
        }
        return {
            multiple: !!selection.get('multiple').evaluate()
        };
    };
    SelectionComponent = __decorate([
        aurelia_dependency_injection_1.inject(common_imports_1.GridInternals, common_imports_1.GridOptions, common_imports_1.DataSource)
    ], SelectionComponent);
    return SelectionComponent;
}(common_imports_1.GridComponent));
exports.SelectionComponent = SelectionComponent;

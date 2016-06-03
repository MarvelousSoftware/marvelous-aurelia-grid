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
var utils_1 = require('marvelous-aurelia-core/utils');
var all_1 = require('../../all');
var ColumnChooserComponent = (function (_super) {
    __extends(ColumnChooserComponent, _super);
    function ColumnChooserComponent(_gridInternals, _gridOptions, _components) {
        _super.call(this);
        this._gridInternals = _gridInternals;
        this._gridOptions = _gridOptions;
        this._components = _components;
        this.hidden = true;
        this.overDroppable = false;
        this.columns = [];
        this.selector = {
            popUp: '.m-grid-column-chooser .m-grid-popup',
            headings: '.m-grid-headings'
        };
        this.defaultOptions = {
            autoToolboxInit: true
        };
    }
    ColumnChooserComponent.prototype.start = function () {
        this._gridInternals.makeColumnsDraggable();
        this._listenOnDragAndDrop();
        this._listenOnColumnOwnerChanged();
        this._initToolbox();
        this._initColumns();
        this._components.get(all_1.ColumnReorderingComponent).enable();
    };
    ColumnChooserComponent.prototype.attached = function () {
        this._initPopUpPosition();
    };
    ColumnChooserComponent.prototype.saveState = function (state) {
        state.columns = this.columns.map(function (x) { return x.getUniqueId(); });
    };
    ColumnChooserComponent.prototype.loadState = function (state) {
        var _this = this;
        this.columns = state.columns.map(function (x) {
            var column = _this._gridOptions.getColumnByUniqueId(x);
            column.setOwner(ColumnChooserComponent);
            return column;
        });
    };
    ColumnChooserComponent.prototype.togglePopUp = function () {
        this.hidden = !this.hidden;
    };
    ColumnChooserComponent.prototype._initToolbox = function () {
        var _this = this;
        if (this.options.autoToolboxInit) {
            this._components.get(all_1.ToolboxComponent).enable();
        }
        var toolbox = this._components.get(all_1.ToolboxComponent).instance;
        toolbox.addButton({
            text: 'column-chooser/open-button-text',
            click: function () { return _this.togglePopUp(); }
        });
    };
    ColumnChooserComponent.prototype._initColumns = function () {
        this.columns = this._gridOptions.columns.filter(function (x) { return x.hidden; });
    };
    ColumnChooserComponent.prototype._initPopUpPosition = function () {
        var popUp = this._gridInternals.element.querySelector(this.selector.popUp);
        var headings = this._gridInternals.element.querySelector(this.selector.headings);
        popUp.style.top = headings.offsetTop + headings.clientHeight + 5 + 'px';
        popUp.style.left = '5px';
    };
    ColumnChooserComponent.prototype._listenOnDragAndDrop = function () {
        var _this = this;
        this._gridInternals.listenOnDragAndDrop({
            dropArea: this.selector.popUp,
            zIndex: 100000,
            dropped: function (e, el, column) {
                _this.overDroppable = false;
                if (_this.columns.indexOf(column) >= 0) {
                    return;
                }
                var newMainColumns = _this._gridInternals.mainColumns.filter(function (x) { return x !== column; });
                if (newMainColumns.length === 0) {
                    // at least one column has to exist on the main panel
                    return;
                }
                column.hidden = true;
                column.setOwner(ColumnChooserComponent);
                _this.columns.push(column);
                // creates a copy of columns, sorts it and then assigns sorted to displayed columns
                var sortedColumns = [];
                _this.columns.forEach(function (x) { return sortedColumns.push(x); });
                sortedColumns.sort(utils_1.Utils.sortBy({ name: 'heading', order: 'asc' }));
                _this.columns = sortedColumns;
                _this._gridInternals.mainColumns = newMainColumns;
            },
            canceled: function (e) {
                _this.overDroppable = false;
            },
            overDroppable: function (e, el, column) {
                if (_this.columns.indexOf(column) >= 0) {
                    return;
                }
                _this.overDroppable = true;
            },
            outsideDroppable: function (e) {
                _this.overDroppable = false;
            }
        });
    };
    ColumnChooserComponent.prototype._listenOnColumnOwnerChanged = function () {
        var _this = this;
        this.subs.push(this._gridInternals.subscribe('ColumnOwnerChanged', function (msg) {
            if (msg.column.owner === ColumnChooserComponent) {
                return;
            }
            _this.columns = _this.columns.filter(function (x) { return x !== msg.column; });
            msg.column.hidden = false;
        }));
    };
    ColumnChooserComponent.prototype.createOptions = function () {
        if (!this._gridOptions.domBased.has('column-chooser') && !this._gridOptions.codeBased.columnChooser) {
            return false;
        }
        var codeBased = this._gridOptions.codeBased.columnChooser || {};
        var options = this._gridOptions.domBased.getSingleOrDefault('column-chooser');
        options.defineIfUndefined('autoToolboxInit');
        return {
            autoToolboxInit: utils_1.Utils.firstDefined(this.defaultOptions.autoToolboxInit, [codeBased.autoToolboxInit, options.get('autoToolboxInit').evaluate()])
        };
    };
    ColumnChooserComponent = __decorate([
        aurelia_dependency_injection_1.inject(all_1.GridInternals, all_1.GridOptions, all_1.ComponentsArray)
    ], ColumnChooserComponent);
    return ColumnChooserComponent;
}(all_1.GridComponent));
exports.ColumnChooserComponent = ColumnChooserComponent;

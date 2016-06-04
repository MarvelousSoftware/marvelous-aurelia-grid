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
var all_1 = require('../../all');
var sorting_1 = require('../sorting');
var constants_1 = require('../../constants');
var utils_1 = require('marvelous-aurelia-core/utils');
// TODO: default grouped by (same for sorting)
// TODO: validation (field is required to do the grouping)
// TODO: defaultGroupable="true" then to disable grouping on column groupable="false"
var GroupingComponent = (function (_super) {
    __extends(GroupingComponent, _super);
    function GroupingComponent(_components, _gridOptions, _gridInternals) {
        _super.call(this);
        this._components = _components;
        this._gridOptions = _gridOptions;
        this._gridInternals = _gridInternals;
        this._selector = {
            panel: '.m-grid-grouping',
            columns: '.m-grid-grouping .m-grid-column'
        };
        this.columns = [];
        this._dragAndDrop = {
            overDroppable: false,
            columns: undefined,
            closestColumn: undefined,
            oldDropSide: undefined,
            dropSide: undefined,
            markers: []
        };
    }
    GroupingComponent.prototype.start = function () {
        this._listenOnDragAndDrop();
        this._listenOnColumnOwnerChanged();
        this._components.get(all_1.ColumnReorderingComponent).enable();
        this._components.get(sorting_1.SortingComponent).enable();
        this._components.get(sorting_1.SortingComponent).instance
            .addBucket(GroupingComponent, -1000, {
            mode: constants_1.sortingMode.multiple,
            alwaysSorted: true
        });
    };
    GroupingComponent.prototype.saveState = function (state) {
        var sorting = this._getSortingBucket();
        state.columns = this.columns.map(function (x) {
            return {
                id: x.getUniqueId(),
                direction: sorting.getSortingDirection(x)
            };
        });
    };
    GroupingComponent.prototype.loadState = function (state) {
        var _this = this;
        if (!state || !state.columns || !state.columns.length) {
            return;
        }
        var columns = [];
        state.columns.forEach(function (x) {
            columns.push({
                column: _this._gridOptions.getColumnByUniqueId(x.id),
                direction: x.direction
            });
        });
        this._setColumns(columns);
        this._gridInternals.refresh();
    };
    GroupingComponent.prototype._listenOnDragAndDrop = function () {
        var _this = this;
        this._gridInternals.listenOnDragAndDrop({
            dropArea: this._selector.panel,
            started: function (e, el, column) {
                _this._dragAndDrop.columns = _this._gridInternals.element.querySelectorAll(_this._selector.columns);
            },
            moved: function (e, el, column) {
                _this._onMoved(e, el, column);
            },
            dropped: function (e, el, column) {
                _this._onDropped(e, el, column);
                _this._clear();
            },
            canceled: function (e) {
                _this._clear();
            },
            overDroppable: function (e, el, column) {
                if (!column.other.groupable) {
                    return;
                }
                _this._dragAndDrop.overDroppable = true;
            },
            outsideDroppable: function (e) {
                _this._clear();
            }
        });
    };
    GroupingComponent.prototype._onMoved = function (e, el, column) {
        if (!column.other.groupable) {
            return;
        }
        if (!this.columns.length) {
            return;
        }
        this._dragAndDrop.closestColumn = this._getClosestColumn(e);
        if (!this._dragAndDrop.closestColumn) {
            return;
        }
        var offset = utils_1.DomUtils.offset(this._dragAndDrop.closestColumn);
        if (!offset) {
            return;
        }
        this._dragAndDrop.oldDropSide = this._dragAndDrop.dropSide;
        // sets the drop side, e.g. (dragging Age column, ^ is the cursor position)
        // First Name | Last Name | Age
        //         ^                    ("right")
        // First Name | Last Name | Age
        //  ^                           ("left")
        this._dragAndDrop.dropSide = e.pageX < offset.left + (this._dragAndDrop.closestColumn.offsetWidth / 2) ? 'left' : 'right';
        if (this._dragAndDrop.dropSide && this._dragAndDrop.oldDropSide !== this._dragAndDrop.dropSide) {
            this._clearMarkers();
            this._insertMarker();
        }
    };
    GroupingComponent.prototype._onDropped = function (e, el, column) {
        if (!column.other.groupable) {
            return;
        }
        this._dragAndDrop.overDroppable = false;
        if (this.columns.indexOf(column) == -1) {
            // if is new in the grouping panel
            var newMainColumns = this._gridInternals.mainColumns.filter(function (x) { return x !== column; });
            if (newMainColumns.length === 0) {
                // at least one column has to exist on the main panel
                return;
            }
            // TODO: main grid could just listen on ColumnOwnerChanged and do it on it's own!
            this._gridInternals.mainColumns = newMainColumns;
            // column has to be added to GroupingComponent sorting bucket
            // to always apply 'multiple' mode
            this._getSortingBucket().addColumn(column);
        }
        if (!this.columns.length) {
            this._setColumns([{ column: column }]);
            this._gridInternals.refresh();
            return;
        }
        var closest = this._gridOptions.getColumnByElement(this._dragAndDrop.closestColumn);
        var newColumns = [];
        for (var _i = 0, _a = this.columns; _i < _a.length; _i++) {
            var c = _a[_i];
            if (c === closest && this._dragAndDrop.dropSide === 'left') {
                newColumns.push(column);
            }
            if (c !== column) {
                newColumns.push(c);
            }
            if (c === closest && this._dragAndDrop.dropSide === 'right') {
                newColumns.push(column);
            }
        }
        this._setColumns(newColumns.map(function (x) { return { column: x }; }));
        this._gridInternals.refresh();
    };
    GroupingComponent.prototype._setColumns = function (columns) {
        this.columns = columns.map(function (x) { return x.column; });
        var sorting = this._getSortingBucket();
        var order = 0;
        columns.forEach(function (x) {
            x.column.setOwner(GroupingComponent);
            sorting.sortBy(x.column, order++, x.direction);
        });
    };
    GroupingComponent.prototype._getSortingBucket = function () {
        return this._components.get(sorting_1.SortingComponent)
            .instance.getBucketByOwner(GroupingComponent);
    };
    GroupingComponent.prototype._clearMarkers = function () {
        for (var _i = 0, _a = this._dragAndDrop.markers; _i < _a.length; _i++) {
            var marker = _a[_i];
            marker.parentNode.removeChild(marker);
        }
        this._dragAndDrop.markers = [];
    };
    GroupingComponent.prototype._insertMarker = function () {
        var div = document.createElement('div');
        if (this._dragAndDrop.dropSide === 'left') {
            div.setAttribute('class', 'm-grid-marker m-grid-left-marker');
            this._dragAndDrop.closestColumn.appendChild(div);
        }
        if (this._dragAndDrop.dropSide === 'right') {
            div.setAttribute('class', 'm-grid-marker m-grid-right-marker');
            this._dragAndDrop.closestColumn.insertBefore(div, this._dragAndDrop.closestColumn.firstChild);
        }
        this._dragAndDrop.markers.push(div);
    };
    GroupingComponent.prototype._clear = function () {
        this._clearMarkers();
        this._dragAndDrop.closestColumn = undefined;
        this._dragAndDrop.dropSide = undefined;
        this._dragAndDrop.overDroppable = false;
    };
    GroupingComponent.prototype._getClosestColumn = function (e) {
        var closest;
        var distance = Infinity;
        for (var _i = 0, _a = this._dragAndDrop.columns; _i < _a.length; _i++) {
            var column = _a[_i];
            var offset = utils_1.DomUtils.offset(column);
            var d = e.pageX - column.offsetWidth - offset.left;
            var d2 = offset.left - e.pageX;
            if (d < 0 && d2 < 0) {
                // hovers current column
                closest = column;
                break;
            }
            var final = d < 0 ? d2 : d;
            if (final < distance) {
                distance = final;
                closest = column;
            }
        }
        return closest;
    };
    GroupingComponent.prototype._listenOnColumnOwnerChanged = function () {
        var _this = this;
        this.subs.push(this._gridInternals.subscribe('ColumnOwnerChanged', function (msg) {
            if (msg.column.owner === GroupingComponent) {
                return;
            }
            if (msg.column.oldOwner !== GroupingComponent) {
                return;
            }
            // since column is no longer in the grouping panel
            // then it has to be removed from 'columns' and sorting bucket
            _this.columns = _this.columns.filter(function (x) { return x !== msg.column; });
            _this._getSortingBucket().removeColumn(msg.column);
            // since sorting has changed then grid has to be refreshed
            _this._gridInternals.refresh();
        }));
    };
    GroupingComponent.prototype.createOptions = function () {
        if (!this._gridOptions.domBased.has('grouping') && !this._gridOptions.codeBased.grouping) {
            return false;
        }
        return {};
    };
    GroupingComponent = __decorate([
        aurelia_dependency_injection_1.inject(all_1.ComponentsArray, all_1.GridOptions, all_1.GridInternals)
    ], GroupingComponent);
    return GroupingComponent;
}(all_1.GridComponent));
exports.GroupingComponent = GroupingComponent;

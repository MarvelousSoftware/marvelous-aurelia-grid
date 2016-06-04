System.register(['aurelia-dependency-injection', 'marvelous-aurelia-core/utils', '../../pluginability', '../../grid', '../../grid-options', '../../grid-internals'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
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
    var aurelia_dependency_injection_1, utils_1, pluginability_1, grid_1, grid_options_1, grid_internals_1;
    var ColumnReorderingComponent;
    return {
        setters:[
            function (aurelia_dependency_injection_1_1) {
                aurelia_dependency_injection_1 = aurelia_dependency_injection_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            },
            function (pluginability_1_1) {
                pluginability_1 = pluginability_1_1;
            },
            function (grid_1_1) {
                grid_1 = grid_1_1;
            },
            function (grid_options_1_1) {
                grid_options_1 = grid_options_1_1;
            },
            function (grid_internals_1_1) {
                grid_internals_1 = grid_internals_1_1;
            }],
        execute: function() {
            // TODO: persist order information in the state
            ColumnReorderingComponent = (function (_super) {
                __extends(ColumnReorderingComponent, _super);
                function ColumnReorderingComponent(_gridOptions, _gridInternals) {
                    _super.call(this);
                    this._gridOptions = _gridOptions;
                    this._gridInternals = _gridInternals;
                    this.markers = [];
                    this.selector = {
                        dropArea: '.m-grid .m-grid-headings',
                        columns: '.m-grid-headings .m-grid-column'
                    };
                }
                ColumnReorderingComponent.prototype.start = function () {
                    var _this = this;
                    this._gridInternals.listenOnDragAndDrop({
                        dropArea: this.selector.dropArea,
                        moved: function (e, el, column) {
                            _this._onMoved(e, el, column);
                        },
                        dropped: function (e, el, column) {
                            _this._onDropped(e, el, column);
                        },
                        canceled: function (e) {
                            _this._clear();
                        },
                        outsideDroppable: function (e) {
                            _this._clear();
                        }
                    });
                };
                ColumnReorderingComponent.prototype._onMoved = function (e, el, column) {
                    if (utils_1.DomUtils.isCursorOverElement(el, e)) {
                        // position not changed yet
                        this._clear();
                        return;
                    }
                    var columns = this._gridInternals.element.querySelectorAll(this.selector.columns);
                    for (var i = 0; i < columns.length; i++) {
                        var c = columns[i];
                        if (utils_1.DomUtils.isCursorOverElement(c, e)) {
                            this.hoveredColumn = c;
                            break;
                        }
                    }
                    if (!this.hoveredColumn) {
                        return;
                    }
                    var hoveredOffset = utils_1.DomUtils.offset(this.hoveredColumn);
                    if (!hoveredOffset) {
                        return;
                    }
                    this.oldSide = this.side;
                    // sets the direction of marker, e.g. (dragging Age column, ^ is the cursor position)
                    // First Name | Last Name | Age
                    //         ^                    ("right")
                    // First Name | Last Name | Age
                    //  ^                           ("left")
                    this.side = e.pageX < hoveredOffset.left + (this.hoveredColumn.clientWidth / 2) ? 'left' : 'right';
                    if (this.side && this.oldSide !== this.side) {
                        this._clearMarkers();
                        this._insertMarker();
                    }
                };
                ColumnReorderingComponent.prototype._onDropped = function (e, el, column) {
                    var _this = this;
                    if (!this.hoveredColumn || !this.side) {
                        return;
                    }
                    if (this._gridOptions.getColumnByElement(this.hoveredColumn) === column) {
                        return;
                    }
                    var columns = this._gridInternals.element.querySelectorAll(this.selector.columns);
                    var newMainColumns = [];
                    var add = function (c) {
                        if (_this._gridInternals.mainColumns.indexOf(c) === -1) {
                            c.setOwner(grid_1.Grid);
                            _this._gridInternals.publish('ColumnOwnerChanged', { column: c });
                        }
                        newMainColumns.push(c);
                    };
                    for (var i = 0; i < columns.length; i++) {
                        var c = columns[i];
                        if (c === el) {
                            continue;
                        }
                        if (this.side === "right") {
                            add(this._gridOptions.getColumnByElement(c));
                        }
                        if (c === this.hoveredColumn) {
                            add(column);
                        }
                        if (this.side === "left") {
                            add(this._gridOptions.getColumnByElement(c));
                        }
                    }
                    this._gridInternals.mainColumns = newMainColumns;
                };
                ColumnReorderingComponent.prototype._clearMarkers = function () {
                    for (var _i = 0, _a = this.markers; _i < _a.length; _i++) {
                        var marker = _a[_i];
                        if (marker.parentNode) {
                            marker.parentNode.removeChild(marker);
                        }
                    }
                    this.markers = [];
                };
                ColumnReorderingComponent.prototype._insertMarker = function () {
                    var div = document.createElement('div');
                    if (this.side === 'left') {
                        div.setAttribute('class', 'm-grid-marker m-grid-left-marker');
                        this.hoveredColumn.appendChild(div);
                    }
                    if (this.side === 'right') {
                        div.setAttribute('class', 'm-grid-marker m-grid-right-marker');
                        this.hoveredColumn.insertBefore(div, this.hoveredColumn.firstChild);
                    }
                    this.markers.push(div);
                };
                ColumnReorderingComponent.prototype._clear = function () {
                    this._clearMarkers();
                    this.hoveredColumn = undefined;
                    this.side = undefined;
                };
                ColumnReorderingComponent.prototype.createOptions = function () {
                    if (!this._gridOptions.domBased.has('column-reordering') && !this._gridOptions.codeBased.columnReordering) {
                        return false;
                    }
                    return {};
                };
                ColumnReorderingComponent = __decorate([
                    aurelia_dependency_injection_1.inject(grid_options_1.GridOptions, grid_internals_1.GridInternals)
                ], ColumnReorderingComponent);
                return ColumnReorderingComponent;
            }(pluginability_1.GridComponent));
            exports_1("ColumnReorderingComponent", ColumnReorderingComponent);
        }
    }
});

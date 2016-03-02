System.register(['aurelia-dependency-injection', 'marvelous-aurelia-core/utils', '../pluginability', '../gridOptions', '../gridInternals', '../dataSource/dataSource', '../constants'], function(exports_1, context_1) {
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
    var aurelia_dependency_injection_1, utils_1, pluginability_1, gridOptions_1, gridInternals_1, dataSource_1, constants_1;
    var SortingComponent, SortingBucket;
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
            function (gridOptions_1_1) {
                gridOptions_1 = gridOptions_1_1;
            },
            function (gridInternals_1_1) {
                gridInternals_1 = gridInternals_1_1;
            },
            function (dataSource_1_1) {
                dataSource_1 = dataSource_1_1;
            },
            function (constants_1_1) {
                constants_1 = constants_1_1;
            }],
        execute: function() {
            SortingComponent = (function (_super) {
                __extends(SortingComponent, _super);
                function SortingComponent(_gridOptions, _gridInternals, _dataSource) {
                    _super.call(this);
                    this._gridOptions = _gridOptions;
                    this._gridInternals = _gridInternals;
                    this._dataSource = _dataSource;
                    this.sortOrder = 0;
                    this.defaultOptions = {
                        mode: constants_1.sortingMode.single
                    };
                    this.buckets = [];
                    this.subs = [];
                }
                SortingComponent.prototype.start = function () {
                    var _this = this;
                    // adds main bucket
                    this.addBucket(SortingComponent, 0, {
                        mode: this.options.mode,
                        alwaysSorted: false
                    });
                    this.subs = [
                        this._gridInternals.subscribe('ColumnClicked', function (column) { return _this._onColumnClicked(column); }),
                        this._dataSource.subscribe('DataRead', function (params) { return _this._onDataRead(params); })
                    ];
                };
                SortingComponent.prototype._onDataRead = function (params) {
                    params.sortBy = [];
                    this.buckets.forEach(function (x) {
                        var bucketSortedColumns = [];
                        x.bucket.columns.forEach(function (c) {
                            if (c.state.sortByDirection !== undefined && c.state.sortOrder !== undefined) {
                                bucketSortedColumns.push({
                                    column: c,
                                    sortOrder: c.state.sortOrder,
                                    sortByDirection: c.state.sortByDirection
                                });
                            }
                        });
                        bucketSortedColumns = bucketSortedColumns.sort(utils_1.Utils.sortBy({ name: 'sortOrder' }));
                        bucketSortedColumns.forEach(function (x) { return params.sortBy.push({
                            column: x.column,
                            direction: x.sortByDirection
                        }); });
                    });
                };
                SortingComponent.prototype.saveState = function (state) {
                    var sorting = this.getBucketByOwner(SortingComponent);
                    state.columns = sorting.columns.map(function (x) {
                        return {
                            id: x.getUniqueId(),
                            direction: sorting.getSortingDirection(x)
                        };
                    });
                };
                SortingComponent.prototype.loadState = function (state) {
                    var _this = this;
                    if (!state || !state.columns || !state.columns.length) {
                        return;
                    }
                    var sorting = this.getBucketByOwner(SortingComponent);
                    var order = 1;
                    state.columns.forEach(function (x) {
                        var column = _this._gridOptions.getColumnByUniqueId(x.id);
                        sorting.sortBy(column, order++, x.direction);
                    });
                    this._gridInternals.refresh();
                };
                SortingComponent.prototype._onColumnClicked = function (column) {
                    var isSortingEnabled = column.other.sortable !== undefined && column.other.sortable !== "false" && column.other.sortable !== false;
                    if (!isSortingEnabled) {
                        return;
                    }
                    var bucket = this.getBucketByColumn(column) || this.getBucketByOwner(SortingComponent);
                    if (!bucket.hasSortingApplied(column)) {
                        bucket.sortBy(column, ++this.sortOrder, 'asc');
                    }
                    else {
                        bucket.nextSortingDirectionOn(column);
                    }
                    this._gridInternals.refresh();
                };
                SortingComponent.prototype.addBucket = function (owner, order, options) {
                    var ownedBucket = {
                        owner: owner,
                        bucket: new SortingBucket(options),
                        order: order
                    };
                    this.buckets.push(ownedBucket);
                    this.buckets = this.buckets.sort(utils_1.Utils.sortBy({ name: 'order' }));
                    return ownedBucket.bucket;
                };
                SortingComponent.prototype.getBucketByColumn = function (column) {
                    var buckets = this.buckets.filter(function (x) { return x.bucket.hasColumn(column); });
                    if (!buckets.length) {
                        return;
                    }
                    return buckets[0].bucket;
                };
                SortingComponent.prototype.getBucketByOwner = function (owner) {
                    var buckets = this.buckets.filter(function (x) { return x.owner === owner; });
                    if (!buckets.length) {
                        return;
                    }
                    return buckets[0].bucket;
                };
                SortingComponent.prototype.createOptions = function () {
                    if (!this._gridOptions.domBased.has('sorting') && !this._gridOptions.codeBased.sorting) {
                        return false;
                    }
                    var sorting = this._gridOptions.domBased.getSingleOrDefault('sorting');
                    var codeBased = this._gridOptions.codeBased.sorting || {};
                    sorting.defineIfUndefined('mode');
                    return {
                        mode: sorting.get('mode').evaluate() || codeBased.mode || this.defaultOptions.mode
                    };
                };
                SortingComponent = __decorate([
                    aurelia_dependency_injection_1.inject(gridOptions_1.GridOptions, gridInternals_1.GridInternals, dataSource_1.DataSource)
                ], SortingComponent);
                return SortingComponent;
            }(pluginability_1.GridComponent));
            exports_1("SortingComponent", SortingComponent);
            /**
             * General remarks:
             * Sorting component could be a lot simpler if it would be used only by
             * the end-user. Unfortunatelly it is also used internally by grouping component
             * which requires to sort columns in the seperation of main panel.
             * Grouped columns should always be sorted first and have 'multiple' mode.
             * That's why buckets are implemented.
             */
            SortingBucket = (function () {
                function SortingBucket(options) {
                    this.columns = [];
                    this.options = options;
                }
                SortingBucket.prototype.sortBy = function (column, order, direction) {
                    var _this = this;
                    if (this.options.mode === constants_1.sortingMode.single) {
                        this.columns.filter(function (x) { return x !== column; }).forEach(function (x) {
                            _this._clearColumn(x);
                        });
                    }
                    direction = direction || column.state.sortByDirection || 'asc';
                    this._manageColumnClasses(column, direction);
                    column.state.sortByDirection = direction;
                    column.state.sortOrder = order;
                    this.addColumn(column);
                };
                SortingBucket.prototype.nextSortingDirectionOn = function (column) {
                    if (!this.hasColumn(column)) {
                        return;
                    }
                    switch (column.state.sortByDirection) {
                        case 'asc':
                            column.state.sortByDirection = 'desc';
                            column.addClass('m-grid-sort-desc');
                            column.removeClass('m-grid-sort-asc');
                            break;
                        case 'desc':
                            if (this.options.alwaysSorted) {
                                column.state.sortByDirection = 'asc';
                                column.addClass('m-grid-sort-asc');
                                column.removeClass('m-grid-sort-desc');
                                break;
                            }
                        default:
                            this._clearColumn(column);
                            break;
                    }
                };
                SortingBucket.prototype.hasSortingApplied = function (column) {
                    return !!this.getSortingDirection(column);
                };
                SortingBucket.prototype.getSortingDirection = function (column) {
                    return column.state.sortByDirection;
                };
                SortingBucket.prototype.addColumn = function (column) {
                    if (this.hasColumn(column)) {
                        return;
                    }
                    this.columns.push(column);
                };
                SortingBucket.prototype.removeColumn = function (column) {
                    if (!this.hasColumn(column)) {
                        return;
                    }
                    this._clearColumn(column);
                };
                SortingBucket.prototype.hasColumn = function (column) {
                    if (this.columns.indexOf(column) == -1) {
                        return false;
                    }
                    return true;
                };
                SortingBucket.prototype._clearColumn = function (column) {
                    column.removeClass('m-grid-sort-asc');
                    column.removeClass('m-grid-sort-desc');
                    delete column.state.sortByDirection;
                    delete column.state.sortOrder;
                    utils_1.Utils.removeFromArray(this.columns, column);
                };
                SortingBucket.prototype._manageColumnClasses = function (column, direction) {
                    switch (direction) {
                        case 'asc':
                            column.addClass('m-grid-sort-asc');
                            column.removeClass('m-grid-sort-desc');
                            break;
                        case 'desc':
                            column.addClass('m-grid-sort-desc');
                            column.removeClass('m-grid-sort-asc');
                            break;
                        default:
                            throw new Error(direction + " is not a valid value for a column sort direction.");
                    }
                };
                return SortingBucket;
            }());
            exports_1("SortingBucket", SortingBucket);
        }
    }
});

System.register(['aurelia-dependency-injection', '../dataSource/dataSource', 'marvelous-aurelia-core/aureliaUtils', '../gridOptions', '../gridInternals', '../pluginability'], function(exports_1, context_1) {
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
    var aurelia_dependency_injection_1, dataSource_1, aureliaUtils_1, gridOptions_1, gridInternals_1, pluginability_1;
    var PaginationComponent;
    return {
        setters:[
            function (aurelia_dependency_injection_1_1) {
                aurelia_dependency_injection_1 = aurelia_dependency_injection_1_1;
            },
            function (dataSource_1_1) {
                dataSource_1 = dataSource_1_1;
            },
            function (aureliaUtils_1_1) {
                aureliaUtils_1 = aureliaUtils_1_1;
            },
            function (gridOptions_1_1) {
                gridOptions_1 = gridOptions_1_1;
            },
            function (gridInternals_1_1) {
                gridInternals_1 = gridInternals_1_1;
            },
            function (pluginability_1_1) {
                pluginability_1 = pluginability_1_1;
            }],
        execute: function() {
            PaginationComponent = (function (_super) {
                __extends(PaginationComponent, _super);
                function PaginationComponent(_dataSource, _aureliaUtils, _gridInternals, _gridOptions) {
                    _super.call(this);
                    this._dataSource = _dataSource;
                    this._aureliaUtils = _aureliaUtils;
                    this._gridInternals = _gridInternals;
                    this._gridOptions = _gridOptions;
                    /**
                     * Page items.
                     */
                    this.items = [];
                    /**
                     * Currently selected page.
                     */
                    this.selected = 1;
                    this.buttons = {
                        prev: false,
                        next: false,
                        leftSideOutOfRange: false,
                        rightSideOutOfRange: false
                    };
                    this.defaultOptions = {
                        size: 20,
                        all: false,
                        range: 4
                    };
                }
                PaginationComponent.prototype.start = function () {
                    var _this = this;
                    this.subs = [
                        this._dataSource.subscribe('DataRead', function (params) { return _this._onDataRead(params); }),
                        this._dataSource.subscribe('DataReceived', function (e) { return _this._onDataReceived(e); }),
                        this._aureliaUtils.observe(this.options, 'size', function (newVal, oldVal) { return _this._onPageSizeChanged(newVal, oldVal); })
                    ];
                };
                PaginationComponent.prototype.changePage = function (newPage) {
                    if (newPage === this.selected) {
                        return;
                    }
                    this.selected = newPage;
                    this._gridInternals.refresh();
                };
                PaginationComponent.prototype.selectFirst = function () {
                    this.changePage(1);
                };
                PaginationComponent.prototype.selectLast = function () {
                    this.changePage(this.lastPage);
                };
                PaginationComponent.prototype.selectNext = function () {
                    if (this.selected >= this.lastPage) {
                        return;
                    }
                    this.changePage(this.selected + 1);
                };
                PaginationComponent.prototype.selectPrev = function () {
                    if (this.selected <= 1) {
                        return;
                    }
                    this.changePage(this.selected - 1);
                };
                PaginationComponent.prototype._onDataRead = function (params) {
                    params.page = this.selected;
                    params.pageSize = this.options.size;
                };
                PaginationComponent.prototype._onDataReceived = function (e) {
                    var total = e.result.total;
                    var items = [];
                    this.lastPage = Math.ceil(total / this.options.size);
                    var startPage = this.selected - this.options.range;
                    if (startPage < 1) {
                        startPage = 1;
                    }
                    var endPage = this.selected + this.options.range;
                    if (endPage > this.lastPage) {
                        endPage = this.lastPage;
                    }
                    this.buttons.rightSideOutOfRange = this.lastPage > endPage;
                    this.buttons.leftSideOutOfRange = startPage !== 1;
                    this.buttons.next = this.selected !== this.lastPage;
                    this.buttons.prev = this.selected !== 1;
                    for (var i = startPage; i <= endPage; i++) {
                        items.push(i);
                    }
                    this.items = items;
                    if (this.total === total) {
                        return;
                    }
                    this.total = total;
                };
                PaginationComponent.prototype._onPageSizeChanged = function (newVal, oldVal) {
                    if (newVal != oldVal) {
                        this.selected = 1;
                        this._gridInternals.refresh();
                    }
                };
                PaginationComponent.prototype.createOptions = function () {
                    if (!this._gridOptions.domBased.has('pagination') && !this._gridOptions.codeBased.pagination) {
                        return;
                    }
                    var pagination = this._gridOptions.domBased.getSingleOrDefault('pagination');
                    pagination.defineIfUndefined('size', 'all', 'range');
                    var codeBased = this._gridOptions.codeBased.pagination || {};
                    var options = {
                        size: codeBased.size || parseInt(pagination.get('size').evaluate()) || this.defaultOptions.size,
                        all: codeBased.all || pagination.get('all').evaluate() || this.defaultOptions.all,
                        range: codeBased.range || parseInt(pagination.get('range').evaluate()) || this.defaultOptions.range
                    };
                    return options;
                };
                PaginationComponent = __decorate([
                    aurelia_dependency_injection_1.inject(dataSource_1.DataSource, aureliaUtils_1.AureliaUtils, gridInternals_1.GridInternals, gridOptions_1.GridOptions)
                ], PaginationComponent);
                return PaginationComponent;
            }(pluginability_1.GridComponent));
            exports_1("PaginationComponent", PaginationComponent);
        }
    }
});

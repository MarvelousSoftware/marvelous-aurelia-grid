System.register(['aurelia-dependency-injection', '../../grid/gridOptions', '../../grid/gridInternals', '../../grid/models/column', 'aurelia-pal-browser', '../../domSettingsReader', 'marvelous-aurelia-core/optionsReader'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var aurelia_dependency_injection_1, gridOptions_1, gridInternals_1, column_1, aurelia_pal_browser_1, domSettingsReader_1, optionsReader_1;
    var GridTestHelpers;
    return {
        setters:[
            function (aurelia_dependency_injection_1_1) {
                aurelia_dependency_injection_1 = aurelia_dependency_injection_1_1;
            },
            function (gridOptions_1_1) {
                gridOptions_1 = gridOptions_1_1;
            },
            function (gridInternals_1_1) {
                gridInternals_1 = gridInternals_1_1;
            },
            function (column_1_1) {
                column_1 = column_1_1;
            },
            function (aurelia_pal_browser_1_1) {
                aurelia_pal_browser_1 = aurelia_pal_browser_1_1;
            },
            function (domSettingsReader_1_1) {
                domSettingsReader_1 = domSettingsReader_1_1;
            },
            function (optionsReader_1_1) {
                optionsReader_1 = optionsReader_1_1;
            }],
        execute: function() {
            GridTestHelpers = (function () {
                function GridTestHelpers() {
                    this._i = 1;
                }
                GridTestHelpers.prototype.beforeEach = function () {
                    aurelia_pal_browser_1.initialize();
                    this.container = new aurelia_dependency_injection_1.Container();
                    this.reader = this.container.get(domSettingsReader_1.DOMSettingsReader);
                    this.readerFactory = this.container.get(optionsReader_1.OptionsReaderFactory);
                    this.gridInternals = this.createGridInternalsMock();
                    this.dataSource = this.createDataSourceMock();
                    this.aureliaUtils = this.createAureliaUtilsMock();
                    this.components = this.createComponentsMock();
                };
                GridTestHelpers.prototype.getGridOptions = function (codeBased, domBased) {
                    var settings = document.createElement('settings');
                    settings.innerHTML = domBased;
                    this.reader.init({}, settings);
                    return new gridOptions_1.GridOptions(null, this.readerFactory.create({}, settings), this.reader, codeBased);
                };
                GridTestHelpers.prototype.getColumn = function (attributes) {
                    return new column_1.Column(this._i++, attributes, '', this.gridInternals);
                };
                GridTestHelpers.prototype.createComponentsMock = function () {
                    var _this = this;
                    var all = new Map();
                    var components = {
                        get: function (component) {
                            if (all.has(component) === false) {
                                throw new Error("Component '" + component.name + "' not found. Use 'get.for(component, instance)' method to add a new component.");
                            }
                            return all.get(component);
                        }
                    };
                    components.get.for = function (component, instance) {
                        all.set(component, instance);
                        return _this;
                    };
                    return components;
                };
                GridTestHelpers.prototype.createGridInternalsMock = function () {
                    var base = new gridInternals_1.GridInternals(null);
                    var internals = {
                        mainColumns: [],
                        refresh: sinon.spy()
                    };
                    internals.subscribe = function (event, callback) {
                        internals.subscribe.subscribers.push({
                            event: event,
                            callback: callback
                        });
                        return function () {
                            internals.subscribe.subscribers = internals.subscribe.subscribers
                                .filter(function (x) { return x.callback !== callback && x.event !== event; });
                        };
                    };
                    internals.subscribe.subscribers = [];
                    internals.subscribe.emit = function (event, payload) {
                        internals.subscribe.subscribers.forEach(function (x) {
                            if (x.event === event) {
                                x.callback(payload);
                            }
                        });
                    };
                    internals.publish = function (name, payload) {
                        internals.publish.published.push({
                            name: name,
                            payload: payload
                        });
                    };
                    internals.publish.published = [];
                    internals.makeColumnsDraggable = sinon.spy();
                    internals.element = document.createElement('div');
                    internals.dragAndDropListeners = base.dragAndDropListeners;
                    internals.listenOnDragAndDrop = base.listenOnDragAndDrop;
                    internals.listenOnDragAndDrop.started = function () {
                        var params = [];
                        for (var _a = 0; _a < arguments.length; _a++) {
                            params[_a - 0] = arguments[_a];
                        }
                        internals.dragAndDropListeners.forEach(function (x) { return x.started.apply(x, params); });
                    };
                    internals.listenOnDragAndDrop.moved = function () {
                        var params = [];
                        for (var _a = 0; _a < arguments.length; _a++) {
                            params[_a - 0] = arguments[_a];
                        }
                        internals.dragAndDropListeners.forEach(function (x) { return x.moved.apply(x, params); });
                    };
                    internals.listenOnDragAndDrop.dropped = function () {
                        var params = [];
                        for (var _a = 0; _a < arguments.length; _a++) {
                            params[_a - 0] = arguments[_a];
                        }
                        internals.dragAndDropListeners.forEach(function (x) { return x.dropped.apply(x, params); });
                    };
                    internals.listenOnDragAndDrop.overDroppable = function () {
                        var params = [];
                        for (var _a = 0; _a < arguments.length; _a++) {
                            params[_a - 0] = arguments[_a];
                        }
                        internals.dragAndDropListeners.forEach(function (x) { return x.overDroppable.apply(x, params); });
                    };
                    internals.listenOnDragAndDrop.outsideDroppable = function () {
                        var params = [];
                        for (var _a = 0; _a < arguments.length; _a++) {
                            params[_a - 0] = arguments[_a];
                        }
                        internals.dragAndDropListeners.forEach(function (x) { return x.outsideDroppable.apply(x, params); });
                    };
                    internals.listenOnDragAndDrop.canceled = function () {
                        var params = [];
                        for (var _a = 0; _a < arguments.length; _a++) {
                            params[_a - 0] = arguments[_a];
                        }
                        internals.dragAndDropListeners.forEach(function (x) { return x.canceled.apply(x, params); });
                    };
                    return internals;
                };
                GridTestHelpers.prototype.createDataSourceMock = function () {
                    var dataSource = {};
                    dataSource.subscribe = function (event, callback) {
                        dataSource.subscribe.subscribers.push({
                            event: event,
                            callback: callback
                        });
                        return function () {
                            dataSource.subscribe.subscribers = dataSource.subscribe.subscribers
                                .filter(function (x) { return x.callback !== callback && x.event !== event; });
                        };
                    };
                    dataSource.subscribe.subscribers = [];
                    dataSource.subscribe.emit = function (event, payload) {
                        dataSource.subscribe.subscribers.forEach(function (x) {
                            if (x.event === event) {
                                x.callback(payload);
                            }
                        });
                    };
                    return dataSource;
                };
                GridTestHelpers.prototype.createAureliaUtilsMock = function () {
                    var aureliaUtils = {};
                    aureliaUtils.observe = function (target, property, callback) {
                        aureliaUtils.observe.observers.push({
                            target: target,
                            property: property,
                            callback: callback
                        });
                        return function () {
                            aureliaUtils.observe.observers = aureliaUtils.observe.observers
                                .filter(function (x) { return x.target !== target && x.property !== property && x.callback !== callback; });
                        };
                    };
                    aureliaUtils.observe.observers = [];
                    aureliaUtils.observe.emit = function (target, property, newVal, oldVal) {
                        aureliaUtils.observe.observers.forEach(function (x) {
                            if (x.target === target && x.property === property) {
                                x.callback(newVal, oldVal);
                            }
                        });
                    };
                    return aureliaUtils;
                };
                return GridTestHelpers;
            }());
            exports_1("GridTestHelpers", GridTestHelpers);
        }
    }
});

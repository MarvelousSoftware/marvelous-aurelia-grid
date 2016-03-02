System.register(['aurelia-dependency-injection', 'marvelous-aurelia-core/utils', './constants', './all'], function(exports_1, context_1) {
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
    var aurelia_dependency_injection_1, utils_1, constants_1, all_1;
    var ComponentsArray, ComponentRegistration, GridComponent;
    return {
        setters:[
            function (aurelia_dependency_injection_1_1) {
                aurelia_dependency_injection_1 = aurelia_dependency_injection_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            },
            function (constants_1_1) {
                constants_1 = constants_1_1;
            },
            function (all_1_1) {
                all_1 = all_1_1;
            }],
        execute: function() {
            // TODO: allow to create a global ComponentRegistration in the plugin configuration
            ComponentsArray = (function (_super) {
                __extends(ComponentsArray, _super);
                function ComponentsArray(container) {
                    _super.call(this);
                    this.componentsToBeDisplayed = {};
                    this.container = container;
                }
                ComponentsArray.prototype.init = function (grid) {
                    var _this = this;
                    this.grid = grid;
                    // stops all components instances on grid detach
                    var detached = this.grid.internals.subscribe('Detached', function () {
                        _this.forEach(function (x) {
                            x.getAllInstances().forEach(function (i) {
                                if (i.stop && i.stop instanceof Function) {
                                    i.stop();
                                }
                            });
                        });
                        detached();
                    });
                    // add user defined components
                    // TODO: use OptionsReader so that it could be in the DOM
                    var customComponents = this.grid.options.codeBased.components || [];
                    customComponents.forEach(function (x) { return _this.add(x, false); });
                    // add default components
                    // these components then internally will specify
                    // whether are enabled or disabled
                    this.add(new ComponentRegistration({
                        name: 'm-filter-row',
                        type: all_1.FilterRowComponent,
                        view: './components/filter-row.html',
                        position: constants_1.componentPosition.afterColumns,
                        layout: constants_1.componentLayout.forEachColumn
                    }), false);
                    this.add(new ComponentRegistration({
                        name: 'm-pagination',
                        type: all_1.PaginationComponent,
                        view: './components/pagination.html',
                        position: constants_1.componentPosition.footer,
                        layout: constants_1.componentLayout.full
                    }), false);
                    this.add(new ComponentRegistration({
                        name: 'm-toolbox',
                        type: all_1.ToolboxComponent,
                        view: './components/toolbox.html',
                        position: constants_1.componentPosition.top,
                        layout: constants_1.componentLayout.full
                    }), false);
                    this.add(new ComponentRegistration({
                        name: 'm-grouping',
                        type: all_1.GroupingComponent,
                        view: './components/grouping.html',
                        position: constants_1.componentPosition.top,
                        layout: constants_1.componentLayout.full
                    }), false);
                    this.add(new ComponentRegistration({
                        name: 'm-query-language',
                        type: all_1.QueryLanguageComponent,
                        view: './components/query-language.html',
                        position: constants_1.componentPosition.afterColumns,
                        layout: constants_1.componentLayout.full
                    }), false);
                    this.add(new ComponentRegistration({
                        type: all_1.SortingComponent,
                        position: constants_1.componentPosition.background
                    }), false);
                    this.add(new ComponentRegistration({
                        type: all_1.ColumnChooserComponent,
                        view: './components/column-chooser.html',
                        position: constants_1.componentPosition.background
                    }), false);
                    this.add(new ComponentRegistration({
                        type: all_1.ColumnReorderingComponent,
                        position: constants_1.componentPosition.background
                    }), false);
                    this.forEach(function (x) { return x.load(); });
                };
                ComponentsArray.prototype.add = function (component, autoLoad) {
                    var _this = this;
                    if (autoLoad === void 0) { autoLoad = true; }
                    if (!(component instanceof ComponentRegistration)) {
                        throw new Error('Given component has to be an instance of Component type.');
                    }
                    component.init(this.grid, this.container, function () { _this.refreshComponentsToBeDisplayed(); });
                    this.push(component);
                    if (autoLoad) {
                        component.load();
                    }
                };
                ComponentsArray.prototype.get = function (type) {
                    var components = this.filter(function (x) { return x.type === type; });
                    if (!components.length) {
                        return undefined;
                    }
                    return components[0];
                };
                ComponentsArray.prototype.getAllInstances = function () {
                    var instances = [];
                    this.forEach(function (component) {
                        if (component.instance) {
                            instances.push(component.instance);
                        }
                        if (component.instances) {
                            component.instances.forEach(function (x) {
                                instances.push(x);
                            });
                        }
                    });
                    return instances;
                };
                /**
                 * Invokes action for each instance with defined given method.
                 */
                ComponentsArray.prototype.forEachInstanceWithMethod = function (method, action) {
                    this.getAllInstances().forEach(function (instance) {
                        if (instance && instance[method] instanceof Function) {
                            action(instance);
                        }
                    });
                };
                ComponentsArray.prototype.refreshComponentsToBeDisplayed = function () {
                    var _this = this;
                    this.componentsToBeDisplayed = {};
                    // only enabled and with attached view are displayed on the screen
                    this.filter(function (x) { return x.enabled !== false && x.view; })
                        .forEach(function (x) {
                        _this.componentsToBeDisplayed[x.position] = _this.componentsToBeDisplayed[x.position] || [];
                        _this.componentsToBeDisplayed[x.position].push(x);
                    });
                };
                ComponentsArray = __decorate([
                    aurelia_dependency_injection_1.transient(),
                    aurelia_dependency_injection_1.inject(aurelia_dependency_injection_1.Container)
                ], ComponentsArray);
                return ComponentsArray;
            }(Array));
            exports_1("ComponentsArray", ComponentsArray);
            ComponentRegistration = (function () {
                function ComponentRegistration(component) {
                    this.type = undefined;
                    this.position = undefined;
                    this.view = undefined;
                    this.instance = undefined;
                    this.instances = undefined;
                    this.layout = undefined;
                    //order;
                    this.name = undefined;
                    this.enabled = false;
                    this._onEnabledChanged = utils_1.Utils.noop;
                    this._loaded = false;
                    var missingField = false;
                    if (component.position == constants_1.componentPosition.background) {
                        if (utils_1.Utils.allDefined(component, 'type') === false) {
                            missingField = true;
                        }
                    }
                    else if (utils_1.Utils.allDefined(component, 'type', 'position', 'view') === false) {
                        missingField = true;
                    }
                    if (missingField) {
                        throw new Error('Component is missing at least one required field.');
                    }
                    for (var variable in this) {
                        if (component[variable] !== undefined) {
                            this[variable] = component[variable];
                        }
                    }
                    if (component.position != constants_1.componentPosition.background) {
                        // default component layout is `full`, but only if component is not the background one
                        this.layout = this.layout || constants_1.componentLayout.full;
                    }
                }
                ComponentRegistration.prototype.init = function (grid, container, onEnabledChanged) {
                    this._onEnabledChanged = onEnabledChanged || this._onEnabledChanged;
                    this._grid = grid;
                    this._container = container;
                };
                ComponentRegistration.prototype.load = function () {
                    var _this = this;
                    if (this._loaded) {
                        return;
                    }
                    this._loaded = true;
                    this._createInstances();
                    switch (this.layout) {
                        case constants_1.componentLayout.forEachColumn:
                            this._grid.options.columns.forEach(function (x) {
                                var instance = _this.instances.get(x);
                                _this.enable(false);
                            });
                            break;
                        default:
                            var instance = this.instance;
                            this.enable(false);
                            break;
                    }
                };
                /**
                 * Enables the component.
                 */
                ComponentRegistration.prototype.enable = function (force) {
                    if (force === void 0) { force = true; }
                    this._ensureLoaded();
                    if (this.enabled) {
                        return;
                    }
                    for (var _i = 0, _a = this.getAllInstances(); _i < _a.length; _i++) {
                        var instance = _a[_i];
                        if (instance.tryEnable && instance.tryEnable instanceof Function) {
                            if (instance.tryEnable()) {
                                this.enabled = true;
                            }
                            else if (force && instance.start && instance.start instanceof Function) {
                                instance.start();
                                this.enabled = true;
                            }
                            if (this.enabled) {
                                this._onEnabledChanged();
                            }
                        }
                    }
                };
                /**
                 * Disables the component.
                 */
                ComponentRegistration.prototype.disable = function () {
                    this._ensureLoaded();
                    if (this.enabled == false) {
                        return;
                    }
                    for (var _i = 0, _a = this.getAllInstances(); _i < _a.length; _i++) {
                        var instance = _a[_i];
                        if (instance.disable && instance.disable instanceof Function) {
                            instance.disable();
                            this.enabled = false;
                            this._onEnabledChanged();
                        }
                    }
                };
                /**
                 * Gets all instances associated with current component.
                 */
                ComponentRegistration.prototype.getAllInstances = function () {
                    var instances = [];
                    if (this.instance) {
                        instances.push(this.instance);
                    }
                    else if (this.instances) {
                        this.instances.forEach(function (instance) { return instances.push(instance); });
                    }
                    return instances;
                };
                ComponentRegistration.prototype._ensureLoaded = function () {
                    if (this._loaded) {
                        return;
                    }
                    this.load();
                };
                /**
                 * Creates view models. Depending on the layout it may create a single view model
                 * or view models for each column.
                 */
                ComponentRegistration.prototype._createInstances = function () {
                    var _this = this;
                    switch (this.layout) {
                        case constants_1.componentLayout.forEachColumn:
                            // Creates instance for each column using column object reference as a key.
                            this.instances = new Map();
                            this._grid.options.columns.forEach(function (x) { return _this.instances.set(x, _this._resolveInstance(x)); });
                            break;
                        default:
                            this.instance = this._resolveInstance();
                            break;
                    }
                };
                ComponentRegistration.prototype._resolveInstance = function (column) {
                    if (column === void 0) { column = undefined; }
                    if (column) {
                        return this._grid.internals.getInstance(this.type, [column]);
                    }
                    return this._grid.internals.getInstance(this.type);
                };
                return ComponentRegistration;
            }());
            exports_1("ComponentRegistration", ComponentRegistration);
            GridComponent = (function () {
                function GridComponent() {
                    this.subs = [];
                }
                /**
                 * Creates options and starts the component with `start` method.
                 * @returns boolean
                 */
                GridComponent.prototype.tryEnable = function () {
                    this.options = this.createOptions();
                    if (!this.options) {
                        return false;
                    }
                    this.start();
                    return true;
                };
                /**
                 * Called if component is about to disable.
                 */
                GridComponent.prototype.disable = function () {
                    this.stop();
                };
                /**
                 * Starts the component. Uses already created options if needed.
                 */
                GridComponent.prototype.start = function () {
                };
                /**
                 * Unregisters subs. Called on grid detach.
                 */
                GridComponent.prototype.stop = function () {
                    if (this.subs) {
                        this.subs.forEach(function (sub) { return sub(); });
                        this.subs = [];
                    }
                };
                /**
                 * In derived class creates component specific options. If `enable` method is not overriden
                 * then this method has to return object castable to `true` in order to make component enabled.
                 */
                GridComponent.prototype.createOptions = function () {
                    return {};
                };
                /**
                 * Saves the current state of a component so that it could be loaded some time in the future.
                 * This method should attach properties to the `state` parameter.
                 */
                GridComponent.prototype.saveState = function (state) {
                };
                /**
                 * Loads state.
                 */
                GridComponent.prototype.loadState = function (state) {
                };
                return GridComponent;
            }());
            exports_1("GridComponent", GridComponent);
        }
    }
});

System.register(['marvelous-aurelia-core/utils', 'marvelous-aurelia-core/pubsub'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var utils_1, pubsub_1;
    var GridInternals;
    return {
        setters:[
            function (utils_1_1) {
                utils_1 = utils_1_1;
            },
            function (pubsub_1_1) {
                pubsub_1 = pubsub_1_1;
            }],
        execute: function() {
            GridInternals = (function () {
                function GridInternals(_grid) {
                    this._grid = _grid;
                    this.columnsDraggabilityEnabled = false;
                    this.dragAndDropListeners = [];
                    /**
                     * Array of currently visible columns on the main panel.
                     */
                    this.mainColumns = [];
                    this._id = undefined;
                    this._pubSub = new pubsub_1.PubSub();
                    this._id = ++GridInternals._lastId;
                }
                Object.defineProperty(GridInternals.prototype, "id", {
                    get: function () {
                        return this._id;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(GridInternals.prototype, "renderer", {
                    get: function () {
                        return this._grid.renderer;
                    },
                    enumerable: true,
                    configurable: true
                });
                GridInternals.prototype.makeColumnsDraggable = function () {
                    this.columnsDraggabilityEnabled = true;
                };
                GridInternals.prototype.listenOnDragAndDrop = function (listener) {
                    if (!listener.dropArea) {
                        throw new Error('Drop area has to be defined.');
                    }
                    listener.started = listener.started || utils_1.Utils.noop;
                    listener.moved = listener.moved || utils_1.Utils.noop;
                    listener.dropped = listener.dropped || utils_1.Utils.noop;
                    listener.overDroppable = listener.overDroppable || utils_1.Utils.noop;
                    listener.outsideDroppable = listener.outsideDroppable || utils_1.Utils.noop;
                    listener.canceled = listener.canceled || utils_1.Utils.noop;
                    this.makeColumnsDraggable();
                    this.dragAndDropListeners.push(listener);
                };
                GridInternals.prototype.publish = function (name, payload) {
                    return this._pubSub.publish(name, payload);
                };
                GridInternals.prototype.subscribe = function (name, callback) {
                    return this._pubSub.subscribe(name, callback);
                };
                GridInternals.prototype.unsubscribe = function (name, callback) {
                    return this._pubSub.unsubscribe(name, callback);
                };
                GridInternals.prototype.createTempContainer = function () {
                    var container = document.body.querySelector('div.m-grid-temp-container');
                    if (container) {
                        return;
                    }
                    var el = document.createElement('div');
                    el.classList.add('m-grid-temp-container');
                    document.body.appendChild(el);
                };
                GridInternals.prototype.refresh = function () {
                    return this._grid.dataSource.read();
                };
                GridInternals.prototype.setIsLoading = function (loading) {
                    var _this = this;
                    if (this._loadingDebounceId) {
                        clearTimeout(this._loadingDebounceId);
                    }
                    if (!loading) {
                        this.loading = loading;
                        return;
                    }
                    this._loadingDebounceId = setTimeout(function () {
                        _this.loading = loading;
                    }, this._grid.dataSource.options.debounce);
                };
                GridInternals.prototype.getInstance = function (fn, explicitDependencies) {
                    explicitDependencies = explicitDependencies || [];
                    var dependencies = this.getInstancesOfGridServices();
                    explicitDependencies.forEach(function (x) { return dependencies.push(x); });
                    return this._instantiate(fn, dependencies);
                };
                /**
                 * Creates new instantion of Fn using 'inject' property and provided instances.
                 * If type is in the explicitDependencies then it will be injected.
                 */
                GridInternals.prototype._instantiate = function (fn, explicitDependencies) {
                    var dependencies = fn.inject || [];
                    var i = dependencies.length;
                    var args = new Array(i);
                    while (i--) {
                        var dep = dependencies[i];
                        var found = false;
                        if (!dep) {
                            throw new Error("One of the dependencies of '" + fn + "' is undefined. Make sure there's no circular dependencies.");
                        }
                        for (var _i = 0, explicitDependencies_1 = explicitDependencies; _i < explicitDependencies_1.length; _i++) {
                            var instance = explicitDependencies_1[_i];
                            if (instance instanceof dep) {
                                args[i] = instance;
                                found = true;
                                break;
                            }
                        }
                        if (found) {
                            continue;
                        }
                        args[i] = this._grid.container.get(dep);
                    }
                    return new (Function.prototype.bind.apply(fn, Array.prototype.concat.apply([null], args)));
                };
                /**
                 * Gets instances injectable to components.
                 */
                GridInternals.prototype.getInstancesOfGridServices = function () {
                    var g = this._grid;
                    return [g.components, g.dataSource, g.aureliaUtils, g.options, g.internals, g.optionsReader, g.renderer, g];
                };
                GridInternals._lastId = 0;
                return GridInternals;
            }());
            exports_1("GridInternals", GridInternals);
        }
    }
});

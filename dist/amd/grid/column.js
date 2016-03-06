System.register(['aurelia-templating', 'aurelia-dependency-injection', 'marvelous-aurelia-core/utils', '../dragAndDrop/draggabilityCore', 'marvelous-aurelia-core/aureliaUtils'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var aurelia_templating_1, aurelia_dependency_injection_1, utils_1, draggabilityCore_1, aureliaUtils_1;
    var ColumnViewModel;
    return {
        setters:[
            function (aurelia_templating_1_1) {
                aurelia_templating_1 = aurelia_templating_1_1;
            },
            function (aurelia_dependency_injection_1_1) {
                aurelia_dependency_injection_1 = aurelia_dependency_injection_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            },
            function (draggabilityCore_1_1) {
                draggabilityCore_1 = draggabilityCore_1_1;
            },
            function (aureliaUtils_1_1) {
                aureliaUtils_1 = aureliaUtils_1_1;
            }],
        execute: function() {
            ColumnViewModel = (function () {
                function ColumnViewModel(element, aureliaUtils) {
                    this.subs = [];
                    this.unregisterDraggability = function () { };
                    this.element = element;
                    this.aureliaUtils = aureliaUtils;
                }
                ColumnViewModel.prototype.attached = function () {
                    var _this = this;
                    this.subs.push(this.aureliaUtils.observe(this.grid.internals, 'columnsDraggabilityEnabled', function () {
                        _this.refreshDraggability();
                    }));
                    this.refreshDraggability();
                };
                ColumnViewModel.prototype.detached = function () {
                    this.subs.forEach(function (x) { return x(); });
                    this.unregisterDraggability();
                };
                ColumnViewModel.prototype.columnClicked = function () {
                    this.grid.internals.publish('ColumnClicked', this.column);
                };
                ColumnViewModel.prototype.refreshDraggability = function () {
                    if (!this.grid.internals.columnsDraggabilityEnabled) {
                        this.unregisterDraggability();
                        return;
                    }
                    this.unregisterDraggability = this.makeColumnDraggable() || this.unregisterDraggability;
                };
                ColumnViewModel.prototype.makeColumnDraggable = function () {
                    var _this = this;
                    var column = this.element.querySelector('.m-grid-column');
                    var currentListener;
                    var isAlreadyDraggable = column.attributes['data-is-draggable'] != null;
                    if (isAlreadyDraggable) {
                        return;
                    }
                    column.setAttribute('data-is-draggable', 'true');
                    var draggable = new draggabilityCore_1.DraggabilityCore({
                        isHandle: function (el) {
                            if (!el.attributes["data-id"] || el.attributes["data-id"].value !== column.attributes["data-id"].value) {
                                return;
                            }
                            var correctGrid = utils_1.DomUtils.closest(el, 'M-GRID').au.controller.viewModel.internals.id === _this.grid.internals.id;
                            return correctGrid;
                        },
                        ghost: {
                            className: 'm-grid-column-ghost',
                            containerSelector: '.m-grid-temp-container',
                            html: function (el) { return el.attributes["data-heading"].value; },
                        },
                        handler: {
                            droppableElement: function (e, el) {
                                var droppableElement = undefined;
                                currentListener = undefined;
                                _this.grid.internals.dragAndDropListeners.forEach(function (listener) {
                                    var possiblyDroppable = _this.grid.internals.element.querySelector(listener.dropArea);
                                    if (!possiblyDroppable || !utils_1.DomUtils.isVisible(possiblyDroppable)) {
                                        return true;
                                    }
                                    var isOver = utils_1.DomUtils.isCursorOverElement(possiblyDroppable, e);
                                    if (isOver && (!currentListener || currentListener.zIndex === undefined || currentListener.zIndex < listener.zIndex)) {
                                        currentListener = listener;
                                        droppableElement = possiblyDroppable;
                                    }
                                });
                                if (currentListener) {
                                    currentListener.moved(e, el, _this.column);
                                }
                                return droppableElement;
                            },
                            dropped: function (e, el) {
                                currentListener.dropped(e, el, _this.column);
                            },
                            overDroppable: function (e, el) {
                                currentListener.overDroppable(e, el, _this.column);
                            },
                            outsideDroppable: function (e, el) {
                                _this.grid.internals.dragAndDropListeners.forEach(function (l) { return l.outsideDroppable(e, el, _this.column); });
                            },
                            canceled: function (e, el) {
                                _this.grid.internals.dragAndDropListeners.forEach(function (l) { return l.canceled(e, el, _this.column); });
                            },
                            started: function (e, el) {
                                _this.grid.internals.createTempContainer();
                                _this.grid.internals.dragAndDropListeners.forEach(function (l) { return l.started(e, el, _this.column); });
                            }
                        }
                    });
                    return draggable.register();
                };
                __decorate([
                    aurelia_templating_1.bindable
                ], ColumnViewModel.prototype, "column", void 0);
                __decorate([
                    aurelia_templating_1.bindable
                ], ColumnViewModel.prototype, "grid", void 0);
                ColumnViewModel = __decorate([
                    aurelia_templating_1.customElement('m-grid-column'),
                    aurelia_dependency_injection_1.inject(Element, aureliaUtils_1.AureliaUtils)
                ], ColumnViewModel);
                return ColumnViewModel;
            }());
            exports_1("ColumnViewModel", ColumnViewModel);
        }
    }
});

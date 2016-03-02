System.register(['aurelia-binding', 'aurelia-dependency-injection', 'marvelous-aurelia-core/utils'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var aurelia_binding_1, aurelia_dependency_injection_1, utils_1;
    var DOMSettingsReader, SettingsSlot, AttributeSetting;
    return {
        setters:[
            function (aurelia_binding_1_1) {
                aurelia_binding_1 = aurelia_binding_1_1;
            },
            function (aurelia_dependency_injection_1_1) {
                aurelia_dependency_injection_1 = aurelia_dependency_injection_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            }],
        execute: function() {
            // TODO: deprecated, get rid of it
            DOMSettingsReader = (function () {
                function DOMSettingsReader(_bindingEngine) {
                    this._bindingEngine = _bindingEngine;
                }
                DOMSettingsReader.prototype.init = function (bindingContext, element) {
                    this._element = element;
                    this._bindingContext = bindingContext;
                    this._settings = new SettingsSlot(bindingContext, this._bindingEngine, element);
                    this._parseRoot();
                };
                DOMSettingsReader.prototype.has = function (selector) {
                    return !!this.get(selector);
                };
                DOMSettingsReader.prototype.get = function (selector) {
                    var parts = selector.split(' ');
                    var current = this._settings;
                    parts.forEach(function (x) {
                        if (current === undefined) {
                            return;
                        }
                        current = current[x];
                    });
                    return current;
                };
                DOMSettingsReader.prototype.getSingle = function (selector) {
                    var setting = this.get(selector);
                    if (setting === undefined) {
                        return;
                    }
                    if (setting instanceof Array) {
                        throw new Error("Multiple settings defined for '" + selector + "'.");
                    }
                    return setting;
                };
                DOMSettingsReader.prototype.getSingleOrDefault = function (selector) {
                    return this.getSingle(selector) || SettingsSlot.empty(this._bindingEngine);
                };
                DOMSettingsReader.prototype.getMany = function (selector) {
                    var setting = this.get(selector);
                    if (setting === undefined) {
                        return [];
                    }
                    if (setting instanceof Array) {
                        return setting;
                    }
                    return [setting];
                };
                DOMSettingsReader.prototype._parseRoot = function () {
                    this._parse(this._element, this._settings);
                };
                DOMSettingsReader.prototype._parse = function (currentElement, currentSettingSlot) {
                    for (var i = 0; i < currentElement.children.length; i++) {
                        var element = currentElement.children[i];
                        if (!element.children.length) {
                            var newNodeSettings = this._createNodeSettings(element);
                            var newSlotName = element.nodeName.toLowerCase();
                            if (currentSettingSlot[newSlotName]) {
                                if (currentSettingSlot[newSlotName] instanceof Array) {
                                    currentSettingSlot[newSlotName].push(newNodeSettings);
                                    continue;
                                }
                                var first = currentSettingSlot[newSlotName];
                                currentSettingSlot[newSlotName] = [first, newNodeSettings];
                                continue;
                            }
                            currentSettingSlot[newSlotName] = newNodeSettings;
                            continue;
                        }
                        var name_1 = element.nodeName.toLowerCase();
                        currentSettingSlot.initInner(name_1, element);
                        this._parse(element, currentSettingSlot[name_1]);
                    }
                };
                DOMSettingsReader.prototype._createNodeSettings = function (element) {
                    var nodeSettings = new SettingsSlot(this._bindingContext, this._bindingEngine, element);
                    if (!element.attributes) {
                        return nodeSettings;
                    }
                    for (var index = 0; index < element.attributes.length; index++) {
                        var attribute = element.attributes[index];
                        var name_2 = utils_1.Utils.convertFromDashToLowerCamelCaseNotation(attribute.name);
                        var setting = new AttributeSetting(name_2, this._bindingContext, attribute.value, this._bindingEngine);
                        nodeSettings[setting.name] = setting;
                    }
                    return nodeSettings;
                };
                DOMSettingsReader = __decorate([
                    aurelia_dependency_injection_1.inject(aurelia_binding_1.BindingEngine)
                ], DOMSettingsReader);
                return DOMSettingsReader;
            }());
            exports_1("DOMSettingsReader", DOMSettingsReader);
            SettingsSlot = (function () {
                function SettingsSlot(__bindingContext, __bindingEngine, __element) {
                    this.__bindingContext = __bindingContext;
                    this.__bindingEngine = __bindingEngine;
                    this.__element = __element;
                }
                SettingsSlot.empty = function (bindingEngine) { return new SettingsSlot(undefined, bindingEngine, document.createElement('div')); };
                SettingsSlot.prototype.getElement = function () {
                    return this.__element;
                };
                SettingsSlot.prototype.defineIfUndefined = function () {
                    var _this = this;
                    var names = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        names[_i - 0] = arguments[_i];
                    }
                    names.forEach(function (x) { return _this[x] = _this[x] || new AttributeSetting(x, _this.__bindingContext, undefined, _this.__bindingEngine); });
                };
                SettingsSlot.prototype.initInner = function (name, element) {
                    this[name] = this[name] || new SettingsSlot(this.__bindingContext, this.__bindingEngine, element);
                };
                SettingsSlot.prototype.getAllAttributes = function () {
                    var attributes = [];
                    for (var key in this) {
                        if (this[key] instanceof AttributeSetting) {
                            attributes.push(this[key]);
                        }
                    }
                    return attributes;
                };
                /**
                 * Gets attribute defined in the settings slot.
                 * In case if attribute with given name doesn't exist
                 * a new one with undefined value is being created.
                 */
                SettingsSlot.prototype.get = function (name) {
                    return this[name] || new AttributeSetting(name, this.__bindingContext, undefined, this.__bindingEngine);
                };
                return SettingsSlot;
            }());
            exports_1("SettingsSlot", SettingsSlot);
            AttributeSetting = (function () {
                function AttributeSetting(name, bindingContext, value, _bindingEngine) {
                    this._bindingEngine = _bindingEngine;
                    this.isExpression = false;
                    if (utils_1.Utils.endsWith(name, '.bind')) {
                        var bindIndex = name.lastIndexOf('.bind');
                        this.name = name.substr(0, bindIndex);
                        this.fullName = name;
                        this.isExpression = true;
                    }
                    else {
                        this.fullName = this.name = name;
                    }
                    this.bindingContext = bindingContext;
                    this.value = value;
                }
                AttributeSetting.prototype.evaluate = function () {
                    if (!this.isExpression) {
                        return this.value;
                    }
                    return this._bindingEngine.parseExpression(this.value).evaluate({
                        bindingContext: this.bindingContext,
                        overrideContext: undefined
                    }, undefined);
                };
                return AttributeSetting;
            }());
            exports_1("AttributeSetting", AttributeSetting);
        }
    }
});

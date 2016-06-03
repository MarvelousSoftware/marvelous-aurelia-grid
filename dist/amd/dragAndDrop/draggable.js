var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", 'aurelia-templating', 'aurelia-dependency-injection', './draggabilityCore'], function (require, exports, aurelia_templating_1, aurelia_dependency_injection_1, draggabilityCore_1) {
    "use strict";
    var DraggableCustomAttribute = (function () {
        function DraggableCustomAttribute(_element) {
            this._element = _element;
            this.subs = [];
        }
        DraggableCustomAttribute.prototype.attached = function () {
            var handle = this._element.querySelector('[m-draggable-handle]') || this._element;
            var handles = handle.getElementsByTagName('*');
            var draggable = new draggabilityCore_1.DraggabilityCore({
                isHandle: function (el) {
                    if (el === handle) {
                        return true;
                    }
                    for (var i = 0; i < handles.length; i++) {
                        if (handles[i] === el) {
                            return true;
                        }
                    }
                    return false;
                },
                draggedElement: this._element
            });
            this.subs.push(draggable.register());
        };
        DraggableCustomAttribute.prototype.detached = function () {
            this.subs.forEach(function (x) { return x && x(); });
        };
        DraggableCustomAttribute = __decorate([
            aurelia_templating_1.customAttribute('m-draggable'),
            aurelia_dependency_injection_1.inject(Element)
        ], DraggableCustomAttribute);
        return DraggableCustomAttribute;
    }());
    exports.DraggableCustomAttribute = DraggableCustomAttribute;
});

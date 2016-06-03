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
define(["require", "exports", 'aurelia-dependency-injection', '../../all'], function (require, exports, aurelia_dependency_injection_1, all_1) {
    "use strict";
    var ToolboxComponent = (function (_super) {
        __extends(ToolboxComponent, _super);
        function ToolboxComponent(_gridOptions) {
            _super.call(this);
            this._gridOptions = _gridOptions;
            this.buttons = [];
        }
        ToolboxComponent.prototype.addButton = function (button) {
            if (!button.text || !button.click) {
                throw new Error("Missing text or click handler.");
            }
            this.buttons.push(button);
        };
        ToolboxComponent.prototype.createOptions = function () {
            if (!this._gridOptions.domBased.has('toolbox') && !this._gridOptions.codeBased.toolbox) {
                return false;
            }
            return {};
        };
        ToolboxComponent = __decorate([
            aurelia_dependency_injection_1.inject(all_1.GridOptions)
        ], ToolboxComponent);
        return ToolboxComponent;
    }(all_1.GridComponent));
    exports.ToolboxComponent = ToolboxComponent;
});

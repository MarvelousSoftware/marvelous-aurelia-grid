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
    var QueryLanguageComponent = (function (_super) {
        __extends(QueryLanguageComponent, _super);
        function QueryLanguageComponent(_gridOptions, _gridInternals, _dataSource, _components) {
            _super.call(this);
            this._gridOptions = _gridOptions;
            this._gridInternals = _gridInternals;
            this._dataSource = _dataSource;
            this._components = _components;
            this.editorOptions = {
                inlineButton: false,
                submitOnFocusOut: true
            };
        }
        QueryLanguageComponent.prototype.start = function () {
            var _this = this;
            this.editorOptions.autoComplete = this.options.autoComplete;
            this.editorOptions.onSubmit = function () { return _this.refresh(); };
            this.subs = [
                this._dataSource.subscribe('DataRead', function (params) { return _this._onDataRead(params); })
            ];
        };
        QueryLanguageComponent.prototype.saveState = function (state) {
            state.query = this.queryLanguage.query;
        };
        QueryLanguageComponent.prototype.loadState = function (state) {
            this.queryLanguage.query = state.query;
        };
        QueryLanguageComponent.prototype._onDataRead = function (params) {
            if (!this.queryLanguage || !this.queryLanguage.query) {
                // queryLanguage is defined if view model is attached
                return;
            }
            params.query = this.queryLanguage.query;
        };
        QueryLanguageComponent.prototype.refresh = function () {
            var pagination = this._components.get(all_1.PaginationComponent).instance;
            pagination.selected = 1;
            return this._gridInternals.refresh();
        };
        QueryLanguageComponent.prototype.createOptions = function () {
            if (!this._gridOptions.domBased.has('query-language') && !this._gridOptions.codeBased.queryLanguage) {
                return false;
            }
            var language = this._gridOptions.domBased.getSingleOrDefault('query-language');
            language.defineIfUndefined('autoComplete');
            return {
                autoComplete: language.get('autoComplete').evaluate() || false
            };
        };
        QueryLanguageComponent = __decorate([
            aurelia_dependency_injection_1.inject(all_1.GridOptions, all_1.GridInternals, all_1.DataSource, all_1.ComponentsArray)
        ], QueryLanguageComponent);
        return QueryLanguageComponent;
    }(all_1.GridComponent));
    exports.QueryLanguageComponent = QueryLanguageComponent;
});

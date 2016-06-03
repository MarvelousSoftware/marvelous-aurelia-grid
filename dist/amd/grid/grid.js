var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", 'aurelia-templating', 'aurelia-dependency-injection', 'aurelia-templating-resources', 'marvelous-aurelia-core/utils', 'marvelous-aurelia-core/optionsReader', 'marvelous-aurelia-core/aureliaUtils', './config', './grid-renderer', './data-source/data-source-manager', './pluginability', '../domSettingsReader', './grid-internals', './grid-options', './components'], function (require, exports, aurelia_templating_1, aurelia_dependency_injection_1, aurelia_templating_resources_1, utils_1, optionsReader_1, aureliaUtils_1, config_1, grid_renderer_1, data_source_manager_1, pluginability_1, domSettingsReader_1, grid_internals_1, grid_options_1, components_1) {
    "use strict";
    var Grid = (function () {
        function Grid(element, components, aureliaUtils, renderer, domSettingsReader, optionsReaderFactory, container) {
            this.initialized = false;
            this.subs = [];
            this._stateContainerName = '__m-grid__';
            this._domOptionsElement = element.cloneNode(true);
            this.components = components;
            this.aureliaUtils = aureliaUtils;
            this.domSettingsReader = domSettingsReader;
            this._optionsReaderFactory = optionsReaderFactory;
            this.container = container;
            this.renderer = renderer;
            this.internals = new grid_internals_1.GridInternals(this);
            this.internals.element = element;
            renderer.init(this);
            // gets rid of options defined via dom
            // these options are already copied anyway
            utils_1.DomUtils.clearInnerHtml(element);
        }
        /**
         * Refreshes grid translations.
         */
        Grid.refreshTranslations = function () {
            var signaler = aurelia_dependency_injection_1.Container.instance.get(aurelia_templating_resources_1.BindingSignaler);
            signaler.signal('m-grid-refresh-translations');
        };
        /**
         * Changes the current language and refreshes translations instantly.
         */
        Grid.changeLanguage = function (language) {
            config_1.gridConfig.language = language;
            Grid.refreshTranslations();
        };
        Grid.prototype.bind = function (executionContext) {
            var _this = this;
            this.viewModel = executionContext;
            this.domSettingsReader.init(this.viewModel, this._domOptionsElement);
            this.optionsReader = this._optionsReaderFactory.create(this.viewModel, this._domOptionsElement, this.codeDefinedOptions);
            this.options = new grid_options_1.GridOptions(this.internals, this.optionsReader, this.domSettingsReader, this.codeDefinedOptions);
            this.options.validate();
            this.dataSource = new data_source_manager_1.DataSourceManager(this).createDataSource();
            this.internals.mainColumns = this.options.columns.filter(function (x) { return !x.hidden; });
            this.components.init(this);
            this.selection = this.components.get(components_1.SelectionComponent).instance;
            this.subs.push(this.aureliaUtils.observe(this.internals, 'mainColumns', function () { return _this.renderer.render(); }));
        };
        Grid.prototype.attached = function () {
            var _this = this;
            this.internals.createTempContainer();
            this.subs.push(this.dataSource.subscribe('DataRead', function (params) { return _this.internals.setIsLoading(true); }));
            this.subs.push(this.dataSource.subscribe('DataReceived', function (e) {
                _this.internals.setIsLoading(false);
                _this.initialized = true;
                _this.renderer.render();
            }));
            this.subs.push(this.dataSource.subscribe('DataReadError', function () { return _this.internals.setIsLoading(false); }));
            this.internals.refresh().then(function () { }, function () { return _this.initialized = true; });
        };
        Grid.prototype.detached = function () {
            this.internals.publish('Detached', {});
            this.subs.forEach(function (sub) { return sub(); });
            this.subs = [];
        };
        /**
         * Subscribes for event with given name.
         * @param name Name of the event.
         */
        Grid.prototype.subscribe = function (name, callback) {
            this.internals.subscribe(name, callback);
        };
        /**
         * Refreshes the grid.
         */
        Grid.prototype.refresh = function () {
            this.internals.refresh();
        };
        /**
         * Loads the state of a grid using provided serialized value.
         */
        Grid.prototype.loadState = function (serializedState) {
            var state = JSON.parse(serializedState);
            this.components.forEachInstanceWithMethod('loadState', function (x) {
                var name = x.component.name;
                x.instance.loadState(state[name] || {});
            });
            // beside components main grid has state as well
            this._loadMainGridState(state[this._stateContainerName] || {});
            this.internals.refresh();
        };
        /**
         * Saves the current state of a grid, e.g. groupings, order of columns and so on.
         * @returns String which is loadable by loadState method
         */
        Grid.prototype.saveState = function () {
            var state = {};
            this.components.forEachInstanceWithMethod('saveState', function (x) {
                var name = x.component.name;
                state[name] = state[name] || {};
                x.instance.saveState(state[name]);
            });
            // main grid has state as well
            var name = this._stateContainerName;
            state[name] = state[name] || {};
            this._saveMainGridState(state[name]);
            return JSON.stringify(state);
        };
        Grid.prototype._saveMainGridState = function (state) {
            state.columns = this.internals.mainColumns.map(function (x) { return x.getUniqueId(); });
        };
        Grid.prototype._loadMainGridState = function (state) {
            var _this = this;
            this.internals.mainColumns = state.columns.map(function (x) {
                var column = _this.options.getColumnByUniqueId(x);
                column.setOwner(Grid);
                return column;
            });
        };
        __decorate([
            aurelia_templating_1.bindable({ attribute: 'options' })
        ], Grid.prototype, "codeDefinedOptions", void 0);
        Grid = __decorate([
            aurelia_templating_1.customElement('m-grid'),
            aurelia_templating_1.processContent(false),
            aurelia_dependency_injection_1.inject(Element, pluginability_1.ComponentsArray, aureliaUtils_1.AureliaUtils, grid_renderer_1.GridRenderer, domSettingsReader_1.DOMSettingsReader, optionsReader_1.OptionsReaderFactory, aurelia_dependency_injection_1.Container)
        ], Grid);
        return Grid;
    }());
    exports.Grid = Grid;
});

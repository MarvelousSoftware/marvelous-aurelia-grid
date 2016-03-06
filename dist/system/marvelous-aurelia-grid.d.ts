declare module "marvelous-aurelia-grid/domSettingsReader" {
	import { BindingEngine } from 'aurelia-binding';
	export class DOMSettingsReader {
	    private _bindingEngine;
	    private _element;
	    private _bindingContext;
	    private _settings;
	    constructor(_bindingEngine: BindingEngine);
	    init(bindingContext: any, element: HTMLElement): void;
	    has(selector: string): boolean;
	    get(selector: string): SettingsSlot | SettingsSlot[];
	    getSingle(selector: string): SettingsSlot;
	    getSingleOrDefault(selector: string): SettingsSlot;
	    getMany(selector: string): SettingsSlot[];
	    private _parseRoot();
	    private _parse(currentElement, currentSettingSlot);
	    private _createNodeSettings(element);
	}
	export class SettingsSlot {
	    private __bindingContext;
	    private __bindingEngine;
	    private __element;
	    static empty(bindingEngine: any): SettingsSlot;
	    constructor(__bindingContext: any, __bindingEngine: BindingEngine, __element: HTMLElement);
	    getElement(): HTMLElement;
	    defineIfUndefined(...names: any[]): void;
	    initInner(name: string, element: HTMLElement): void;
	    getAllAttributes(): AttributeSetting[];
	    /**
	     * Gets attribute defined in the settings slot.
	     * In case if attribute with given name doesn't exist
	     * a new one with undefined value is being created.
	     */
	    get(name: string): AttributeSetting;
	}
	export class AttributeSetting {
	    private _bindingEngine;
	    bindingContext: any;
	    value: any;
	    name: string;
	    fullName: string;
	    isExpression: boolean;
	    constructor(name: string, bindingContext: any, value: any, _bindingEngine: BindingEngine);
	    evaluate(): any;
	}
}
declare module "marvelous-aurelia-grid/grid/constants" {
	export let componentPosition: {
	    footer: string;
	    top: string;
	    afterColumns: string;
	    background: string;
	};
	export let componentLayout: {
	    forEachColumn: string;
	    full: string;
	};
	export let sortingMode: {
	    single: string;
	    multiple: string;
	};
	export let dataSourceMode: {
	    clientSide: string;
	    serverSide: string;
	};
}
declare module "marvelous-aurelia-grid/grid/pluginability" {
	import { Container } from 'aurelia-dependency-injection';
	import { Column } from 'marvelous-aurelia-grid/grid/all';
	import { Grid } from 'marvelous-aurelia-grid/grid/grid';
	export class ComponentsArray extends Array<ComponentRegistration<any>> {
	    container: any;
	    grid: Grid;
	    componentsToBeDisplayed: {};
	    constructor(container: any);
	    init(grid: Grid): void;
	    add(component: ComponentRegistration<any>, autoLoad?: boolean): void;
	    private _checkNameUniqueness(name);
	    get<T extends GridComponent>(type: {
	        new (...args): T;
	    }): ComponentRegistration<T>;
	    getAllInstances(): IComponentInstance<any>[];
	    /**
	     * Invokes action for each instance with defined given method.
	     */
	    forEachInstanceWithMethod(method: string, action: (instance: IComponentInstance<any>) => void): void;
	    refreshComponentsToBeDisplayed(): void;
	}
	export interface IComponentRegistrationDefinition {
	    /**
	     * Name of the component.
	     */
	    name: string;
	    /**
	     * Component's constructor function.
	     */
	    type: Function;
	    /**
	     * Place where component will be rendered. Available values:
	     * - 'top'
	     * - 'afterColumns'
	     * - 'footer'
	     * - 'background'
	     *
	     * Background renders underneath the grid, but only if `view` is provided.
	     */
	    position: string;
	    /**
	     * Absolute path to the view. Not required if position is 'background'.
	     */
	    view?: string;
	    /**
	     * Controls the component appearance. Available values:
	     * 'full' - full row is being used by the component
	     * 'forEachColumn' - renders a separate cell for each column
	     */
	    layout?: string;
	}
	export class ComponentRegistration<T extends GridComponent> {
	    type: Function;
	    position: any;
	    view: any;
	    instance: T;
	    instances: Map<Column, T>;
	    layout: any;
	    name: string;
	    enabled: boolean;
	    private _onEnabledChanged;
	    private _grid;
	    private _container;
	    private _loaded;
	    constructor(component: IComponentRegistrationDefinition);
	    _init(grid: Grid, container: Container, onEnabledChanged: Function): void;
	    _load(): void;
	    /**
	     * Enables the component.
	     */
	    enable(force?: boolean): void;
	    /**
	     * Disables the component.
	     */
	    disable(): void;
	    /**
	     * Gets all instances associated with current component.
	     */
	    getAllInstances(): GridComponent[];
	    private _ensureLoaded();
	    /**
	     * Creates view models. Depending on the layout it may create a single view model
	     * or view models for each column.
	     */
	    private _createInstances();
	    private _resolveInstance(column?);
	}
	export class GridComponent {
	    options: any;
	    subs: (() => void)[];
	    /**
	     * Creates options and starts the component with `start` method.
	     * @returns boolean
	     */
	    tryEnable(): boolean;
	    /**
	     * Called if component is about to disable.
	     */
	    disable(): void;
	    /**
	     * Starts the component. Uses already created options if needed.
	     */
	    start(): void;
	    /**
	     * Unregisters subs. Called on grid detach.
	     */
	    stop(): void;
	    /**
	     * In derived class creates component specific options. If `enable` method is not overriden
	     * then this method has to return object castable to `true` in order to make component enabled.
	     */
	    createOptions(): any;
	    /**
	     * Saves the current state of a component so that it could be loaded some time in the future.
	     * This method should attach properties to the `state` parameter.
	     */
	    saveState(state: any): void;
	    /**
	     * Loads state.
	     */
	    loadState(state: any): void;
	}
	export interface IComponentInstance<T extends GridComponent> {
	    component: ComponentRegistration<T>;
	    instance: GridComponent;
	}
}
declare module "marvelous-aurelia-grid/grid/gridRenderer" {
	import { IDataRow, Grid, Column } from 'marvelous-aurelia-grid/grid/all';
	import { Compiler } from 'marvelous-aurelia-core/compiler';
	export class GridRenderer {
	    rows: IDataRow[];
	    groups: any[];
	    tableDataViewFactory: any;
	    grid: Grid;
	    compiler: Compiler;
	    constructor(compiler: Compiler);
	    init(grid: Grid): void;
	    render(): void;
	    private createRows();
	}
	export interface IDataRow {
	    grid: Grid;
	    type: string;
	    column?: Column;
	    value?: any;
	    level: Number;
	    data?: any;
	}
}
declare module "marvelous-aurelia-grid/grid/dataSource/clientSideDataSource" {
	import { DataSource, IDataSourceResult } from 'marvelous-aurelia-grid/grid/all';
	export class ClientSideDataSource extends DataSource {
	    static modeName: string;
	    transformResult(result: any, params: any): IDataSourceResult;
	    addItem(item: any): void;
	    removeItem(item: any): void;
	}
}
declare module "marvelous-aurelia-grid/grid/dataSource/serverSideDataSource" {
	import { DataSource, IDataSourceResult } from 'marvelous-aurelia-grid/grid/all';
	export class ServerSideDataSource extends DataSource {
	    static modeName: string;
	    private _getOnlyVisible;
	    constructor(grid: any, options: any);
	    /**
	     * Serializes parameters.
	     */
	    beforeRead(params: any): {
	        marvelousParams: string;
	    };
	    transformResult(result: any, params: any): IDataSourceResult;
	    addItem(item: any): void;
	    removeItem(item: any): void;
	}
}
declare module "marvelous-aurelia-grid/grid/dataSource/dataSourceManager" {
	import { Grid } from 'marvelous-aurelia-grid/grid/grid';
	export class DataSourceManager {
	    grid: Grid;
	    private _dataSources;
	    private _options;
	    constructor(grid: Grid);
	    add(mode: any, create: any): void;
	    createDataSource(): any;
	    createOptions(): any;
	    static createReadMethod(read: any): any;
	}
}
declare module "marvelous-aurelia-grid/dragAndDrop/draggabilityCore" {
	export class DraggabilityCore {
	    config: {
	        isHandle: any;
	        ghost: {
	            className: any;
	            containerSelector: any;
	            html: any;
	        };
	        handler: {
	            started: any;
	            droppableElement: any;
	            dropped: any;
	            overDroppable: any;
	            outsideDroppable: any;
	            canceled: any;
	        };
	        draggedElement: any;
	    };
	    state: any;
	    element: any;
	    constructor(config: any);
	    register(): () => void;
	    onMouseDown(e: any): void;
	    onMouseUp(e: any): void;
	    onMouseMove(e: any): void;
	    createGhost(): void;
	    deleteGhost(): void;
	    getInitialState(): {
	        moving: boolean;
	        mouseDown: boolean;
	        ghostCreated: boolean;
	        draggedElement: any;
	        droppableElement: any;
	    };
	}
}
declare module "marvelous-aurelia-grid/grid/column" {
	import { Grid } from 'marvelous-aurelia-grid/grid/grid';
	import { AureliaUtils } from 'marvelous-aurelia-core/aureliaUtils';
	import { Column } from 'marvelous-aurelia-grid/grid/models/column';
	export class ColumnViewModel {
	    column: Column;
	    grid: Grid;
	    element: any;
	    aureliaUtils: AureliaUtils;
	    subs: any[];
	    unregisterDraggability: () => void;
	    constructor(element: any, aureliaUtils: AureliaUtils);
	    attached(): void;
	    detached(): void;
	    columnClicked(): void;
	    refreshDraggability(): void;
	    makeColumnDraggable(): () => void;
	}
	export interface IColumnDragAndDropListener {
	    dropArea: string;
	    zIndex?: number;
	    started?: (e: any, el: HTMLElement, column: Column) => void;
	    moved?: (e: any, el: HTMLElement, column: Column) => void;
	    dropped?: (e: any, el: HTMLElement, column: Column) => void;
	    overDroppable?: (e: any, el: HTMLElement, column: Column) => void;
	    outsideDroppable?: (e: any, el: HTMLElement, column: Column) => void;
	    canceled?: (e: any, el: HTMLElement, column: Column) => void;
	}
}
declare module "marvelous-aurelia-grid/grid/gridInternals" {
	import { Grid } from 'marvelous-aurelia-grid/grid/grid';
	import { Column } from 'marvelous-aurelia-grid/grid/models/column';
	import { IColumnDragAndDropListener } from 'marvelous-aurelia-grid/grid/column';
	export class GridInternals {
	    private _grid;
	    columnsDraggabilityEnabled: boolean;
	    loading: boolean;
	    dragAndDropListeners: IColumnDragAndDropListener[];
	    /**
	     * Grid element.
	     */
	    element: HTMLElement;
	    /**
	     * Array of currently visible columns on the main panel.
	     */
	    mainColumns: Array<Column>;
	    private _id;
	    private static _lastId;
	    private _loadingDebounceId;
	    private _pubSub;
	    constructor(_grid: Grid);
	    id: any;
	    makeColumnsDraggable(): void;
	    listenOnDragAndDrop(listener: IColumnDragAndDropListener): void;
	    publish(name: string, payload: any): void;
	    subscribe(name: string, callback: (payload: any) => void): () => void;
	    unsubscribe(name: string, callback: (payload: any) => void): void;
	    createTempContainer(): void;
	    refresh(): any;
	    setIsLoading(loading: any): void;
	    getInstance(fn: Function, explicitDependencies?: any[]): any;
	    /**
	     * Creates new instantion of Fn using 'inject' property and provided instances.
	     * If type is in the explicitDependencies then it will be injected.
	     */
	    private _instantiate(fn, explicitDependencies);
	    /**
	     * Gets instances injectable to components.
	     */
	    getInstancesOfGridServices(): any[];
	}
}
declare module "marvelous-aurelia-grid/grid/grid" {
	import { Container } from 'aurelia-dependency-injection';
	import { OptionsReaderFactory, OptionsReader } from 'marvelous-aurelia-core/optionsReader';
	import { AureliaUtils } from 'marvelous-aurelia-core/aureliaUtils';
	import { GridRenderer } from 'marvelous-aurelia-grid/grid/gridRenderer';
	import { DataSource } from 'marvelous-aurelia-grid/grid/dataSource/dataSource';
	import { ComponentsArray } from 'marvelous-aurelia-grid/grid/pluginability';
	import { DOMSettingsReader } from 'marvelous-aurelia-grid/domSettingsReader';
	import { GridInternals } from 'marvelous-aurelia-grid/grid/gridInternals';
	import { GridOptions } from 'marvelous-aurelia-grid/grid/gridOptions';
	export class Grid {
	    codeDefinedOptions: any;
	    viewModel: any;
	    container: Container;
	    options: GridOptions;
	    initialized: boolean;
	    components: ComponentsArray;
	    dataSource: DataSource;
	    aureliaUtils: AureliaUtils;
	    domSettingsReader: DOMSettingsReader;
	    private _optionsReaderFactory;
	    optionsReader: OptionsReader;
	    renderer: GridRenderer;
	    internals: GridInternals;
	    subs: (() => void)[];
	    private _domOptionsElement;
	    private _stateContainerName;
	    constructor(element: HTMLElement, components: ComponentsArray, aureliaUtils: AureliaUtils, renderer: GridRenderer, domSettingsReader: DOMSettingsReader, optionsReaderFactory: OptionsReaderFactory, container: Container);
	    bind(executionContext: any): void;
	    attached(): void;
	    detached(): void;
	    /**
	     * Subscribes for event with given name.
	     * @param name Name of the event.
	     */
	    subscribe(name: string, callback: (payload: any) => void): void;
	    /**
	     * Refreshes the grid.
	     */
	    refresh(): void;
	    /**
	     * Loads the state of a grid using provided serialized value.
	     */
	    loadState(serializedState: string): void;
	    /**
	     * Saves the current state of a grid, e.g. groupings, order of columns and so on.
	     * @returns String which is loadable by loadState method
	     */
	    saveState(): string;
	    private _saveMainGridState(state);
	    private _loadMainGridState(state);
	}
}
declare module "marvelous-aurelia-grid/grid/models/column" {
	import { GridInternals } from 'marvelous-aurelia-grid/grid/gridInternals';
	export class Column {
	    id: any;
	    heading: string;
	    field: string;
	    width: string;
	    hidden: any;
	    other: any;
	    template: string;
	    headerClass: string;
	    owner: Function;
	    oldOwner: any;
	    /**
	     * State of column. Used by components to store some infromation about
	     * column, e.g. sort order if sorted.
	     */
	    state: any;
	    private _uniqueId;
	    private _gridInternals;
	    constructor(id: any, attributes: any, template: string, gridInternals: GridInternals);
	    validate(): void;
	    addClass(name: any): void;
	    removeClass(name: any): void;
	    hasClass(name: any): boolean;
	    setOwner(newOwner: any): boolean;
	    /**
	     * Provides unique column id. If declared as "explicit-id" on the column
	     * declaration then this value will be used.
	     * Otherwise unique id is a combination of field, heading and template.
	     * In case if these 2 wouldn't be unique then it is required to use "explicit-id".
	     */
	    getUniqueId(): string;
	}
}
declare module "marvelous-aurelia-grid/grid/gridOptions" {
	import { Column } from 'marvelous-aurelia-grid/grid/models/column';
	import { GridInternals } from 'marvelous-aurelia-grid/grid/gridInternals';
	import { DOMSettingsReader } from 'marvelous-aurelia-grid/domSettingsReader';
	import { OptionsReader } from 'marvelous-aurelia-core/optionsReader';
	export class GridOptions {
	    private _gridInternals;
	    reader: OptionsReader;
	    domBased: DOMSettingsReader;
	    /**
	     * Array of all defined columns.
	     * NOTE: code based defined columns has higher priority.
	     */
	    columns: Column[];
	    /**
	     * All code based defined options.
	     */
	    codeBased: any;
	    constructor(_gridInternals: GridInternals, reader: OptionsReader, domBased: DOMSettingsReader, codeBasedOptions: any);
	    validate(): void;
	    private _parseDomBasedOptions();
	    private _parseCodeBasedOptions(options);
	    getColumnById(id: any): Column;
	    getColumnByUniqueId(uniqueId: string): Column;
	    getColumnByElement(element: Element): Column;
	}
}
declare module "marvelous-aurelia-grid/grid/components/pagination" {
	import { DataSource } from 'marvelous-aurelia-grid/grid/dataSource/dataSource';
	import { AureliaUtils } from 'marvelous-aurelia-core/aureliaUtils';
	import { GridOptions } from 'marvelous-aurelia-grid/grid/gridOptions';
	import { GridInternals } from 'marvelous-aurelia-grid/grid/gridInternals';
	import { GridComponent } from 'marvelous-aurelia-grid/grid/pluginability';
	export class PaginationComponent extends GridComponent {
	    private _dataSource;
	    private _aureliaUtils;
	    private _gridInternals;
	    private _gridOptions;
	    /**
	     * Page items.
	     */
	    items: number[];
	    /**
	     * Currently selected page.
	     */
	    selected: number;
	    /**
	     * Total number of items in data source.
	     */
	    total: number;
	    /**
	     * Last page. Might be not visible on the UI if is out of range.
	     */
	    lastPage: number;
	    buttons: {
	        prev: boolean;
	        next: boolean;
	        leftSideOutOfRange: boolean;
	        rightSideOutOfRange: boolean;
	    };
	    options: IPaginationOptions;
	    defaultOptions: IPaginationOptions;
	    constructor(_dataSource: DataSource, _aureliaUtils: AureliaUtils, _gridInternals: GridInternals, _gridOptions: GridOptions);
	    start(): void;
	    changePage(newPage: any): void;
	    selectFirst(): void;
	    selectLast(): void;
	    selectNext(): void;
	    selectPrev(): void;
	    private _onDataRead(params);
	    private _onDataReceived(e);
	    private _onPageSizeChanged(newVal, oldVal);
	    createOptions(): IPaginationOptions;
	}
	export interface IPaginationOptions {
	    size?: number;
	    all?: boolean | number[];
	    range?: number;
	}
}
declare module "marvelous-aurelia-grid/grid/components/filter-row" {
	import { GridComponent } from 'marvelous-aurelia-grid/grid/pluginability';
	import { DataSource } from 'marvelous-aurelia-grid/grid/dataSource/dataSource';
	import { GridInternals } from 'marvelous-aurelia-grid/grid/gridInternals';
	import { GridOptions } from 'marvelous-aurelia-grid/grid/gridOptions';
	import { Column } from 'marvelous-aurelia-grid/grid/models/column';
	import { AureliaUtils } from 'marvelous-aurelia-core/aureliaUtils';
	export class FilterRowComponent extends GridComponent {
	    private _dataSource;
	    private _aureliaUtils;
	    private _gridInternals;
	    private _gridOptions;
	    private _column;
	    options: {} | boolean;
	    type: string;
	    nullable: boolean;
	    selectedCompareOperator: ICompareOperator;
	    compareOperators: ICompareOperator[];
	    compareText: string;
	    allCompareOperators: {
	        [key: string]: ICompareOperator;
	    };
	    private _lastSubmittedCompareOperator;
	    private _lastSubmittedCompareText;
	    private _prevCompareOperator;
	    constructor(_dataSource: DataSource, _aureliaUtils: AureliaUtils, _gridInternals: GridInternals, _gridOptions: GridOptions, _column: Column);
	    start(): void;
	    saveState(state: any): void;
	    loadState(state: any): void;
	    selectCompareOperator(name: string): void;
	    private _onDataRead(params);
	    private _getCompareOperators(type, nullable);
	    refresh(): void;
	    private _selectedCompareOperatorChanged(newOp, oldOp);
	    private _onCompareTextWrite(event);
	    createOptions(): {};
	}
	export interface IFilterRowState {
	    selectedCompareOperator: any;
	    compareText: string;
	}
	export interface ICompareOperator {
	    name: string;
	    value: string;
	    /**
	     * Indicate that compare operator needs text to compare.
	     * E.g. `Equal` needs, but `IsTrue` doesn't.
	     */
	    textRequired: boolean;
	}
}
declare module "marvelous-aurelia-grid/grid/components/sorting" {
	import { Column } from 'marvelous-aurelia-grid/grid/models/column';
	import { GridComponent } from 'marvelous-aurelia-grid/grid/pluginability';
	import { GridOptions } from 'marvelous-aurelia-grid/grid/gridOptions';
	import { GridInternals } from 'marvelous-aurelia-grid/grid/gridInternals';
	import { DataSource } from 'marvelous-aurelia-grid/grid/dataSource/dataSource';
	export class SortingComponent extends GridComponent {
	    private _gridOptions;
	    private _gridInternals;
	    private _dataSource;
	    options: ISortingOptions;
	    sortOrder: number;
	    defaultOptions: {
	        mode: string;
	    };
	    buckets: ISortingOwnedBucket[];
	    subs: any[];
	    constructor(_gridOptions: GridOptions, _gridInternals: GridInternals, _dataSource: DataSource);
	    start(): void;
	    private _onDataRead(params);
	    saveState(state: any): void;
	    loadState(state: ISortingState): void;
	    private _onColumnClicked(column);
	    addBucket(owner: Function, order: number, options: ISortingBucketOptions): SortingBucket;
	    getBucketByColumn(column: Column): SortingBucket;
	    getBucketByOwner(owner: Function): SortingBucket;
	    createOptions(): any;
	}
	/**
	 * General remarks:
	 * Sorting component could be a lot simpler if it would be used only by
	 * the end-user. Unfortunatelly it is also used internally by grouping component
	 * which requires to sort columns in the seperation of main panel.
	 * Grouped columns should always be sorted first and have 'multiple' mode.
	 * That's why buckets are implemented.
	 */
	export class SortingBucket {
	    options: ISortingBucketOptions;
	    columns: Column[];
	    constructor(options: ISortingBucketOptions);
	    sortBy(column: Column, order: number, direction: string): void;
	    nextSortingDirectionOn(column: Column): void;
	    hasSortingApplied(column: Column): boolean;
	    getSortingDirection(column: Column): string;
	    addColumn(column: Column): void;
	    removeColumn(column: Column): void;
	    hasColumn(column: Column): boolean;
	    private _clearColumn(column);
	    private _manageColumnClasses(column, direction);
	}
	export interface ISortingOwnedBucket {
	    owner: Function;
	    bucket: SortingBucket;
	    order: number;
	}
	export interface IColumnWithSorting {
	    column: Column;
	    direction?: string;
	}
	export interface ISortingState {
	    columns: ISortingColumnState[];
	}
	export interface ISortingColumnState {
	    id: string;
	    direction: string;
	}
	export interface ISortingOptions {
	    mode: string;
	}
	export interface ISortingBucketOptions {
	    mode: string;
	    alwaysSorted: boolean;
	}
}
declare module "marvelous-aurelia-grid/grid/components/grouping" {
	import { Column, GridComponent, ComponentsArray, GridOptions, GridInternals } from 'marvelous-aurelia-grid/grid/all';
	export class GroupingComponent extends GridComponent {
	    private _components;
	    private _gridOptions;
	    private _gridInternals;
	    private _selector;
	    columns: Column[];
	    private _dragAndDrop;
	    constructor(_components: ComponentsArray, _gridOptions: GridOptions, _gridInternals: GridInternals);
	    start(): void;
	    saveState(state: any): void;
	    loadState(state: IGroupingState): void;
	    private _listenOnDragAndDrop();
	    private _onMoved(e, el, column);
	    private _onDropped(e, el, column);
	    private _setColumns(columns);
	    private _getSortingBucket();
	    private _clearMarkers();
	    private _insertMarker();
	    private _clear();
	    private _getClosestColumn(e);
	    private _listenOnColumnOwnerChanged();
	    createOptions(): {};
	}
	export interface IGroupingState {
	    columns: IGroupingColumnState[];
	}
	export interface IGroupingColumnState {
	    id: string;
	    direction: string;
	}
}
declare module "marvelous-aurelia-grid/grid/components/query-language" {
	import { GridComponent, GridOptions, GridInternals, DataSource, ComponentsArray } from 'marvelous-aurelia-grid/grid/all';
	import { IQueryLanguageOptions, QueryLanguage } from 'marvelous-aurelia-query-language';
	export class QueryLanguageComponent extends GridComponent {
	    private _gridOptions;
	    private _gridInternals;
	    private _dataSource;
	    private _components;
	    editorOptions: IQueryLanguageOptions;
	    queryLanguage: QueryLanguage;
	    constructor(_gridOptions: GridOptions, _gridInternals: GridInternals, _dataSource: DataSource, _components: ComponentsArray);
	    start(): void;
	    saveState(state: any): void;
	    loadState(state: any): void;
	    private _onDataRead(params);
	    refresh(): any;
	    createOptions(): any;
	}
}
declare module "marvelous-aurelia-grid/grid/components/column-chooser" {
	import { Column, GridComponent, GridInternals, GridOptions, ComponentsArray } from 'marvelous-aurelia-grid/grid/all';
	export class ColumnChooserComponent extends GridComponent {
	    private _gridInternals;
	    private _gridOptions;
	    private _components;
	    options: IColumnChooserOptions;
	    hidden: boolean;
	    overDroppable: boolean;
	    columns: Column[];
	    selector: {
	        popUp: string;
	        headings: string;
	    };
	    defaultOptions: IColumnChooserOptions;
	    constructor(_gridInternals: GridInternals, _gridOptions: GridOptions, _components: ComponentsArray);
	    start(): void;
	    attached(): void;
	    saveState(state: any): void;
	    loadState(state: any): void;
	    togglePopUp(): void;
	    private _initToolbox();
	    private _initColumns();
	    private _initPopUpPosition();
	    private _listenOnDragAndDrop();
	    private _listenOnColumnOwnerChanged();
	    createOptions(): IColumnChooserOptions | boolean;
	}
	export interface IColumnChooserOptions {
	    autoToolboxInit: boolean;
	}
}
declare module "marvelous-aurelia-grid/grid/components/toolbox" {
	import { GridComponent, GridOptions } from 'marvelous-aurelia-grid/grid/all';
	export class ToolboxComponent extends GridComponent {
	    private _gridOptions;
	    buttons: any[];
	    constructor(_gridOptions: GridOptions);
	    addButton(button: any): void;
	    createOptions(): {};
	}
}
declare module "marvelous-aurelia-grid/grid/components/column-reordering" {
	import { GridComponent } from 'marvelous-aurelia-grid/grid/pluginability';
	import { GridOptions } from 'marvelous-aurelia-grid/grid/gridOptions';
	import { GridInternals } from 'marvelous-aurelia-grid/grid/gridInternals';
	export class ColumnReorderingComponent extends GridComponent {
	    private _gridOptions;
	    private _gridInternals;
	    hoveredColumn: Element;
	    side: string;
	    oldSide: string;
	    markers: HTMLElement[];
	    selector: {
	        dropArea: string;
	        columns: string;
	    };
	    constructor(_gridOptions: GridOptions, _gridInternals: GridInternals);
	    start(): void;
	    private _onMoved(e, el, column);
	    private _onDropped(e, el, column);
	    private _clearMarkers();
	    private _insertMarker();
	    private _clear();
	    createOptions(): {};
	}
}
declare module "marvelous-aurelia-grid/grid/interfaces" {
	export interface IDataSourceResult {
	    data: any[];
	    total: number;
	}
}
declare module "marvelous-aurelia-grid/grid/all" {
	export * from 'marvelous-aurelia-grid/grid/components/pagination';
	export * from 'marvelous-aurelia-grid/grid/components/filter-row';
	export * from 'marvelous-aurelia-grid/grid/components/sorting';
	export * from 'marvelous-aurelia-grid/grid/components/grouping';
	export * from 'marvelous-aurelia-grid/grid/components/query-language';
	export * from 'marvelous-aurelia-grid/grid/components/column-chooser';
	export * from 'marvelous-aurelia-grid/grid/components/toolbox';
	export * from 'marvelous-aurelia-grid/grid/components/column-reordering';
	export * from 'marvelous-aurelia-grid/grid/dataSource/dataSource';
	export * from 'marvelous-aurelia-grid/grid/dataSource/dataSourceManager';
	export * from 'marvelous-aurelia-grid/grid/dataSource/clientSideDataSource';
	export * from 'marvelous-aurelia-grid/grid/dataSource/serverSideDataSource';
	export * from 'marvelous-aurelia-grid/grid/models/column';
	export * from 'marvelous-aurelia-grid/grid/constants';
	export * from 'marvelous-aurelia-grid/grid/column';
	export * from 'marvelous-aurelia-grid/grid/grid';
	export * from 'marvelous-aurelia-grid/grid/gridRenderer';
	export * from 'marvelous-aurelia-grid/grid/interfaces';
	export * from 'marvelous-aurelia-grid/grid/pluginability';
	export * from 'marvelous-aurelia-grid/grid/gridInternals';
	export * from 'marvelous-aurelia-grid/grid/gridOptions';
}
declare module "marvelous-aurelia-grid/grid/dataSource/dataSource" {
	import { Grid, IDataSourceResult } from 'marvelous-aurelia-grid/grid/all';
	export class DataSource {
	    options: any;
	    grid: Grid;
	    result: IDataSourceResult;
	    subscribers: {};
	    lastReadId: number;
	    lastParams: any;
	    rawResult: any;
	    constructor(grid: Grid, options: any);
	    read(): any;
	    setNewResult(rawResult: any, params: any): void;
	    subscribe(eventName: any, callback: any): () => void;
	    publish(eventName: any, payload: any): void;
	    transformResult(rawResult: any, params: any): IDataSourceResult;
	    addItem(item: any): void;
	    removeItem(item: any): void;
	    /**
	     * Invoked right after data arrival.
	     * @param result Contains raw data from read method.
	     */
	    onRawResultReceived(rawResult: any): void;
	    /**
	     * Invoked right before reading data, but after parameters creation.
	     * This method should be used in order to manipulate parameters, e.g.
	     * by using some sort of serialization.
	     */
	    beforeRead(params: any): any;
	}
	export interface IDataReceivedEvent {
	    result: IDataSourceResult;
	    rawResult: any;
	}
	export interface IReadContext {
	    params: any;
	    /**
	     * Creates an url with Grid params attached to query string, so that
	     * server side could properly handle request.
	     */
	    url: (baseUrl: string) => string;
	}
}
declare module "marvelous-aurelia-grid" {
	export function configure(aurelia: any): void;
	export { IReadContext } from 'marvelous-aurelia-grid/grid/dataSource/dataSource';
	export * from 'marvelous-aurelia-grid/grid/constants';
	export * from 'marvelous-aurelia-grid/grid/column';
	export * from 'marvelous-aurelia-grid/grid/grid';
	export * from 'marvelous-aurelia-grid/grid/gridRenderer';
	export * from 'marvelous-aurelia-grid/grid/interfaces';
	export * from 'marvelous-aurelia-grid/grid/pluginability';
	export * from 'marvelous-aurelia-grid/grid/gridInternals';
	export * from 'marvelous-aurelia-grid/grid/gridOptions';
}
declare module "marvelous-aurelia-grid/dragAndDrop/draggable" {
	export class DraggableCustomAttribute {
	    private _element;
	    subs: (() => void)[];
	    constructor(_element: HTMLElement);
	    attached(): void;
	    detached(): void;
	}
}
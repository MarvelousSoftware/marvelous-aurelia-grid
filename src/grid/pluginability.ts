import {inject, transient, Container} from 'aurelia-dependency-injection';
import {Utils} from 'marvelous-aurelia-core/utils';
import {componentLayout, componentPosition} from './constants';
import {PaginationComponent, FilterRowComponent, SortingComponent, GroupingComponent, QueryLanguageComponent, ColumnChooserComponent,
ToolboxComponent, ColumnReorderingComponent, SelectionComponent, Column} from './all';
import {Grid} from './grid';

// TODO: allow to create a global ComponentRegistration in the plugin configuration

@transient()
@inject(Container)
export class ComponentsArray extends Array<ComponentRegistration<any>> {
  container;
  grid: Grid;
  componentsToBeDisplayed = {};

  constructor(container) {
    super();
    this.container = container;
  }

  init(grid: Grid) {
    this.grid = grid;
    
    // stops all components instances on grid detach
    let detached = this.grid.internals.subscribe('Detached', () => {
      this.forEach(x => {
        x.getAllInstances().forEach(i => {
          if (i.stop && i.stop instanceof Function) {
            i.stop();
          }
        })
      });
      detached();
    });
    
    // add user defined components
    // TODO: use OptionsReader so that it could be in the DOM
    let customComponents = this.grid.options.codeBased.components || [];
    customComponents.forEach(x => this.add(x, false));
    
    // add default components
    // these components then internally will specify
    // whether are enabled or disabled
    this.add(new ComponentRegistration({
      name: 'm-filter-row',
      type: FilterRowComponent,
      view: './components/filter-row/filter-row.html',
      position: componentPosition.afterColumns,
      layout: componentLayout.forEachColumn
    }), false);
    this.add(new ComponentRegistration({
      name: 'm-pagination',
      type: PaginationComponent,
      view: './components/pagination/pagination.html',
      position: componentPosition.footer,
      layout: componentLayout.full
    }), false);
    this.add(new ComponentRegistration({
      name: 'm-toolbox',
      type: ToolboxComponent,
      view: './components/toolbox/toolbox.html',
      position: componentPosition.top,
      layout: componentLayout.full
    }), false);
    this.add(new ComponentRegistration({
      name: 'm-grouping',
      type: GroupingComponent,
      view: './components/grouping/grouping.html',
      position: componentPosition.top,
      layout: componentLayout.full
    }), false);
    this.add(new ComponentRegistration({
      name: 'm-query-language',
      type: QueryLanguageComponent,
      view: './components/query-language/query-language.html',
      position: componentPosition.afterColumns,
      layout: componentLayout.full
    }), false);

    this.add(new ComponentRegistration({
      name: 'm-sorting',
      type: SortingComponent,
      position: componentPosition.background
    }), false);
    this.add(new ComponentRegistration({
      name: 'm-column-chooser',
      type: ColumnChooserComponent,
      view: './components/column-chooser/column-chooser.html',
      position: componentPosition.background
    }), false);
    this.add(new ComponentRegistration({
      name: 'm-column-reordedring',
      type: ColumnReorderingComponent,
      position: componentPosition.background
    }), false);
    this.add(new ComponentRegistration({
      name: 'm-selection',
      type: SelectionComponent,
      position: componentPosition.background
    }));

    this.forEach(x => x._load());
  }

  add(component: ComponentRegistration<any>, autoLoad: boolean = true) {
    if (!(component instanceof ComponentRegistration)) {
      throw new Error('Given component has to be an instance of Component type.');
    }

    this._checkNameUniqueness(component.name);

    component._init(this.grid, this.container, () => { this.refreshComponentsToBeDisplayed() });
    this.push(component);

    if (autoLoad) {
      component._load();
    }
  }
  
  private _checkNameUniqueness(name: string) {
    if (this.filter(x => x.name == name).length > 0) {
      throw new Error(`Component named as '${name}' is already defined.`);
    }
  }
  
  get<T extends GridComponent>(type: {new(...args): T}): ComponentRegistration<T> {
    let components = this.filter(x => x.type === type);
    if (!components.length) {
      return undefined;
    }
    return components[0];
  }

  getAllInstances(): IComponentInstance<any>[] {
    let instances: IComponentInstance<any>[] = [];

    this.forEach(component => {
      if (component.instance) {
        instances.push({
          component: component,
          instance: component.instance
        });
      }
      if (component.instances) {
        component.instances.forEach(x => {
          instances.push({
            component: component,
            instance: x
          });
        });
      }
    });

    return instances;
  }
  
  /**
   * Invokes action for each instance with defined given method.
   */
  forEachInstanceWithMethod(method: string, action: (instance: IComponentInstance<any>) => void) {
    this.getAllInstances().forEach(x => {
      if (x.instance && x.instance[method] instanceof Function) {
        action(x);
      }
    });
  }

  refreshComponentsToBeDisplayed() {
    this.componentsToBeDisplayed = {};

    // only enabled and with attached view are displayed on the screen
    this.filter(x => x.enabled !== false && x.view)
      .forEach(x => {
        this.componentsToBeDisplayed[x.position] = this.componentsToBeDisplayed[x.position] || [];
        this.componentsToBeDisplayed[x.position].push(x);
      });
  }
}

export interface IComponentRegistrationDefinition {
  /**
   * Name of the component.
   */
  name: string;
  
  /**
   * Component's constructor function.
   */
  type: Function, 
  
  /**
   * Place where component will be rendered. Available values:
   * - 'top'
   * - 'afterColumns'
   * - 'footer'
   * - 'background'
   * 
   * Background renders underneath the grid, but only if `view` is provided.
   */
  position: string,
  
  /**
   * Absolute path to the view. Not required if position is 'background'.
   */
  view?: string,
  
  /**
   * Controls the component appearance. Available values:
   * 'full' - full row is being used by the component 
   * 'forEachColumn' - renders a separate cell for each column
   */
  layout?: string
}

export class ComponentRegistration<T extends GridComponent> {
  type: Function = undefined;
  position = undefined;
  view = undefined;
  instance: T = undefined;
  instances: Map<Column, T> = undefined;
  layout = undefined;
  //order;

  name: string = undefined;
  enabled = false;

  private _onEnabledChanged: Function = Utils.noop;
  private _grid: Grid;
  private _container: Container;

  private _loaded = false;

  constructor(component: IComponentRegistrationDefinition) {
    if (!component.name) {
      throw new Error(`Component needs to declare its own name.`);
    }

    let missingField = false;
    if (component.position == componentPosition.background) {
      if (Utils.allDefined(component, 'type') === false) {
        missingField = true;
      }
    }
    else if (Utils.allDefined(component, 'type', 'position', 'view') === false) {
      missingField = true;
    }

    if (missingField) {
      throw new Error('Component is missing at least one required field.');
    }

    for (let variable in this) {
      if (component[variable] !== undefined) {
        this[variable] = component[variable];
      }
    }

    if (component.position != componentPosition.background) {
      // default component layout is `full`, but only if component is not the background one
      this.layout = this.layout || componentLayout.full;
    }
  }

  _init(grid: Grid, container: Container, onEnabledChanged: Function) {
    this._onEnabledChanged = onEnabledChanged || this._onEnabledChanged;
    this._grid = grid;
    this._container = container;
  }

  _load() {
    if (this._loaded) {
      return;
    }
    this._loaded = true;
    this._createInstances();

    switch (this.layout) {
      case componentLayout.forEachColumn:
        this._grid.options.columns.forEach(x => {
          let instance = this.instances.get(x);
          this.enable(false);
        });
        break;
      default:
        let instance = this.instance;
        this.enable(false);
        break;
    }
  }
  
  /**
   * Enables the component.
   */
  enable(force = true) {
    this._ensureLoaded();

    if (this.enabled) {
      return;
    }

    for (let instance of this.getAllInstances()) {
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
  }
  
  /**
   * Disables the component.
   */
  disable() {
    this._ensureLoaded();

    if (this.enabled == false) {
      return;
    }

    for (let instance of this.getAllInstances()) {
      if (instance.disable && instance.disable instanceof Function) {
        instance.disable();
        this.enabled = false;
        this._onEnabledChanged();
      }
    }
  }
  
  /**
   * Gets all instances associated with current component.
   */
  getAllInstances(): GridComponent[] {
    let instances = [];

    if (this.instance) {
      instances.push(this.instance);
    } else if (this.instances) {
      this.instances.forEach(instance => instances.push(instance));
    }

    return instances;
  }

  private _ensureLoaded() {
    if (this._loaded) {
      return;
    }
    this._load();
  }
  
  /**
   * Creates view models. Depending on the layout it may create a single view model
   * or view models for each column.
   */
  private _createInstances() {
    switch (this.layout) {
      case componentLayout.forEachColumn:
        // Creates instance for each column using column object reference as a key.
        this.instances = new Map<Column, T>();
        this._grid.options.columns.forEach(x => this.instances.set(x, this._resolveInstance(x)));
        break;
      default:
        this.instance = this._resolveInstance();
        break;
    }
  }

  private _resolveInstance(column: Column = undefined) {
    if (column) {
      return this._grid.internals.getInstance(this.type, [column]);
    }
    return this._grid.internals.getInstance(this.type);
  }
}

export class GridComponent {
  options: any;
  subs: (() => void)[] = [];
  
  /**
   * Creates options and starts the component with `start` method.
   * @returns boolean
   */
  tryEnable(): boolean {
    this.options = this.createOptions();
    if (!this.options) {
      return false;
    }

    this.start();
    return true;
  }
  
  /**
   * Called if component is about to disable.
   */
  disable() {
    this.stop();
  }
  
  /**
   * Starts the component. Uses already created options if needed.
   */
  start() {
  }
  
  /**
   * Unregisters subs. Called on grid detach.
   */
  stop() {
    if (this.subs) {
      this.subs.forEach(sub => sub());
      this.subs = [];
    }
  }
  
  /**
   * In derived class creates component specific options. If `enable` method is not overriden
   * then this method has to return object castable to `true` in order to make component enabled. 
   */
  createOptions(): any {
    return {};
  }
  
  /**
   * Saves the current state of a component so that it could be loaded some time in the future.
   * This method should attach properties to the `state` parameter.
   */
  saveState(state: any): void {
  }
  
  /**
   * Loads state.
   */
  loadState(state: any): void {
  }
}

export interface IComponentInstance<T extends GridComponent> {
  component: ComponentRegistration<T>,
  instance: GridComponent;
}
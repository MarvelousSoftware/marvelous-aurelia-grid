import {computedFrom} from 'aurelia-binding';
import {customElement, bindable, processContent, noView} from 'aurelia-templating';
import {inject, Container} from 'aurelia-dependency-injection';
import {DomUtils} from 'marvelous-aurelia-core/utils';
import {OptionsReaderFactory, OptionsReader} from 'marvelous-aurelia-core/optionsReader';
import {AureliaUtils} from 'marvelous-aurelia-core/aureliaUtils';
import {ComponentRegistration} from './pluginability';
import {GridRenderer} from './gridRenderer';
import {Column} from './models/column';
import {DataSourceManager} from './dataSource/dataSourceManager';
import {DataSource} from './dataSource/dataSource';
import {ComponentsArray} from './pluginability'; 
import {DOMSettingsReader} from '../domSettingsReader';
import {GridInternals} from './gridInternals';
import {GridOptions} from './gridOptions';

@customElement('m-grid')
@processContent(false)
@inject(Element, ComponentsArray, AureliaUtils, GridRenderer, DOMSettingsReader, OptionsReaderFactory, Container)
export class Grid {
  @bindable({attribute:'options'}) codeDefinedOptions;
  viewModel: any;
  
  container: Container;
  
  options: GridOptions;
  initialized = false;

  components: ComponentsArray;
  dataSource: DataSource;
  aureliaUtils: AureliaUtils;
  
  domSettingsReader: DOMSettingsReader;
  private _optionsReaderFactory: OptionsReaderFactory;
  optionsReader: OptionsReader;
  
  renderer: GridRenderer;
  internals: GridInternals;
  
  subs: (()=>void)[] = [];

  private _domOptionsElement: HTMLElement;
  private _stateContainerName = '__m-grid__';

  constructor(element: HTMLElement, components: ComponentsArray, aureliaUtils: AureliaUtils, renderer: GridRenderer, 
  domSettingsReader: DOMSettingsReader, optionsReaderFactory: OptionsReaderFactory, container: Container) {
    this._domOptionsElement = <HTMLElement>element.cloneNode(true);
    this.components = components;
    this.aureliaUtils = aureliaUtils;
    this.domSettingsReader = domSettingsReader;
    this._optionsReaderFactory = optionsReaderFactory;
    this.container = container;

    this.renderer = renderer;
    
    this.internals = new GridInternals(this);
    this.internals.element = element;
    
    renderer.init(this);
    
    // gets rid of options defined via dom
    // these options are already copied anyway
    DomUtils.clearInnerHtml(element);
  }

  bind(executionContext) {
    this.viewModel = executionContext;
    this.domSettingsReader.init(this.viewModel, this._domOptionsElement);
    
    this.optionsReader = this._optionsReaderFactory.create(this.viewModel, this._domOptionsElement, this.codeDefinedOptions);
    this.options = new GridOptions(this.internals, this.optionsReader, this.domSettingsReader, this.codeDefinedOptions);
    this.options.validate();
    this.dataSource = new DataSourceManager(this).createDataSource();

    this.internals.mainColumns = this.options.columns.filter(x => !x.hidden);
    this.components.init(this);

    this.subs.push(this.aureliaUtils.observe(this.internals, 'mainColumns', () => this.renderer.render()));
  }

  attached() {
    this.internals.createTempContainer();

    this.subs.push(this.dataSource.subscribe('DataRead', params => this.internals.setIsLoading(true)));
    this.subs.push(this.dataSource.subscribe('DataReceived', e => {      
      this.internals.setIsLoading(false);
      this.initialized = true;
      this.renderer.render(); 
    }));
    this.subs.push(this.dataSource.subscribe('DataReadError', () => this.internals.setIsLoading(false)));
    this.internals.refresh().then(() => {}, () => this.initialized = true);
  }

  detached() {
    this.internals.publish('Detached', {});    
    
    this.subs.forEach(sub => sub());
    this.subs = [];
  }
  
  /**
   * Subscribes for event with given name.
   * @param name Name of the event.
   */
  subscribe(name: string, callback: (payload:any)=>void) {
    this.internals.subscribe(name, callback);
  }
  
  /**
   * Refreshes the grid.
   */
  refresh() {
    this.internals.refresh();
  }
  
  /**
   * Loads the state of a grid using provided serialized value.
   */
  loadState(serializedState: string) {
    let state = JSON.parse(serializedState);
    this.components.forEachInstanceWithMethod('loadState', x => {
      let name = x.component.name;
      x.instance.loadState(state[name] || {});
    });
    
    // beside components main grid has state as well
    this._loadMainGridState(state[this._stateContainerName] || {});
    this.internals.refresh();
  }
  
  /**
   * Saves the current state of a grid, e.g. groupings, order of columns and so on.
   * @returns String which is loadable by loadState method
   */
  saveState(): string {
    let state = {};
    
    this.components.forEachInstanceWithMethod('saveState', x => {
      let name = x.component.name;
      state[name] = state[name] || {};
      x.instance.saveState(state[name]);
    });
    
    // main grid has state as well
    let name = this._stateContainerName;
    state[name] = state[name] || {};
    this._saveMainGridState(state[name]);
    return JSON.stringify(state);
  }
  
  private _saveMainGridState(state) {
    state.columns = this.internals.mainColumns.map(x => x.getUniqueId());
  }
  
  private _loadMainGridState(state) {
    this.internals.mainColumns = state.columns.map(x => {
      let column = this.options.getColumnByUniqueId(x);
      column.setOwner(Grid);
      return column;
    });
  }
}
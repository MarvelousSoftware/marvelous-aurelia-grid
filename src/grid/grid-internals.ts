import {Utils} from 'marvelous-aurelia-core/utils';
import {PubSub} from 'marvelous-aurelia-core/pubsub';
import {Grid} from './grid';
import {Column} from './models/column';
import {IColumnDragAndDropListener} from './column';
import {GridRenderer} from './grid-renderer';

export class GridInternals {
  columnsDraggabilityEnabled: boolean = false;
  loading: boolean;
  dragAndDropListeners: IColumnDragAndDropListener[] = [];
  
  /**
   * Grid element.
   */
  element: HTMLElement;
  
  /**
   * Array of currently visible columns on the main panel.
   */
  mainColumns: Array<Column> = [];
  
  private _id = undefined;
  private static _lastId = 0;
  private _loadingDebounceId: number;
  private _pubSub = new PubSub();
  
  constructor(private _grid: Grid) { 
    this._id = ++GridInternals._lastId;
  }
  
  get id() {
    return this._id;
  }
  
  get renderer(): GridRenderer {
    return this._grid.renderer;
  }
  
  makeColumnsDraggable() {
    this.columnsDraggabilityEnabled = true;
  }

  listenOnDragAndDrop(listener: IColumnDragAndDropListener) {
    if(!listener.dropArea) {
      throw new Error('Drop area has to be defined.');
    }

    listener.started = listener.started || Utils.noop;
    listener.moved = listener.moved || Utils.noop;
    listener.dropped = listener.dropped || Utils.noop;
    listener.overDroppable = listener.overDroppable || Utils.noop;
    listener.outsideDroppable = listener.outsideDroppable || Utils.noop;
    listener.canceled = listener.canceled || Utils.noop;

    this.makeColumnsDraggable();
    this.dragAndDropListeners.push(listener);
  }
  
  publish(name: string, payload: any) {
    return this._pubSub.publish(name, payload);
  }

  subscribe(name: string, callback: (payload:any)=>void) {
    return this._pubSub.subscribe(name, callback);
  }
  
  unsubscribe(name: string, callback: (payload:any)=>void) {
    return this._pubSub.unsubscribe(name, callback);
  }

  createTempContainer() {
    let container = document.body.querySelector('div.m-grid-temp-container');
    if(container) {
      return;
    }    
    
    let el = document.createElement('div');
    el.classList.add('m-grid-temp-container');
    document.body.appendChild(el);
  }

  refresh() {
    return this._grid.dataSource.read();
	}

  setIsLoading(loading) {
    if(this._loadingDebounceId) {
      clearTimeout(this._loadingDebounceId);
    }

    if(!loading) {
      this.loading = loading;
      return;
    }

    this._loadingDebounceId = setTimeout(() => {
      this.loading = loading;
    }, this._grid.dataSource.options.debounce);
  }
  
  getInstance(fn: Function, explicitDependencies?: any[]) {
    explicitDependencies = explicitDependencies || [];
    
    let dependencies = this.getInstancesOfGridServices();
    explicitDependencies.forEach(x => dependencies.push(x))   
    
    return this._instantiate(fn, dependencies);
  }
  
  /**
   * Creates new instantion of Fn using 'inject' property and provided instances.
   * If type is in the explicitDependencies then it will be injected. 
   */
  private _instantiate(fn: Function, explicitDependencies: any[]): any {
    let dependencies = (<any>fn).inject || [];
    let i = dependencies.length;
    let args = new Array(i);

    while (i--) {
      let dep = dependencies[i];
      let found = false;

      if(!dep) {
        throw new Error(`One of the dependencies of '${fn}' is undefined. Make sure there's no circular dependencies.`);
      }

      for (let instance of explicitDependencies) {
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
  }
  
  /**
   * Gets instances injectable to components.
   */
  getInstancesOfGridServices(): any[] {
    let g = this._grid;
    return [g.components, g.dataSource, g.aureliaUtils, g.options, g.internals, g.optionsReader, g.renderer, g];
  }
}
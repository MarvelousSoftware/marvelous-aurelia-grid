import {Container} from 'aurelia-dependency-injection';
import {GridOptions} from '../../grid/gridOptions';
import {GridInternals} from '../../grid/gridInternals';
import {Column} from '../../grid/models/column';
import {IColumnDragAndDropListener} from '../../grid/column';
//import '../mutationObserverShim';
import {initialize} from 'aurelia-pal-browser';
import {DOMSettingsReader} from '../../domSettingsReader';
import {AureliaUtils} from 'marvelous-aurelia-core/aureliaUtils';
import {OptionsReaderFactory} from 'marvelous-aurelia-core/optionsReader';

export class GridTestHelpers {
	container: Container;
  reader: DOMSettingsReader;
  readerFactory: OptionsReaderFactory;
  gridInternals: IGridInternalsMock;
  dataSource: IDataSourceMock;
  aureliaUtils: IAureliaUtilsMock;
	components: IComponentsArrayMock;
	
	private _i = 1;
	
	beforeEach() {
		initialize();
		this.container = new Container();
		this.reader = this.container.get(DOMSettingsReader);
    this.readerFactory = this.container.get(OptionsReaderFactory);
		this.gridInternals = this.createGridInternalsMock();
		this.dataSource = this.createDataSourceMock();
		this.aureliaUtils = this.createAureliaUtilsMock();
		this.components = this.createComponentsMock();
	}
	
	getGridOptions(codeBased: any, domBased: string): GridOptions {
		let settings = document.createElement('settings');
    settings.innerHTML = domBased;    
    this.reader.init({}, settings);
    return new GridOptions(null, this.readerFactory.create({}, settings), this.reader, codeBased);
	}
	
	getColumn(attributes: any) {
    return new Column(this._i++, attributes, '', <any>this.gridInternals);
  }
	
	private createComponentsMock(): IComponentsArrayMock {
		let all = new Map<Function, any>();
		let components: any = {
			get: (component: Function) => {
				if(all.has(component) === false) {
					throw new Error(`Component '${component.name}' not found. Use 'get.for(component, instance)' method to add a new component.`);
				}
				return all.get(component);
			}
		}
		
		components.get.for = (component: Function, instance: any) => {
			all.set(component, instance);
			return this;
		}
		
		return components;
	}
	
	private createGridInternalsMock(): IGridInternalsMock {
		let base = new GridInternals(null);
		
		let internals: any = {
			mainColumns: [],
			refresh: sinon.spy()
		};
		
		internals.subscribe = (event: string, callback: Function) => {
			internals.subscribe.subscribers.push({
				event: event,
				callback: callback
			});
			
			return () => {
				internals.subscribe.subscribers = internals.subscribe.subscribers
					.filter(x => x.callback !== callback && x.event !== event)
			};
		};
		
		internals.subscribe.subscribers = [];
		
		internals.subscribe.emit = (event: string, payload: any) => {
			internals.subscribe.subscribers.forEach(x => {
				if(x.event === event) {
					x.callback(payload);
				}
			});
		}
		
		internals.publish = (name: string, payload: any) => {
			internals.publish.published.push({
				name: name,
				payload: payload
			});
		}
		internals.publish.published = [];
		
		internals.makeColumnsDraggable = sinon.spy();
		
		internals.element = document.createElement('div');
		
		internals.dragAndDropListeners = base.dragAndDropListeners;
		internals.listenOnDragAndDrop = base.listenOnDragAndDrop;
		internals.listenOnDragAndDrop.started = (...params) => { internals.dragAndDropListeners.forEach(x => x.started(...params));	}
		internals.listenOnDragAndDrop.moved = (...params) => { internals.dragAndDropListeners.forEach(x => x.moved(...params));	}
		internals.listenOnDragAndDrop.dropped = (...params) => { internals.dragAndDropListeners.forEach(x => x.dropped(...params));	}
		internals.listenOnDragAndDrop.overDroppable = (...params) => { internals.dragAndDropListeners.forEach(x => x.overDroppable(...params));	}
		internals.listenOnDragAndDrop.outsideDroppable = (...params) => {	internals.dragAndDropListeners.forEach(x => x.outsideDroppable(...params));	}
		internals.listenOnDragAndDrop.canceled = (...params) => {	internals.dragAndDropListeners.forEach(x => x.canceled(...params));	}
			
		return internals;
	}
	
	private createDataSourceMock(): IDataSourceMock {
		let dataSource: any = {};
		
		dataSource.subscribe = (event: string, callback: Function) => {
			dataSource.subscribe.subscribers.push({
				event: event,
				callback: callback
			});
			
			return () => {
				dataSource.subscribe.subscribers = dataSource.subscribe.subscribers
					.filter(x => x.callback !== callback && x.event !== event)
			};
		};
		
		dataSource.subscribe.subscribers = [];
		
		dataSource.subscribe.emit = (event: string, payload: any) => {
			dataSource.subscribe.subscribers.forEach(x => {
				if(x.event === event) {
					x.callback(payload);
				}
			});
		}
		
		return dataSource;
	}
	
	private createAureliaUtilsMock(): IAureliaUtilsMock {
		let aureliaUtils: any = {};
		
		aureliaUtils.observe = (target, property, callback) => {
			aureliaUtils.observe.observers.push({
				target: target,
				property: property,
				callback: callback
			});
			
			return () => {
				aureliaUtils.observe.observers = aureliaUtils.observe.observers
					.filter(x => x.target !== target && x.property !== property && x.callback !== callback)
			};
		};
		
		aureliaUtils.observe.observers = [];
		
		aureliaUtils.observe.emit = (target, property, newVal, oldVal) => {
			aureliaUtils.observe.observers.forEach(x => {
				if(x.target === target && x.property === property) {
					x.callback(newVal, oldVal);
				}
			});
		}
		
		return aureliaUtils;
	}
}

export interface IGridInternalsMock {
	element: HTMLElement;
	mainColumns: Column[];
	
	makeColumnsDraggable: Sinon.SinonSpy;
	refresh: Sinon.SinonSpy;
	publish: ((name: string, payload: any) => void);
	subscribe: ((event: string, callback: Function) => void) & (IGenericSubscribeMock);
	
	dragAndDropListeners: IColumnDragAndDropListener[];
	listenOnDragAndDrop: ((column: IColumnDragAndDropListener)=>void) & IDragAndDropEmitterMock;
}
export interface IDragAndDropEmitterMock {
  started: (e:any, el: HTMLElement, column: Column)=>void;
  moved: (e:any, el: HTMLElement, column: Column)=>void;
  dropped: (e:any, el: HTMLElement, column: Column)=>void;
  overDroppable: (e:any, el: HTMLElement, column: Column)=>void;
  outsideDroppable: (e:any, el: HTMLElement, column: Column)=>void;
  canceled: (e:any, el: HTMLElement, column: Column)=>void;
}

export interface IDataSourceMock {
	subscribe: ((event: string, callback: Function) => void) & (IGenericSubscribeMock);
}

export interface IGenericSubscribeMock {
	subscribers: any[];
	emit: (event: string, payload: any) => void;
}

export interface IGenericPublishMock {
	published: {name: string, payload: any}[];
}

export interface IAureliaUtilsMock {
	observe: ((target: any, property: string, callback: Function) => void) & (IAureliaUtilsObserveMock);
}

export interface IAureliaUtilsObserveMock {
	observers: any[];
	emit: (target: any, property: string, newVal: any, oldVal: any) => void;
}

export interface IComponentsArrayMock {
	get: ((component: Function) => any) & IComponentsGetMock;
}
export interface IComponentsGetMock {
	for: (component: Function, instance: any) => IComponentsGetMock;
}
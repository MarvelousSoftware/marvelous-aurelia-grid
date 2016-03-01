import {customElement, bindable} from 'aurelia-templating';
import {inject} from 'aurelia-dependency-injection';
import {Grid} from './grid';
import {Utils, DomUtils} from 'marvelous-aurelia-core/utils';
import {DraggabilityCore} from '../dragAndDrop/draggabilityCore';
import {AureliaUtils} from 'marvelous-aurelia-core/aureliaUtils';
import {Column} from './models/column';

@customElement('m-grid-column')
@inject(Element, AureliaUtils)
export class ColumnViewModel {
  @bindable column: Column;
  @bindable grid: Grid;

  element;
  aureliaUtils: AureliaUtils;
  subs = [];
  unregisterDraggability = () => {};

  constructor(element, aureliaUtils: AureliaUtils) {
    this.element = element;
    this.aureliaUtils = aureliaUtils;
  }

  attached() {
    this.subs.push(this.aureliaUtils.observe(this.grid.internals, 'columnsDraggabilityEnabled', () => {
      this.refreshDraggability();
    }));

    this.refreshDraggability();
  }

  detached() {
    this.subs.forEach(x => x());
    this.unregisterDraggability();
  }

  columnClicked() {
    this.grid.internals.publish('ColumnClicked', this.column);
  }

  refreshDraggability() {
    if(!this.grid.internals.columnsDraggabilityEnabled) {
      this.unregisterDraggability();
      return;
    }

    this.unregisterDraggability = this.makeColumnDraggable() || this.unregisterDraggability;
  }

  makeColumnDraggable() {
    let column = this.element.querySelector('.m-grid-column');
    let currentListener;

    let isAlreadyDraggable = column.attributes['data-is-draggable'] != null;
    if(isAlreadyDraggable) {
      return;
    }
    column.setAttribute('data-is-draggable', 'true');

    let draggable = new DraggabilityCore({
      isHandle: (el) => {
        if(!el.attributes["data-id"] || el.attributes["data-id"].value !== column.attributes["data-id"].value) {
          return;
        }

        let correctGrid = DomUtils.closest(el, 'M-GRID').au.controller.viewModel.internals.id === this.grid.internals.id;
        return correctGrid;
      },
      ghost: {
        className: 'm-grid-column-ghost',
        containerSelector: '.m-grid-temp-container',
        html: el => el.attributes["data-heading"].value,
      },
      handler: {
        droppableElement: (e, el) => {
          let droppableElement = undefined;
          currentListener = undefined;

          this.grid.internals.dragAndDropListeners.forEach(listener => {
            let possiblyDroppable = this.grid.internals.element.querySelector(listener.dropArea);
            if(!possiblyDroppable || !DomUtils.isVisible(possiblyDroppable)) {
              return true;
            }

            let isOver = DomUtils.isCursorOverElement(possiblyDroppable, e);
            if(isOver && (!currentListener || currentListener.zIndex === undefined || currentListener.zIndex < listener.zIndex)) {
              currentListener = listener;
              droppableElement = possiblyDroppable;
            }
          });

          if(currentListener) {
            currentListener.moved(e, el, this.column);
          }
          return droppableElement;
        },
        dropped: (e, el) => {
          currentListener.dropped(e, el, this.column);
        },
        overDroppable: (e, el) => {
          currentListener.overDroppable(e, el, this.column);
        },
        outsideDroppable: (e, el) => {
          this.grid.internals.dragAndDropListeners.forEach(l => l.outsideDroppable(e, el, this.column));
        },
        canceled: (e, el) => {
          this.grid.internals.dragAndDropListeners.forEach(l => l.canceled(e, el, this.column));
        },
        started: (e, el) => {
          this.grid.internals.dragAndDropListeners.forEach(l => l.started(e, el, this.column));
        }
      }
    });

    return draggable.register();
  }

}

export interface IColumnDragAndDropListener {
  dropArea: string;
  zIndex?: number;
  started?: (e:any, el: HTMLElement, column: Column)=>void;
  moved?: (e:any, el: HTMLElement, column: Column)=>void;
  dropped?: (e:any, el: HTMLElement, column: Column)=>void;
  overDroppable?: (e:any, el: HTMLElement, column: Column)=>void;
  outsideDroppable?: (e:any, el: HTMLElement, column: Column)=>void;
  canceled?: (e:any, el: HTMLElement, column: Column)=>void;
}
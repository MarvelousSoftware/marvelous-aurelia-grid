import {inject} from 'aurelia-dependency-injection';
import {Utils, DomUtils} from 'marvelous-aurelia-core/utils';
import {GridComponent} from '../pluginability';
import {Grid} from '../grid';
import {GridOptions} from '../gridOptions';
import {GridInternals} from '../gridInternals';

// TODO: persist order information in the state

@inject(GridOptions, GridInternals)
export class ColumnReorderingComponent extends GridComponent {
  hoveredColumn: Element;
  side: string;
  oldSide: string;
  markers: HTMLElement[] = [];

  selector = {
    dropArea: '.m-grid .m-grid-headings',
    columns: '.m-grid-headings .m-grid-column'
  }

  constructor(private _gridOptions: GridOptions, private _gridInternals: GridInternals) {
    super();
  }

  start() {
    this._gridInternals.listenOnDragAndDrop({
      dropArea: this.selector.dropArea,
      moved: (e, el, column) => {
        this._onMoved(e, el, column);
      },
      dropped: (e, el, column) => {
        this._onDropped(e, el, column);
      },
      canceled: e => {
        this._clear();
      },
      outsideDroppable: e => {
        this._clear();
      }
    });
  }

  private _onMoved(e, el: Element, column) {
    if(DomUtils.isCursorOverElement(el, e)) {
      // position not changed yet
      this._clear();
      return;
    }

    let columns = this._gridInternals.element.querySelectorAll(this.selector.columns);

    for (let i = 0; i < columns.length; i++) {
      let c = columns[i];
      
      if(DomUtils.isCursorOverElement(c, e)){
        this.hoveredColumn = c;
        break;
      }
    }

    if(!this.hoveredColumn) {
      return;
    }

    let hoveredOffset = DomUtils.offset(this.hoveredColumn);
    if(!hoveredOffset) {
      return;
    }

    this.oldSide = this.side;

    // sets the direction of marker, e.g. (dragging Age column, ^ is the cursor position)
    // First Name | Last Name | Age
    //         ^                    ("right")
    // First Name | Last Name | Age
    //  ^                           ("left")
    this.side = e.pageX < hoveredOffset.left + (this.hoveredColumn.clientWidth / 2) ? 'left' : 'right';

    if(this.side && this.oldSide !== this.side) {
      this._clearMarkers();
      this._insertMarker();
    }
  }

  private _onDropped(e, el, column) {
    if(!this.hoveredColumn || !this.side) {
      return;
    }
    
    if(this._gridOptions.getColumnByElement(this.hoveredColumn) === column) {
      return;
    }
    
    let columns = this._gridInternals.element.querySelectorAll(this.selector.columns);
    let newMainColumns = [];

    let add = c => {
      if(this._gridInternals.mainColumns.indexOf(c) === -1) {
        c.setOwner(Grid);
        this._gridInternals.publish('ColumnOwnerChanged', { column: c });
      }
      newMainColumns.push(c);
    }

    for (let i = 0; i < columns.length; i++) {
      let c = columns[i];
      
      if(c === el) {
        continue;
      }

      if(this.side === "right") {
        add(this._gridOptions.getColumnByElement(c));
      }

      if(c === this.hoveredColumn) {
        add(column);
      }

      if(this.side === "left") {
        add(this._gridOptions.getColumnByElement(c));
      }
    }

    this._gridInternals.mainColumns = newMainColumns;
  }

  private _clearMarkers() {
    for (let marker of this.markers) {
      if(marker.parentNode) {
        marker.parentNode.removeChild(marker);
      }
    }
    this.markers = [];
  }

  private _insertMarker() {
    let div = document.createElement('div');
    if(this.side === 'left') {
      div.setAttribute('class', 'm-grid-marker m-grid-left-marker');
      this.hoveredColumn.appendChild(div);
    }
    if(this.side === 'right') {
      div.setAttribute('class', 'm-grid-marker m-grid-right-marker');
      this.hoveredColumn.insertBefore(div, this.hoveredColumn.firstChild);
    }
    this.markers.push(div);
  }

  private _clear() {
    this._clearMarkers();
    this.hoveredColumn = undefined;
    this.side = undefined;
  }

  createOptions() {
    if(!this._gridOptions.domBased.has('column-reordering') && !this._gridOptions.codeBased.columnReordering) {
      return false;
    }

    return {};
  }
}

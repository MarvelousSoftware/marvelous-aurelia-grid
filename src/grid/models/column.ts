import {Grid} from '../grid';
import {GridInternals} from '../grid-internals';

export class Column {
  id: any = null;
  heading: string = undefined;
  field: string = undefined;
  width: string = undefined;
  hidden = undefined;
  other: any = {};
  template: string;
  headerClass: string = '';
  owner: Function = Grid;
  oldOwner: any = null;
  
  /**
   * State of column. Used by components to store some infromation about
   * column, e.g. sort order if sorted.
   */
  state: any = {};
  
  // TODO: since uniqueId is defined then id is not needed?
  private _uniqueId: string = undefined;
  private _gridInternals: GridInternals;

  constructor(id: any, attributes: any, template: string, gridInternals: GridInternals) {
    this.id = id;
    this._gridInternals = gridInternals;

    for (var variable in this) {
      if(this[variable] === undefined) {
        if(attributes[variable] === '') {
          this[variable] = true;
          continue;
        }
        this[variable] = attributes[variable];
      }
    }

    for (var variable in attributes) {
      if(this[variable] !== undefined) continue;
      if(attributes[variable] === '') {
        this.other[variable] = true;
        continue;
      }
      this.other[variable] = attributes[variable];
    }

    if(this.heading === undefined) {
      this.heading = this.field;
    }

    this._uniqueId = attributes['explicit-id'];
    this.template = template;
    this.validate();
  }

  validate() {
    if(this.field) {
      if(this.field.indexOf(' ') !== -1) {
        throw new Error(`Field name cannot contain spaces. '${this.field}' doesn't meet this requirement.`);
      }
      if(this.field.indexOf(',') !== -1) {
        throw new Error(`Field name cannot contain commas. '${this.field}' doesn't meet this requirement.`);
      }
    }
  }

  addClass(name) {
    if(this.hasClass(name)) {
      return;
    }

    this.headerClass += ' ' + name;
  }

  removeClass(name) {
    if(!this.hasClass(name)) {
      return;
    }

    this.headerClass = this.headerClass.replace(' ' + name, '');
    this.headerClass = this.headerClass.replace(name, '');
  }

  hasClass(name) {
    if(this.headerClass !== undefined && this.headerClass.indexOf(name) !== -1) {
      return true;
    }
    return false;
  }

  setOwner(newOwner): boolean {    
    this.oldOwner = this.owner;
    this.owner = newOwner;
    
    let changed = this.oldOwner !== this.owner;
    if(changed) {
      this._gridInternals.publish('ColumnOwnerChanged', { column: this });      
    }
    
    return changed;
  }
  
  /**
   * Provides unique column id. If declared as "explicit-id" on the column
   * declaration then this value will be used. 
   * Otherwise unique id is a combination of field, heading and template.
   * In case if these 2 wouldn't be unique then it is required to use "explicit-id".
   */
  getUniqueId(): string {
    if(this._uniqueId === undefined) {
      return this.field + this.heading + this.template;
    }
    return this._uniqueId;
  }
}
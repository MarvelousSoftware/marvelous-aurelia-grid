import {Column} from './models/column';
import {GridInternals} from './grid-internals';
import {OptionsReader} from 'marvelous-aurelia-core/optionsReader';

export class GridOptions {
  /**
   * Array of all defined columns.
   * NOTE: code based defined columns has higher priority.
   */
  columns: Column[] = [];

  constructor(private _gridInternals: GridInternals, public reader: OptionsReader) {
    this._parseDomBasedOptions();
  }

  validate() {
    let ids = {};
    if (!this.columns.length) {
      throw new Error('Grid needs at least one defined column.');
    }

    this.columns.forEach(x => {
      let uniqueId = x.getUniqueId();
      if (ids[uniqueId] === true) {
        throw new Error(`Columns has to provide unique id and '${uniqueId}' is not unique. By default id is a concatenation of field, heading and template. ` +
                        `This kind of concatenation not always results in unique id. If it doesn't in your case then just ` +
                        `provide 'explicit-id="someUniqueValue"' on the column definition.`);
      }
      ids[uniqueId] = true;
    });
  }

  private _parseDomBasedOptions() {
    let id = 0;
    
    let columns = this.reader.getAll('columns column');
    columns.forEach(c => {
      let attrs = {};
      c.getAllProperties().forEach(x => attrs[x.name] = x.evaluate());
      let element = c.element || <any>{};
      
      // TODO: allow to specify a template in code based approach
      this.columns.push(new Column(++id, attrs, element.innerHTML, this._gridInternals));
    });
  }

  // TODO: ColumnsArray extends Column[] ??
  getColumnById(id) {
    let columns = this.columns.filter(x => x.id == id);

    if (!columns.length) {
      return undefined;
    }

    return columns[0];
  }
  getColumnByUniqueId(uniqueId: string) {
    let columns = this.columns.filter(x => x.getUniqueId() === uniqueId);

    if (!columns.length) {
      return undefined;
    }

    return columns[0];
  }
  getColumnByElement(element: Element) {
    return this.getColumnById(element.attributes["data-id"].value);
  }
}
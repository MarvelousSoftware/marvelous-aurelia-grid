import {inject} from 'aurelia-dependency-injection';
import {GridComponent, GridOptions} from '../../all';

@inject(GridOptions)
export class ToolboxComponent extends GridComponent {
  buttons = [];

  constructor(private _gridOptions: GridOptions) {
    super();
  }

  addButton(button) {
    if(!button.text || !button.click) {
      throw new Error("Missing text or click handler.");
    }

    this.buttons.push(button);
  }

  createOptions() {
    if(!this._gridOptions.domBased.has('toolbox') && !this._gridOptions.codeBased.toolbox) {
      return false;
    }

    return {};
  }
}

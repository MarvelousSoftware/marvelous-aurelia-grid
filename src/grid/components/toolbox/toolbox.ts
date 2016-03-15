import {inject} from 'aurelia-dependency-injection';
import {GridComponent, GridOptions} from '../../all';

@inject(GridOptions)
export class ToolboxComponent extends GridComponent {
  buttons: IToolboxButton[] = [];

  constructor(private _gridOptions: GridOptions) {
    super();
  }

  addButton(button: IToolboxButton) {
    if(!button.text || !button.click) {
      throw new Error(`Missing text or click handler.`);
    }

    this.buttons.push(button);
  }

  createOptions() {
    let toolbox = this._gridOptions.reader.get('toolbox');
    if(!toolbox.truthy) {
      return false;
    }

    return {};
  }
}

export interface IToolboxButton {
  text: string;
  click: Function;
}
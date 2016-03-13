import {GridTestHelpers} from '../../../unitTesting/grid/base';
import {SelectionComponent} from './selection';
import {IRowClickEvent, DataRow, rowTypes} from '../../gridRenderer';

describe('FilterRow component', () => {
  let h: GridTestHelpers;
  let click1: IRowClickEvent;
  let click2: IRowClickEvent;
  
  let getComponent = (codeBased: any, domBased: string) => {
    let gridOptions = h.getGridOptions(codeBased, domBased + `<columns><column field="Name"></column></columns>`);
    let subject = new SelectionComponent(<any>h.gridInternals, gridOptions, <any>h.dataSource);
    subject.tryEnable();
    return subject;
  }

  beforeEach(() => {
    h = new GridTestHelpers();
    h.beforeEach();
    
    h.gridInternals.renderer.rows = [new DataRow({
      column: undefined,
      data: { firstName: 'John' },
      grid: undefined,
      level: 0,
      type: rowTypes.data
    }), new DataRow({
      column: undefined,
      data: { firstName: 'Jane' },
      grid: undefined,
      level: 0,
      type: rowTypes.data
    })];
    click1 = {
      row: h.gridInternals.renderer.rows[0],
      nativeEvent: undefined
    };
    click2 = {
      row: h.gridInternals.renderer.rows[1],
      nativeEvent: undefined
    };
  });

  describe('should react on row click', () => {

    it('should do nothing if row is not of data type', () => {
      let selection = getComponent({}, `<selection></selection>`);
      let rowData = { firstName: 'John' };
      let click: IRowClickEvent = {
        row: new DataRow({
          column: undefined,
          data: rowData,
          grid: undefined,
          level: 0,
          type: rowTypes.group
        }),
        nativeEvent: undefined
      };
      h.gridInternals.subscribe.emit('RowClick', click);

      expect(selection.selectedItems.length).toBe(0);
    });

    it('should be able to select single', () => {
      let selection = getComponent({}, `<selection></selection>`);

      h.gridInternals.subscribe.emit('RowClick', click1);
      h.gridInternals.subscribe.emit('RowClick', click2);

      expect(selection.selectedItems.length).toBe(1);
      expect(selection.selectedItems[0]).toBe(click2.row.data);
      expect(click1.row.hasClass('m-row-selected')).toBe(false);
      expect(click2.row.hasClass('m-row-selected')).toBe(true);
    });

    it('should be able to select multiple', () => {
      let selection = getComponent({}, `<selection multiple></selection>`);

      h.gridInternals.subscribe.emit('RowClick', click1);
      h.gridInternals.subscribe.emit('RowClick', click2);

      expect(selection.selectedItems.length).toBe(2);
      expect(selection.selectedItems[0]).toBe(click1.row.data);
      expect(selection.selectedItems[1]).toBe(click2.row.data);
      expect(click1.row.hasClass('m-row-selected')).toBe(true);
      expect(click2.row.hasClass('m-row-selected')).toBe(true);
    });

    it('should be able to deselect', () => {
      let selection = getComponent({}, `<selection multiple></selection>`);

      h.gridInternals.subscribe.emit('RowClick', click1);
      h.gridInternals.subscribe.emit('RowClick', click2);
      h.gridInternals.subscribe.emit('RowClick', click1);

      expect(selection.selectedItems.length).toBe(1);
      expect(selection.selectedItems[0]).toBe(click2.row.data);
      expect(click1.row.hasClass('m-row-selected')).toBe(false);
      expect(click2.row.hasClass('m-row-selected')).toBe(true);
    });
    
    it('should be able to work even when one is messing with selectedItems', () => {
      let selection = getComponent({}, `<selection multiple></selection>`);

      h.gridInternals.subscribe.emit('RowClick', click1);
      selection.selectedItems.splice(0);
      h.gridInternals.subscribe.emit('RowClick', click1);
      
      expect(selection.selectedItems.length).toBe(0);
      expect(click1.row.hasClass('m-row-selected')).toBe(false);
    });
    
  });

  describe('should react on data read', () => {
    it('by clearing selection', () => {
      let selection = getComponent({}, `<selection></selection>`);
      h.gridInternals.subscribe.emit('RowClick', click1);
      
      h.dataSource.subscribe.emit('DataRead', {});
      
      expect(selection.selectedItems.length).toBe(0);
    });
  });

  describe('should be able to create options', () => {

    it('from DOM based settings', () => {
      let selection = getComponent({}, `<selection></selection>`);
      expect(selection.options).toBeTruthy();
      expect(selection.options.multiple).toBe(false);

      selection = getComponent({}, `<selection multiple></selection>`);
      expect(selection.options).toBeTruthy();
      expect(selection.options.multiple).toBe(true);

      selection = getComponent({}, `<test></test>`);
      expect(selection.options).toBeFalsy();
    });

    it('from code based settings', () => {
      let selection = getComponent({ selection: true }, ``);
      expect(selection.options).toBeTruthy();
      expect(selection.options.multiple).toBe(false);

      selection = getComponent({ selection: { multiple: true } }, ``);
      expect(selection.options).toBeTruthy();
      expect(selection.options.multiple).toBe(true);

      selection = getComponent({ test: true }, ``);
      expect(selection.options).toBeFalsy();
    });

  });
});
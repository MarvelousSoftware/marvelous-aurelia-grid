import {GridTestHelpers} from '../../unitTesting/grid/base';
import {ColumnReorderingComponent} from './column-reordering';
import {Column} from '../models/column';
import {DomUtils} from 'marvelous-aurelia-core/utils';
import {GridOptions} from '../grid-options';

describe('Column reordering component', () => {
  let h: GridTestHelpers;
  let gridOptions: GridOptions;
  
  let getComponent = (codeBased: any = {columnReordering: true}, domBased: string = ``) => {
    gridOptions = h.getGridOptions(codeBased, domBased + `<columns><column field="FirstName"></column><column field="LastName"></column><column field="Age"></column></column><column field="DateOfBirth"></column></columns>`);
    let subject = new ColumnReorderingComponent(gridOptions, <any>h.gridInternals);
    subject.tryEnable();
    return subject;
  }
  
  beforeEach(() => {
    h = new GridTestHelpers();
    h.beforeEach();
  });
  
  describe('should react on columns drag and drop', () => {
    interface ITestColumns {
      firstName: Column;
      lastName: Column;
      age: Column;
    }
    interface ITestHtmlColumns {
      firstName: any;
      lastName: any;
      age: any;
    }
    let columns: ITestColumns;
    
    let component: ColumnReorderingComponent;
    let htmlColumns: ITestHtmlColumns;
    let isCursorOverElement: Sinon.SinonStub;
    
    beforeEach(() => {
      component = getComponent();
      
      columns = {
        firstName: h.getColumn({field: 'FirstName'}),
        lastName: h.getColumn({field: 'LastName'}),
        age: h.getColumn({field: 'Age'})
      };
      
      htmlColumns = {
        firstName: {
          _column: columns.firstName,
          clientWidth: 100,
          offset: {
            left: 50,
            top: 10
          },
          insertBefore: sinon.spy(),
          appendChild: sinon.spy()
        },
        lastName: {
          _column: columns.lastName,
          clientWidth: 200,
          offset: {
            left: 150,
            top: 10
          },
          insertBefore: sinon.spy(),
          appendChild: sinon.spy()
        },
        age: {
          _column: columns.age,
          clientWidth: 50,
          offset: {
            left: 350,
            top: 10
          },
          insertBefore: sinon.spy(),
          appendChild: sinon.spy()
        }
      };
      
      (<any>h.gridInternals.element).querySelectorAll = () => {
        return [htmlColumns.firstName, htmlColumns.lastName, htmlColumns.age];
      };
      
      isCursorOverElement = DomUtils.isCursorOverElement = sinon.stub();
      
      gridOptions.getColumnByElement = (el: any) => el._column;
    });
    
    it('moved should clear if position not changed', () => {
      let event = {pageX: 100};
      let el: any = htmlColumns.firstName;
      isCursorOverElement.withArgs(el, event).returns(true);
      component.markers = [document.createElement('div')];
      component.hoveredColumn = htmlColumns.lastName;
      component.side = 'left';
      
      h.gridInternals.listenOnDragAndDrop.moved(event, el, columns.firstName);
      
      expect(component.markers.length).toBe(0);
      expect(component.hoveredColumn).toBeFalsy();
      expect(component.side).toBeFalsy();
    });
    
    it('moved should do nothing if not hovered on any column', () => {
      let event = {pageX: 100};
      let el: any = htmlColumns.firstName;
      isCursorOverElement.returns(false);
      expect(component.oldSide).toBeFalsy();
      component.side = 'left';
      
      h.gridInternals.listenOnDragAndDrop.moved(event, el, columns.firstName);
      
      expect(component.oldSide).toBeFalsy();
    });
    
    it('moved should calculate left side correctly', () => {
      let event = {pageX: 160};
      let el: any = htmlColumns.firstName;
      isCursorOverElement.returns(false);
      isCursorOverElement.withArgs(htmlColumns.lastName, event).returns(true);
      DomUtils.offset = sinon.stub().withArgs(htmlColumns.lastName).returns(htmlColumns.lastName.offset);
      
      h.gridInternals.listenOnDragAndDrop.moved(event, el, columns.firstName);
      
      expect(component.side).toBe('left');
      expect(component.markers.length).toBe(1);
    });
    
    it('moved should calculate right side correctly', () => {
      let event = {pageX: 270};
      let el: any = htmlColumns.firstName;
      isCursorOverElement.returns(false);
      isCursorOverElement.withArgs(htmlColumns.lastName, event).returns(true);
      DomUtils.offset = sinon.stub().withArgs(htmlColumns.lastName).returns(htmlColumns.lastName.offset);
      
      h.gridInternals.listenOnDragAndDrop.moved(event, el, columns.firstName);
      
      expect(component.side).toBe('right');
      expect(component.markers.length).toBe(1);
    });
    
    it('dropped should work properly in valid cases', () => {
      let test = (input: {columns: any[], dragged: any, hovered: any, side: string}, newColumns: any[]) => {
        component.hoveredColumn = input.hovered;
        component.side = input.side;
        h.gridInternals.mainColumns = input.columns.map(x => x._column);
        (<any>h.gridInternals.element).querySelectorAll = () => input.columns;
        
        h.gridInternals.listenOnDragAndDrop.dropped(undefined, input.dragged, input.dragged._column);
        
        expect(h.gridInternals.mainColumns).toEqual(newColumns);
      };
      
      // age
      test({
        columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
        dragged: htmlColumns.age,
        hovered: htmlColumns.age,
        side: 'left'
      }, [columns.age, columns.lastName, columns.firstName]);
      test({
        columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
        dragged: htmlColumns.age,
        hovered: htmlColumns.age,
        side: 'right'
      }, [columns.age, columns.lastName, columns.firstName]);
      test({
        columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
        dragged: htmlColumns.age,
        hovered: htmlColumns.lastName,
        side: 'left'
      }, [columns.age, columns.lastName, columns.firstName]);
      test({
        columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
        dragged: htmlColumns.age,
        hovered: htmlColumns.lastName,
        side: 'right'
      }, [columns.lastName, columns.age, columns.firstName]);
      test({
        columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
        dragged: htmlColumns.age,
        hovered: htmlColumns.firstName,
        side: 'left'
      }, [columns.lastName, columns.age, columns.firstName]);
      test({
        columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
        dragged: htmlColumns.age,
        hovered: htmlColumns.firstName,
        side: 'right'
      }, [columns.lastName, columns.firstName, columns.age]);
      
      // last name
      test({
        columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
        dragged: htmlColumns.lastName,
        hovered: htmlColumns.age,
        side: 'left'
      }, [columns.lastName, columns.age, columns.firstName]);
      test({
        columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
        dragged: htmlColumns.lastName,
        hovered: htmlColumns.age,
        side: 'right'
      }, [columns.age, columns.lastName, columns.firstName]);
      test({
        columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
        dragged: htmlColumns.lastName,
        hovered: htmlColumns.lastName,
        side: 'left'
      }, [columns.age, columns.lastName, columns.firstName]);
      test({
        columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
        dragged: htmlColumns.lastName,
        hovered: htmlColumns.lastName,
        side: 'right'
      }, [columns.age, columns.lastName, columns.firstName]);
      test({
        columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
        dragged: htmlColumns.lastName,
        hovered: htmlColumns.firstName,
        side: 'left'
      }, [columns.age, columns.lastName, columns.firstName]);
      test({
        columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
        dragged: htmlColumns.lastName,
        hovered: htmlColumns.firstName,
        side: 'right'
      }, [columns.age, columns.firstName, columns.lastName]);
      
      // first name
      test({
        columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
        dragged: htmlColumns.firstName,
        hovered: htmlColumns.age,
        side: 'left'
      }, [columns.firstName, columns.age, columns.lastName]);
      test({
        columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
        dragged: htmlColumns.firstName,
        hovered: htmlColumns.age,
        side: 'right'
      }, [columns.age, columns.firstName, columns.lastName]);
      test({
        columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
        dragged: htmlColumns.firstName,
        hovered: htmlColumns.lastName,
        side: 'left'
      }, [columns.age, columns.firstName, columns.lastName]);
      test({
        columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
        dragged: htmlColumns.firstName,
        hovered: htmlColumns.lastName,
        side: 'right'
      }, [columns.age, columns.lastName, columns.firstName]);
      test({
        columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
        dragged: htmlColumns.firstName,
        hovered: htmlColumns.firstName,
        side: 'left'
      }, [columns.age, columns.lastName, columns.firstName]);
      test({
        columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
        dragged: htmlColumns.firstName,
        hovered: htmlColumns.firstName,
        side: 'right'
      }, [columns.age, columns.lastName, columns.firstName]);
    });
    
  });
  
  describe('should be able to create options', () => {
    
    it('from code based settings', () => {
      let component = getComponent({ columnReordering: true }, ``);
      expect(component.options).toBeTruthy();
    });
    
    it('from DOM based settings', () => {
      let component = getComponent({}, `<column-reordering></column-reordering>`);
      expect(component.options).toBeTruthy();
    });
    
    it('when configuration is not available', () => {
      let component = getComponent({}, ``);  
      expect(component.options).toBeFalsy();
    });
    
  });
  
});

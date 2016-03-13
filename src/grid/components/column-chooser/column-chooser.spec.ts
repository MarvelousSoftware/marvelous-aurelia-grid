import {GridTestHelpers} from '../../unitTesting/grid/base';
import {ColumnChooserComponent} from './column-chooser';
import {ColumnReorderingComponent} from './column-reordering';
import {ToolboxComponent} from './toolbox';
import {Column} from '../models/column';

describe('Column chooser component', () => {
  interface ITestColumns {
    firstName: Column;
    lastName: Column;
    age: Column;
    dateOfBirth: Column;
  }
  
  let h: GridTestHelpers;
  let columns: ITestColumns;
  
  let getComponent = (codeBased: any = {columnChooser: true}, domBased: string = ``) => {
    let gridOptions = h.getGridOptions(codeBased, domBased + `<columns><column field="FirstName"></column><column field="LastName"></column><column field="Age"></column></column><column field="DateOfBirth"></column></columns>`);
    gridOptions.columns = [columns.firstName, columns.lastName, columns.age];
    let subject = new ColumnChooserComponent(<any>h.gridInternals, gridOptions, <any>h.components);
    subject.tryEnable();
    return subject;
  }
  
  let reorderingRegistration: {enable: Sinon.SinonSpy};
  let toolboxRegistration: { 
    instance: {
      addButton: Sinon.SinonSpy
    },
    enable: Sinon.SinonSpy
  };
  
  beforeEach(() => {
    h = new GridTestHelpers();
    h.beforeEach();
    columns = {
      firstName: h.getColumn({
        field: 'FirstName'
      }),
      lastName: h.getColumn({
        field: 'LastName',
        hidden: true
      }),
      age: h.getColumn({
        field: 'Age',
        hidden: true
      }),
      dateOfBirth: h.getColumn({
        field: 'DateOfBirth'
      })
    };
    columns.lastName.owner = ColumnChooserComponent;
    columns.age.owner = ColumnChooserComponent;
    h.gridInternals.mainColumns = [columns.firstName, columns.dateOfBirth];
    
    reorderingRegistration = {
      enable: sinon.spy()
    };
    toolboxRegistration = {
      instance: {
        addButton: sinon.spy()
      },
      enable: sinon.spy()
    };
    
    h.components.get.for(ColumnReorderingComponent, reorderingRegistration);
    h.components.get.for(ToolboxComponent, toolboxRegistration);
  });
  
  describe('on init', () => {
    
    it('should enable ColumnReorderingComponent', () => {
      let component = getComponent();
      expect(reorderingRegistration.enable.calledOnce).toBe(true);
    });
    
    it('should make columns draggable', () => {
      let component = getComponent();
      expect(h.gridInternals.makeColumnsDraggable.called).toBe(true);
    });
    
    it('should initialize toolbox', () => {
      let component = getComponent();
      component.togglePopUp = sinon.spy();
      
      expect(toolboxRegistration.instance.addButton.calledOnce).toBe(true);
      let arg = toolboxRegistration.instance.addButton.firstCall.args[0];
      arg.click();
      expect(arg.text).toBeTruthy();
      expect((<Sinon.SinonSpy>component.togglePopUp).calledOnce).toBe(true);
    });
    
    it('should enable toolbox automaticaly if autoToolboxInit enabled', () => {
      let component = getComponent({columnChooser: {autoToolboxInit: true}});
      
      expect(toolboxRegistration.enable.calledOnce).toBe(true);
    });
    
    it(`shouldn't enable toolbox automaticaly if autoToolboxInit disabled`, () => {
      let component = getComponent({columnChooser: {autoToolboxInit: false}});
      
      expect(toolboxRegistration.enable.called).toBe(false);
    });
    
    it('should take all hidden columns', () =>{
      let component = getComponent();
      
      expect(component.columns.length).toBe(2);
      expect(component.columns).toContain(columns.lastName);
      expect(component.columns).toContain(columns.age);
    });
    
  });
  
  describe('save state', () => {
    
    it('should attach columns to state', () => {
      let component = getComponent();
      let state: any = {};
      
      component.saveState(state);
      
      expect(state.columns).toEqual([columns.lastName.getUniqueId(), columns.age.getUniqueId()]);
    });
    
  });
  
  describe('load state', () => {
    
    it('load columns from state', () => {
      let component = getComponent();
      let state: any = {
        columns: [columns.age.getUniqueId(), columns.firstName.getUniqueId()]
      };
      
      component.loadState(state);
      
      expect(component.columns).toEqual([columns.age, columns.firstName]);
      expect(component.columns.map(x => x.owner)).toEqual([ColumnChooserComponent, ColumnChooserComponent]);
    });
    
  });
  
  describe('should be able to react on ColumnOwnerChanged event', () => {
    
    it('by removing item from columns array and marking it as not hidden any more', () => {
      let component = getComponent();
      columns.lastName.owner = ToolboxComponent;
      let msg = { column: columns.lastName };
      
      expect(columns.lastName.hidden).toBe(true);
      
      h.gridInternals.subscribe.emit('ColumnOwnerChanged', msg);
      
      expect(columns.lastName.hidden).toBe(false);
      expect(component.columns).toEqual([columns.age]);
    });
    
    it('and do nothing if column owner is still column chooser', () => {
      let component = getComponent();
      let msg = { column: columns.lastName };
      let length = component.columns.length;
      
      expect(columns.lastName.hidden).toBe(true);
      
      h.gridInternals.subscribe.emit('ColumnOwnerChanged', msg);
      
      expect(columns.lastName.hidden).toBe(true);
      expect(component.columns.length).toEqual(length);
    });
    
  });
  
  describe('should react on columns drag and drop', () => {
    
    it('dropped should change owner of column', () => {
      let component = getComponent();
      component.overDroppable = true;
      columns.firstName.setOwner = sinon.spy();
      
      h.gridInternals.listenOnDragAndDrop.dropped(undefined, undefined, columns.firstName);
      
      expect((<Sinon.SinonSpy>columns.firstName.setOwner).calledWithExactly(ColumnChooserComponent)).toBe(true);
    });
    
    it('dropped should change owner of column only if main grid has at least 2 columns', () => {
      let component = getComponent();
      component.overDroppable = true;
      columns.firstName.setOwner = sinon.spy();
      h.gridInternals.mainColumns.splice(1);
      
      h.gridInternals.listenOnDragAndDrop.dropped(undefined, undefined, columns.firstName);
      
      expect((<Sinon.SinonSpy>columns.firstName.setOwner).called).toBe(false);
    });
    
    it('dropped should change owner of column only column does not belong already to column chooser', () => {
      let component = getComponent();
      component.overDroppable = true;
      columns.lastName.setOwner = sinon.spy();
      
      h.gridInternals.listenOnDragAndDrop.dropped(undefined, undefined, columns.lastName);
      
      expect((<Sinon.SinonSpy>columns.lastName.setOwner).called).toBe(false);
    });
    
    it('dropped should change overDroppable state', () => {
      let component = getComponent();
      component.overDroppable = true;
      
      h.gridInternals.listenOnDragAndDrop.dropped(undefined, undefined, columns.lastName);
      
      expect(component.overDroppable).toBe(false);
    });
    
    it('dropped should move column from main to column chooser', () => {
      let component = getComponent();
      component.overDroppable = true;
      expect(h.gridInternals.mainColumns).toContain(columns.firstName);
      expect(component.columns).not.toContain(columns.firstName);
      expect(columns.firstName.hidden).toBeFalsy();
      
      h.gridInternals.listenOnDragAndDrop.dropped(undefined, undefined, columns.firstName);
      
      expect(h.gridInternals.mainColumns).not.toContain(columns.firstName);
      expect(component.columns).toContain(columns.firstName);
      expect(columns.firstName.hidden).toBe(true);
    });
    
    it('dropped should maintain columns sorted', () => {
      let component = getComponent();
      component.overDroppable = true;
      expect(component.columns).not.toContain(columns.firstName);
      
      h.gridInternals.listenOnDragAndDrop.dropped(undefined, undefined, columns.firstName);
      
      expect(component.columns).toEqual([columns.age, columns.firstName, columns.lastName]);
    });
    
    it('overDroppable should change state if column is not already in the column chooser', () => {
      let component = getComponent();
      component.overDroppable = false;
      
      h.gridInternals.listenOnDragAndDrop.overDroppable(undefined, undefined, columns.firstName);
      
      expect(component.overDroppable).toBe(true);
    });
    
    it('overDroppable should not change state if column is already in the column chooser', () => {
      let component = getComponent();
      component.overDroppable = false;
      
      h.gridInternals.listenOnDragAndDrop.overDroppable(undefined, undefined, columns.lastName);
      
      expect(component.overDroppable).toBe(false);
    });
    
    it('outsideDroppable should change overDroppable state', () => {
      let component = getComponent();
      component.overDroppable = true;
      
      h.gridInternals.listenOnDragAndDrop.outsideDroppable(undefined, undefined, columns.lastName);
      
      expect(component.overDroppable).toBe(false);
    });
    
    it('canceled should change overDroppable state', () => {
      let component = getComponent();
      component.overDroppable = true;
      
      h.gridInternals.listenOnDragAndDrop.canceled(undefined, undefined, columns.lastName);
      
      expect(component.overDroppable).toBe(false);
    });
    
  });
  
  describe('togglePopUp method', () => {
    
    it('should show popup if hidden', () => {
      let component = getComponent();
      component.hidden = true;

      component.togglePopUp();
      
      expect(component.hidden).toBe(false);
    });
    
    it('should hide popup if visible', () => {
      let component = getComponent();
      component.hidden = false;
      
      component.togglePopUp();
      
      expect(component.hidden).toBe(true);
    });
    
  });
  
  describe('should be able to create options', () => {
    
    it('from code based settings', () => {
      let component = getComponent({columnChooser: {
        autoToolboxInit: false
      }}, ``);
      
      expect(component.options).not.toEqual(component.defaultOptions);
      expect(component.options).toEqual({
        autoToolboxInit: false
      });
    });
    
    it('from DOM based settings', () => {
      let component = getComponent({}, `<column-chooser auto-toolbox-init.bind="false"></column-chooser>`);
      
      expect(component.options).not.toEqual(component.defaultOptions);
      expect(component.options).toEqual({
        autoToolboxInit: false
      });
    });
    
    it('using default options as a fallback plan', () => {
       let component = getComponent({columnChooser: true}, ``);
       
       expect(component.options).toEqual(component.defaultOptions);
    });
    
    it('when configuration is not available', () => {
      let pagination = getComponent({}, ``);
      
      let options = pagination.createOptions();
      
      expect(options).toBeFalsy();
    });
    
  });
  
  it('should unregister correctly', () => {
    let component = getComponent();
    expect(h.gridInternals.subscribe.subscribers.length).toBeGreaterThan(0);
    
    component.stop();
    
    expect(h.gridInternals.subscribe.subscribers.length).toBe(0);
  });
  
});

import {GridTestHelpers} from '../../unitTesting/grid/base';
import {FilterRowComponent} from './filter-row';
import {Column} from '../models/column';

describe('FilterRow component', () => {
  let h: GridTestHelpers;
  let column: Column;
  
  let getComponent = (codeBased: any, domBased: string) => {
    let gridOptions = h.getGridOptions(codeBased, domBased + `<columns><column field="Name"></column></columns>`);
    let subject = new FilterRowComponent(<any>h.dataSource, <any>h.aureliaUtils, <any>h.gridInternals, gridOptions, column);
    subject.tryEnable();
    return subject;
  }

  let spyOnRefresh = (action: (spy: Sinon.SinonSpy)=>void) => {
    let initial = FilterRowComponent.prototype.refresh; 
    let spy = FilterRowComponent.prototype.refresh = sinon.spy();
    
    action(spy);
    
    FilterRowComponent.prototype.refresh = initial;
  }
  
  let textRequiredOperator = {
      name: 'Foo',
      textRequired: true,
      value: 'foo'
    };
    let textNotRequiredOperator = {
      name: 'Bar',
      textRequired: false,
      value: 'bar'
    };

  beforeEach(() => {
    h = new GridTestHelpers();
    h.beforeEach();
    column = h.getColumn({
      field: 'Name',
      heading: 'Name',
      template: ''
    });
  });

  describe('should be able to create options', () => {
    
    it('from DOM based settings', () => {     
      let filterRow = getComponent({}, `<filter-row></filter-row>`);
      
      expect(filterRow.options).toBeTruthy();
    });
    
    it('from code based settings', () => {
      let filterRow = getComponent({ filterRow: true }, ``);
      
      expect(filterRow.options).toBeTruthy();
    });
    
    it('when configuration is not available', () => {
      let filterRow = getComponent({}, ``);
      
      expect(filterRow.options).toBeFalsy();
    });
    
    it('when column is explicitly disabled', () => {
      column = h.getColumn({['row-filtering-disabled']: 'true', field: 'foo'});
      let filterRow = getComponent({ filterRow: true }, ``);
      
      expect(filterRow.options).toBeFalsy();
    });
    
    it('when column does not have field configured', () => {
      column = h.getColumn({});
      let filterRow = getComponent({ filterRow: true }, ``);
      
      expect(filterRow.options).toBeFalsy();
    });
    
  });
  
  it('should unregister correctly', () => {
    let subject = getComponent({ filterRow: true }, ``);
    
    subject.stop();
    
    expect(h.dataSource.subscribe.subscribers.length).toBe(0);
    expect(h.aureliaUtils.observe.observers.length).toBe(0);
  });
   
  describe('saveState method should', () => {
    
    it('save state if compare operator is selected', () => {
      let subject = getComponent({ filterRow: true }, ``);     
      subject.selectedCompareOperator = subject.allCompareOperators['Equal'];
      let state = {};
      
      subject.saveState(state);
      
      expect(state[column.getUniqueId()].selectedCompareOperator)
        .toEqual(subject.selectedCompareOperator);
    });
    
    it('save state if compare text is provided', () => {
      let subject = getComponent({ filterRow: true }, ``);     
      subject.compareText = 'Foo';
      let state = {};
      
      subject.saveState(state);
      
      expect(state[column.getUniqueId()].compareText)
        .toEqual(subject.compareText);
    });
    
    it('do nothing if input data is missing', () => {
      let subject = getComponent({ filterRow: true }, ``);     
      let state = {};
      
      subject.saveState(state);
      
      expect(state).toEqual({});
    });
    
  }); 
  
  describe('loadState method should', () => {
    
    it('load saved selected compare operator', () => {
      let subject = getComponent({ filterRow: true }, ``);
      let state = {
        [column.getUniqueId()]: {
          selectedCompareOperator: subject.allCompareOperators['Equal'] 
        } 
      };
      
      subject.loadState(state);
      
      expect(subject.selectedCompareOperator).toEqual(subject.allCompareOperators['Equal']);
    });
    
    it('load saved compare text', () => {
      let subject = getComponent({ filterRow: true }, ``);
      let text = 'Foo';
      let state = {
        [column.getUniqueId()]: {
          compareText: text
        }
      }
      
      subject.loadState(state);
      
      expect(subject.compareText).toEqual(text);
    });
    
    it('do nothing if state is to defined for given column', () => {
      let subject = getComponent({ filterRow: true }, ``);
      let state = {};
      let initialText = subject.compareText;
      let initialOperator = subject.selectedCompareOperator;
      
      subject.loadState(state);
      
      expect(subject.compareText).toBe(initialText);
      expect(subject.selectedCompareOperator).toBe(initialOperator);
    });
    
  });
  
  describe('selectCompareOperator method should', () => {
    
    it('should change selected compare operator if given is available', () => {
      let subject = getComponent({ filterRow: true }, ``);
      subject.compareOperators = [textNotRequiredOperator];
      
      subject.selectCompareOperator('Bar');
      
      expect(subject.selectedCompareOperator).toBe(subject.compareOperators[0]);
    });
    
    it('do nothing if compare operator is not available', () => {
      let subject = getComponent({ filterRow: true }, ``);
      subject.compareOperators = [];
      let initialOperator = subject.selectedCompareOperator;
      
      subject.selectCompareOperator('Foo');
      
      expect(subject.selectedCompareOperator).toBe(initialOperator);
    });
    
  });
  
  describe('on data read should', () => {
    
    it('do nothing if compare operator not selected', () => {
      let subject = getComponent({ filterRow: true }, ``);
      let params: any = {};
      
      h.dataSource.subscribe.emit('DataRead', params);
      
      expect(params.filtering).toBeFalsy();
    });
    
    it('do nothing if compare text is empty when required', () => {
      let subject = getComponent({ filterRow: true }, ``);
      subject.selectedCompareOperator = textRequiredOperator;
      let params: any = {};
      
      h.dataSource.subscribe.emit('DataRead', params);
      
      expect(params.filtering).toBeFalsy();
    });
    
    it('attach filtering', () => {
      let subject = getComponent({ filterRow: true }, ``);
      subject.selectCompareOperator('Equal');
      subject.compareText = 'bar';
      let params: any = {};
      
      h.dataSource.subscribe.emit('DataRead', params);
      
      expect(params.filtering).toBeTruthy();
      expect(params.filtering[column.field]).toBeTruthy();
      expect(params.filtering[column.field]).toEqual([{
        compareOperator: subject.selectedCompareOperator.name,
        value: subject.compareText
      }]);
    });
    
    it('attach column to existing filtering configuration', () => {
      let subject = getComponent({ filterRow: true }, ``);
      subject.selectCompareOperator('Equal');
      subject.compareText = 'bar';
      let params: any = {
        filtering: {
          [column.field]: [{
            compareOperator: 'FOO',
            value: 'BAR'
          }]
        }
      };
      
      h.dataSource.subscribe.emit('DataRead', params);
      
      expect(params.filtering).toBeTruthy();
      expect(params.filtering[column.field]).toBeTruthy();
      expect(params.filtering[column.field].length).toBe(2);
      expect(params.filtering[column.field]).toContain({
        compareOperator: subject.selectedCompareOperator.name,
        value: subject.compareText
      });
    });
  });
  
  describe('refresh method should', () => {    
    it('do nothing if text required and not found', () => {
      let subject = getComponent({ filterRow: true }, ``);
      subject.selectedCompareOperator = textRequiredOperator;
      
      subject.refresh();
      
      expect(h.gridInternals.refresh.called).toBe(false);      
    });
    
    it('refresh grid if text required and found', () => {
      let subject = getComponent({ filterRow: true }, ``);
      subject.selectedCompareOperator = textRequiredOperator;
      subject.compareText = 'bar';
      
      subject.refresh();
      
      expect(h.gridInternals.refresh.calledOnce).toBe(true);      
    });
    
    it('refresh grid if text not required and not found', () => {
      let subject = getComponent({ filterRow: true }, ``);
      subject.selectedCompareOperator = textNotRequiredOperator;
      
      subject.refresh();
      
      expect(h.gridInternals.refresh.calledOnce).toBe(true);      
    });
    
    it('refresh grid only once if selected compare operator not changed and text not required', () => {
      let subject = getComponent({ filterRow: true }, ``);
      subject.selectedCompareOperator = textNotRequiredOperator;
      
      subject.refresh();
      subject.refresh();
      subject.refresh();
      
      expect(h.gridInternals.refresh.calledOnce).toBe(true);      
    });
    
    it('refresh grid twice if selected compare operator has changed and text not required', () => {
      let subject = getComponent({ filterRow: true }, ``);
      subject.selectedCompareOperator = textNotRequiredOperator;
      
      subject.refresh();
      subject.selectedCompareOperator = {
        name: 'Foobar',
        textRequired: false,
        value: 'foobar'
      }
      
      subject.refresh();
      subject.refresh();
      
      expect(h.gridInternals.refresh.calledTwice).toBe(true);      
    });
    
    it('refresh grid only once if selected compare operator and text not changed in case when text is required', () => {
      let subject = getComponent({ filterRow: true }, ``);
      subject.selectedCompareOperator = textRequiredOperator;
      subject.compareText = 'bar';
      
      subject.refresh();
      subject.refresh();
      subject.refresh();
      
      expect(h.gridInternals.refresh.calledOnce).toBe(true);      
    });
    
    it('refresh grid twice if selected compare operator not changed but text changed in case when text is required', () => {
      let subject = getComponent({ filterRow: true }, ``);
      subject.selectedCompareOperator = textRequiredOperator;
      subject.compareText = 'bar';
      
      subject.refresh();
      subject.compareText = 'bar2';
      
      subject.refresh();
      subject.refresh();
      
      expect(h.gridInternals.refresh.calledTwice).toBe(true);      
    });
  });
  
  describe('on selected compare operator changed should', () => {    
    it('do nothing on first call', () => {
      spyOnRefresh(spy => {
        let subject = getComponent({ filterRow: true }, ``);
        
        h.aureliaUtils.observe.emit(subject, 'selectedCompareOperator', null, undefined);
        
        expect(spy.called).toBe(false);
      });
    });
    
    it('do nothing if text required and missing', () => {
      spyOnRefresh(spy => {
        let subject = getComponent({ filterRow: true }, ``);
        subject.selectedCompareOperator = textRequiredOperator;
        
        h.aureliaUtils.observe.emit(subject, 'selectedCompareOperator', subject.selectedCompareOperator, null);
        
        expect(spy.called).toBe(false);
      });
    });
    
    it('refresh grid if text required and found', () => {
      spyOnRefresh(spy => {
        let subject = getComponent({ filterRow: true }, ``);
        subject.selectedCompareOperator = textRequiredOperator;
        subject.compareText = 'BAR';
        
        h.aureliaUtils.observe.emit(subject, 'selectedCompareOperator', subject.selectedCompareOperator, null);
        
        expect(spy.calledOnce).toBe(true);
      });
    });
    
    it('refresh grid if text not required', () => {
      spyOnRefresh(spy => {
        let subject = getComponent({ filterRow: true }, ``);
        subject.selectedCompareOperator = textNotRequiredOperator;
        
        h.aureliaUtils.observe.emit(subject, 'selectedCompareOperator', subject.selectedCompareOperator, null);
        
        expect(spy.calledOnce).toBe(true);
      });
    });
    
    it('clear compare text on operator unselected', () => {
      spyOnRefresh(spy => {
        let subject = getComponent({ filterRow: true }, ``);
        subject.selectedCompareOperator = textRequiredOperator;
        subject.compareText = 'BAR';
        
        h.aureliaUtils.observe.emit(subject, 'selectedCompareOperator', '', subject.selectedCompareOperator);
        
        expect(spy.calledOnce).toBe(true);
        expect(subject.compareText).toBeFalsy();
      });
    })
  });
  
  describe('constructor should', () => {
    describe('should create valid type', () => {
    
      it('when defined', () => {
        column = h.getColumn({ type: 'number', field: 'foo' });
        
        let subject = getComponent({ filterRow: true }, ``);
        
        expect(subject.type).toEqual('number');
      });
      
      it('when not defined', () => {      
        let subject = getComponent({ filterRow: true }, ``);
        
        expect(subject.type).toEqual('string');
      })
      
    });
    
    it('detect not nullable type', () => {
      column = h.getColumn({ nullable: 'false', field: 'foo' });  
      
      let subject = getComponent({ filterRow: true }, ``);
      
      expect(subject.nullable).toBe(false);
    });
    
    it('consider type as nullable if not specified otherwise', () => { 
      let subject = getComponent({ filterRow: true }, ``);
      
      expect(subject.nullable).toBe(true);
    });
    
    it('should initialize compare operators', () => {
      column = h.getColumn({ nullable: 'false', type: 'number', field: 'foo' });  
      let initial = (<any>FilterRowComponent.prototype)._getCompareOperators; 
      let spy = (<any>FilterRowComponent.prototype)._getCompareOperators = sinon.spy();
      
      let subject = getComponent({ filterRow: true }, ``);
      
      expect(spy.calledOnce).toBe(true);
      expect(spy.calledWith(subject.type, subject.nullable)).toBe(true);
      (<any>FilterRowComponent.prototype)._getCompareOperators = initial;
    });
  });
  
  describe('getCompareOperators method should', () => {
    it('handle all supported types', () => {
      let subject = getComponent({ filterRow: true }, ``);
      
      expect((<any>subject)._getCompareOperators('string', false).length).toBeGreaterThan(0);
      expect((<any>subject)._getCompareOperators('string', true).length).toBeGreaterThan(0);
      expect((<any>subject)._getCompareOperators('number', false).length).toBeGreaterThan(0);
      expect((<any>subject)._getCompareOperators('number', true).length).toBeGreaterThan(0);
      expect((<any>subject)._getCompareOperators('date', false).length).toBeGreaterThan(0);
      expect((<any>subject)._getCompareOperators('date', true).length).toBeGreaterThan(0);
      expect((<any>subject)._getCompareOperators('boolean', false).length).toBeGreaterThan(0);
      expect((<any>subject)._getCompareOperators('boolean', true).length).toBeGreaterThan(0);
    });
    
    it('should throw on not supported type', () => {
      let subject = getComponent({ filterRow: true }, ``);
      
      expect(() => { (<any>subject)._getCompareOperators('foo', false) }).toThrow();
    });
  });
  
  describe('onCompareTextWrite method should', () => {
    it('refresh on enter pressed', () => {
      spyOnRefresh(spy => {
        let subject = getComponent({ filterRow: true }, ``);
      
        (<any>subject)._onCompareTextWrite(<any>{ which: 13 });
        
        expect(spy.calledOnce).toBe(true);
      });
    });
  });
});

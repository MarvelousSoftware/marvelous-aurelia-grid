import {PaginationComponent, IPaginationOptions} from './pagination';
import {GridTestHelpers} from '../../unitTesting/grid/base';

describe('Pagination component', () => {
  let h: GridTestHelpers;
  let getComponent = (codeBased: IPaginationOptions, domBased: string) => {
    let gridOptions = h.getGridOptions({ pagination: codeBased }, domBased + `<columns><column field="Name"></column></columns>`);
    return new PaginationComponent(<any>h.dataSource, <any>h.aureliaUtils, <any>h.gridInternals, gridOptions);
  }

  beforeEach(() => {
    h = new GridTestHelpers();
    h.beforeEach();
  });

  describe('should be able to create options', () => {
    
    it('from DOM based settings', () => {     
      let pagination = getComponent({}, `<pagination size="10" all.bind="[5,10,15]" range="50"></pagination>`);
      
      let options = pagination.createOptions();
      
      expect(options.size).toEqual(10);
      expect(options.all).toEqual([5,10,15]);
      expect(options.range).toEqual(50);
    });
    
    it('from code based settings', () => {     
      let pagination = getComponent({size: 100, all:[100,200,300], range: 50}, 
      `<pagination size="10" all.bind="[5,10,15]"></pagination>`);
      
      let options = pagination.createOptions();
      
      expect(options.size).toEqual(100);
      expect(options.all).toEqual([100,200,300]);
      expect(options.range).toEqual(50);
    });
    
    it('when configuration is not available', () => {
      let pagination = getComponent(false, ``);
      
      let options = pagination.createOptions();
      
      expect(options).toBeFalsy();
    });
    
    it('with default settings', () => {
      let pagination = getComponent(true, ``);
      
      let options = pagination.createOptions();
      
      expect(options).toEqual(pagination.defaultOptions);
    });
    
  });
  
  describe('changePage method should', () => {
    
    it('update view modela and refresh the grid', () => {
      let pagination = getComponent({}, ``);
      
      pagination.changePage(25);
      
      expect(pagination.selected).toEqual(25);
      expect(h.gridInternals.refresh.calledOnce).toBe(true);            
    });
    
    it('do nothing if page has not changed', () => {
      let pagination = getComponent({}, ``);
      
      pagination.changePage(1);
      
      expect(pagination.selected).toEqual(1);
      expect(h.gridInternals.refresh.calledOnce).toBe(false);
    })
    
  });
  
  it('selectFirst method should select first page', () => {
    let pagination = getComponent({}, ``);
    pagination.selected = 2;
      
    pagination.selectFirst();
    
    expect(pagination.selected).toEqual(1);
    expect(h.gridInternals.refresh.calledOnce).toBe(true);
  });
  
  it('selectLast method should select last page', () => {
    let pagination = getComponent({}, ``);
    pagination.lastPage = 5;
      
    pagination.selectLast();
    
    expect(pagination.selected).toEqual(5);
    expect(h.gridInternals.refresh.calledOnce).toBe(true);
  });
  
  describe('selectPrev method should select previous page', () => {
    it('', () => {
      let pagination = getComponent({}, ``);
      pagination.selected = 5;
        
      pagination.selectPrev();
      
      expect(pagination.selected).toEqual(4);
      expect(h.gridInternals.refresh.calledOnce).toBe(true);
    });
    it('but only if not first selected', () => {
      let pagination = getComponent({}, ``);
      pagination.selected = 1;
        
      pagination.selectPrev();
      
      expect(pagination.selected).toEqual(1);
      expect(h.gridInternals.refresh.calledOnce).toBe(false);
    });
  });
  
  describe('selectNext method should select next page', () => {
    it('', () => {
      let pagination = getComponent({}, ``);
      pagination.lastPage = 10;
      pagination.selected = 5;
         
      pagination.selectNext();
      
      expect(pagination.selected).toEqual(6);
      expect(h.gridInternals.refresh.calledOnce).toBe(true);
    });
    it('but only if not last selected', () => {
      let pagination = getComponent({}, ``);
      pagination.lastPage = 5;
      pagination.selected = 5;
        
      pagination.selectNext();
      
      expect(pagination.selected).toEqual(5);
      expect(h.gridInternals.refresh.calledOnce).toBe(false);
    });
  });
  
  describe('should listen on size change', () => {
    
    it('and react if changed', () => {
      let pagination = getComponent({size: 100, all:[100,200,300]}, ``);
      pagination.tryEnable();      
      pagination.selected = 2;
      
      h.aureliaUtils.observe.emit(pagination.options, 'size', 25, pagination.options.size);
      
      expect(pagination.selected).toEqual(1);
      expect(h.gridInternals.refresh.calledOnce).toBe(true);
    });
    
    it('and do not react if not changed', () => {
      let pagination = getComponent({size: 100, all:[100,200,300]}, ``);
      pagination.tryEnable();      
      pagination.selected = 2;
      
      h.aureliaUtils.observe.emit(pagination.options, 'size', pagination.options.size, pagination.options.size);
      
      expect(pagination.selected).toEqual(2);
      expect(h.gridInternals.refresh.calledOnce).toBe(false);
    });
    
  });
  
  it('should attach appropriate data on data source read', () => {
    let pagination = getComponent({size: 10}, ``);
    pagination.tryEnable();
    pagination.selected = 2;
    let params = <any>{};
    
    h.dataSource.subscribe.emit('DataRead', params);
    
    expect(params.page).toEqual(2);
    expect(params.pageSize).toBe(10);
  });
  
  it('should unregister correctly', () => {
    let pagination = getComponent({}, ``);
    pagination.tryEnable();
    
    pagination.stop();
    
    expect(h.dataSource.subscribe.subscribers.length).toBe(0);
    expect(h.aureliaUtils.observe.observers.length).toBe(0);
  });
  
  describe('should update buttons on data received', () => {
    
    type resultType = {
      selected: number, items: number[], total: number, buttons: any, lastPage: number
    };
    let test = (options: IPaginationOptions, result: resultType) => {
      let pagination = getComponent(options, ``);
      pagination.tryEnable();
      pagination.selected = result.selected;
      
      h.dataSource.subscribe.emit('DataReceived', {result: {
        total: result.total
      }});
      
      expect(pagination.selected).toEqual(result.selected);
      expect(pagination.items).toEqual(result.items);
      expect(pagination.buttons).toEqual(result.buttons);
      expect(pagination.lastPage).toEqual(result.lastPage);
    }
    
    it('with selected first page', () => {
      test({size: 10, range: 3}, {
        selected: 1,
        items: [1,2,3,4],
        total: 31,
        lastPage: 4,
        buttons: {
          prev: false,
          next: true,
          leftSideOutOfRange: false,
          rightSideOutOfRange: false
        }
      });
      test({size: 10, range: 3}, {
        selected: 1,
        items: [1,2,3,4],
        total: 41,
        lastPage: 5,
        buttons: {
          prev: false,
          next: true,
          leftSideOutOfRange: false,
          rightSideOutOfRange: true
        }
      });
    });
    
    it('with selected last page', () => {
      test({size: 10, range: 3}, {
        selected: 4,
        items: [1,2,3,4],
        total: 31,
        lastPage: 4,
        buttons: {
          prev: true,
          next: false,
          leftSideOutOfRange: false,
          rightSideOutOfRange: false
        }
      });
      test({size: 10, range: 3}, {
        selected: 5,
        items: [2,3,4,5],
        total: 41,
        lastPage: 5,
        buttons: {
          prev: true,
          next: false,
          leftSideOutOfRange: true,
          rightSideOutOfRange: false
        }
      });
    });
    
    it('with selected page at the middle', () => {
      test({size: 10, range: 3}, {
        selected: 4,
        items: [1,2,3,4,5,6,7],
        total: 61,
        lastPage: 7,
        buttons: {
          prev: true,
          next: true,
          leftSideOutOfRange: false,
          rightSideOutOfRange: false
        }
      });
      test({size: 10, range: 2}, {
        selected: 4,
        items: [2,3,4,5,6],
        total: 61,
        lastPage: 7,
        buttons: {
          prev: true,
          next: true,
          leftSideOutOfRange: true,
          rightSideOutOfRange: true
        }
      });
    });

  });
});

import {GridTestHelpers} from '../../unitTesting/grid/base';
import {SortingComponent, SortingBucket, ISortingBucketOptions} from './sorting';
import {sortingMode} from '../constants';
import {Column} from '../models/column';

describe('Sorting', () => {
  interface ITestColumns {
    firstName: Column;
    lastName: Column;
    age: Column;
  }
  
  function BucketOwner(){}
  
  let h: GridTestHelpers;
  let columns: ITestColumns;
  
  let getBucket = (options: ISortingBucketOptions) => {
    return new SortingBucket(options);
  }
  
  let getComponent = (codeBased: any, domBased: string) => {
    let gridOptions = h.getGridOptions(codeBased, domBased + `<columns><column field="FirstName"></column><column field="LastName"></column><column field="Age"></column></columns>`);
    gridOptions.columns = [columns.age, columns.firstName, columns.lastName];
    let subject = new SortingComponent(gridOptions, <any>h.gridInternals, <any>h.dataSource);
    subject.tryEnable();
    return subject;
  }
  
  let mode = sortingMode;

  beforeEach(() => {
    h = new GridTestHelpers();
    h.beforeEach();
    columns = {
      firstName: h.getColumn({
        field: 'FirstName'
      }),
      lastName: h.getColumn({
        field: 'LastName'
      }),
      age: h.getColumn({
        field: 'Age'
      })
    };
  });
  
  describe('component', () => {
    let component: SortingComponent;    
    
    beforeEach(() => {
      component = undefined;
    });
    
    describe('should start with', () => {
      
      it('adding main bucket', () => {
        component = getComponent({sorting: true}, ``);
        
        expect(component.buckets.length).toBe(1);
        expect(component.buckets[0].owner).toEqual(SortingComponent);
        expect(component.buckets[0].order).toBe(0);
      });
      
    });
    
    describe('should be able to save state', () => {
      
      it(``, () => {
        let state: any = {};
        component = getComponent({sorting: {mode: mode.multiple}}, ``);
        let bucket = component.getBucketByOwner(SortingComponent);
        bucket.sortBy(columns.firstName, 0, 'desc');
        bucket.sortBy(columns.lastName, 1, 'asc');
        
        component.saveState(state);
        
        expect(state.columns).toEqual([{
          id: columns.firstName.getUniqueId(),
          direction: bucket.getSortingDirection(columns.firstName)
        }, {
          id: columns.lastName.getUniqueId(),
          direction: bucket.getSortingDirection(columns.lastName)
        }]);
      });
      
      it(`and uses SortingComponent's bucket`, () => {
        let state = {};
        component = getComponent({sorting: true}, ``);
        let stub = sinon.stub(component, 'getBucketByOwner').returns({columns:[]});
        
        component.saveState(state);
        
        expect(stub.calledOnce).toBe(true);
        expect(stub.calledWithExactly(SortingComponent)).toBe(true);
      });
            
    });
    
    describe('should be able to load state', () => {
      
      it('', () => {
        component = getComponent({sorting: {mode: mode.multiple}}, ``);
        let bucket = component.getBucketByOwner(SortingComponent);
        
        component.loadState({
          columns: [{
            id: columns.lastName.getUniqueId(),
            direction: 'desc'
          }, {
            id: columns.age.getUniqueId(),
            direction: 'asc'
          }]
        });
        
        expect(bucket.getSortingDirection(columns.lastName)).toBe('desc');
        expect(bucket.getSortingDirection(columns.age)).toBe('asc');
        expect(columns.lastName.state.sortOrder).toBeLessThan(columns.age.state.sortOrder);
        expect(h.gridInternals.refresh.calledOnce).toBe(true);
      });
      
      it('and work in case if provided state is empty', () => {
        component = getComponent({sorting: true}, ``);
        
        component.loadState({columns: []});
        expect(h.gridInternals.refresh.called).toBe(false);
        
        component.loadState(<any>{});
        expect(h.gridInternals.refresh.called).toBe(false);
        
        component.loadState(undefined);
        expect(h.gridInternals.refresh.called).toBe(false);
        
        component.loadState(null);
        expect(h.gridInternals.refresh.called).toBe(false);
      });
      
    });
    
    describe('should be able to create options', () => {
      
      it('from code based settings', () => {
        component = getComponent({sorting: {mode: mode.multiple}}, ``);
        expect(component.options.mode).toBe(mode.multiple);
        
        component = getComponent({sorting: {mode: mode.single}}, ``);
        expect(component.options.mode).toBe(mode.single);
      });
      
      it('from code based settings', () => {
        component = getComponent({}, `<sorting mode="multiple"></sorting>`);
        expect(component.options.mode).toBe(mode.multiple);
        
        component = getComponent({}, `<sorting mode="single"></sorting>`);
        expect(component.options.mode).toBe(mode.single);
      });
      
      it('use default options as a fallback plan', () => {
        component = getComponent({sorting: true}, ``);
        expect(component.options.mode).toBe(component.defaultOptions.mode);
      });
      
      it('when configuration is not available', () => {
        component = getComponent({}, ``);
        expect(component.options).toBeFalsy();
      });
      
    });
    
    describe('on data read should', () => {
            
      it('use all buckets to create params', () => {
        let params: any = {};
        component = getComponent({ sorting: true }, ``);
        let componentBucket = component.getBucketByOwner(SortingComponent);
        componentBucket.sortBy(columns.age, 0, 'desc');
        let customBucket = component.addBucket(BucketOwner, -1, {
          alwaysSorted: true,
          mode: mode.multiple
        });
        customBucket.sortBy(columns.firstName, 0, 'asc');
        customBucket.sortBy(columns.lastName, 1, 'desc');
        
        h.dataSource.subscribe.emit('DataRead', params);
        
        expect(params.sortBy.length).toBe(3);
        expect(params.sortBy[0].column).toBe(columns.firstName);
        expect(params.sortBy[0].direction).toBe('asc');
        expect(params.sortBy[1].column).toBe(columns.lastName);
        expect(params.sortBy[1].direction).toBe('desc');
        expect(params.sortBy[2].column).toBe(columns.age);
        expect(params.sortBy[2].direction).toBe('desc');
      });
      
      it('work without any sorting applies', () => {
        let params: any = {};
        component = getComponent({ sorting: true }, ``);
        
        h.dataSource.subscribe.emit('DataRead', params);
        
        expect(params.sortBy.length).toBe(0);
      });
      
    });
    
    describe('onColumnClicked method should', () => {
      
      it('start sorting with default sorting bucket', () => {
        component = getComponent({ sorting: true }, ``);
        columns.firstName.other.sortable = true;
        component.sortOrder = 99;
        
        (<any>component)._onColumnClicked(columns.firstName);
        
        expect(columns.firstName.state.sortOrder).toBe(100);
        expect(columns.firstName.state.sortByDirection).toBe('asc');
        expect(h.gridInternals.refresh.calledOnce).toBe(true);
      });
      
      it('go to next sorting state if column already sorted with default sorting bucket', () => {
        component = getComponent({ sorting: true }, ``);
        columns.firstName.other.sortable = true;
        component.sortOrder = 99;
        (<any>component)._onColumnClicked(columns.firstName);
        
        (<any>component)._onColumnClicked(columns.firstName);
        
        expect(columns.firstName.state.sortOrder).toBe(100);
        expect(columns.firstName.state.sortByDirection).toBe('desc');
        expect(h.gridInternals.refresh.calledTwice).toBe(true);
      });
      
      it('do nothing if column is not sortable', () => {
        component = getComponent({ sorting: true }, ``);
        
        let test = (sortable: any) => {
          columns.firstName.other.sortable = sortable;
          (<any>component)._onColumnClicked(columns.firstName);
          expect(h.gridInternals.refresh.called).toBe(false);
        };
        
        test('false');
        test(undefined);
        test(false);
      });
      
    });
    
    describe('addBucket method', () => {      
      it('should add bucket', () => {
        component = getComponent({ sorting: true }, ``);
        let options = {
          alwaysSorted: true,
          mode: mode.multiple
        };
        
        let bucket = component.addBucket(BucketOwner, 0, options);
        
        expect(component.buckets.length).toBe(2);
        expect(component.buckets[1].bucket).toBe(bucket);
        expect(component.buckets[1].owner).toBe(BucketOwner);
        expect(component.buckets[1].order).toBe(0);
      });
      
      it('should refresh order', () => {
        component = getComponent({ sorting: true }, ``);
        let options = {
          alwaysSorted: true,
          mode: mode.multiple
        };
        
        let bucket1 = component.addBucket(BucketOwner, -1, options);
        let bucket2 = component.addBucket(BucketOwner, 1, options);
        
        expect(component.buckets.length).toBe(3);
        expect(component.buckets[0].bucket).toBe(bucket1);
        expect(component.buckets[2].bucket).toBe(bucket2);
      });
      
    });
    
    describe('getBucketByColumn method', () => {
      
      it('should get bucket which contains given column', () => {
        component = getComponent({ sorting: true }, ``);
        let bucket = component.addBucket(BucketOwner, 1, {
          alwaysSorted: true,
          mode: mode.single
        });
        bucket.addColumn(columns.lastName);
        
        let result = component.getBucketByColumn(columns.lastName);
        
        expect(result).toBe(bucket);
      });
      
      it('should return undefined if bucket not found', () => {
        component = getComponent({ sorting: true }, ``);
        
        let result = component.getBucketByColumn(columns.lastName);
        
        expect(result).toBeUndefined();
      });
      
    });
    
    describe('getBucketByOwner method', () => {
      
      it('should get bucket using given owner', () => {
        component = getComponent({ sorting: true }, ``);
        let bucket = component.addBucket(BucketOwner, 1, {
          alwaysSorted: true,
          mode: mode.single
        });
        
        let result = component.getBucketByOwner(BucketOwner);
        
        expect(result).toBe(bucket);
      });
      
      it('should return undefined if bucket not found', () => {
        component = getComponent({ sorting: true }, ``);
        
        let result = component.getBucketByOwner(BucketOwner);
        
        expect(result).toBeUndefined();
      });
      
    });
    
    it('should unregister correctly', () => {
      component = getComponent({ sorting: true }, ``);
      
      expect(h.gridInternals.subscribe.subscribers.length).toBeGreaterThan(0);
      expect(h.dataSource.subscribe.subscribers.length).toBeGreaterThan(0);
      
      component.stop();
      
      expect(h.gridInternals.subscribe.subscribers.length).toBe(0);
      expect(h.dataSource.subscribe.subscribers.length).toBe(0);
    });
    
  });  
  
	describe('bucket', () => {
		let bucket: SortingBucket;
    
    let validate = (column: Column, index: number, order: number, direction: string) => {
      expect(bucket.columns[index]).toBe(column);
      expect(column.state.sortOrder).toBe(order);
      expect(bucket.getSortingDirection(column)).toBe(direction);
      expect(column.hasClass('m-grid-sort-' + direction)).toBe(true);
      expect(column.hasClass('m-grid-sort-' + (direction === 'asc' ? 'desc' : 'asc'))).toBe(false);  
    }
    
    describe('sortBy method should', () => {
      
      it('apply sorting to the column with multiple mode', () => {
        bucket = getBucket({mode: mode.multiple, alwaysSorted: undefined});
        
        bucket.sortBy(columns.lastName, 3, 'desc');
        bucket.sortBy(columns.firstName, 0, 'asc');
        bucket.sortBy(columns.age, 1, 'asc');
        
        expect(bucket.columns.length).toBe(3);
        validate(columns.lastName, 0, 3,'desc');
        validate(columns.firstName, 1, 0,'asc');
        validate(columns.age, 2, 1,'asc');
      });
      
      it('apply sorting to the column with single mode', () => {
        bucket = getBucket({mode: mode.single, alwaysSorted: undefined});
        
        bucket.sortBy(columns.lastName, 3, 'desc');
        bucket.sortBy(columns.firstName, 0, 'asc');
        bucket.sortBy(columns.age, 1, 'asc');
        
        expect(bucket.columns.length).toBe(1);
        validate(columns.age, 0, 1,'asc');
      });
      
      it('use previous sorted direction as default if has been already sorted', () => {
        bucket = getBucket({mode: mode.single, alwaysSorted: undefined});
        bucket.sortBy(columns.lastName, 1, 'desc');
        
        bucket.sortBy(columns.lastName, 3, undefined);
        
        validate(columns.lastName, 0, 3,'desc');
      });
      
      it('use "asc" direction if other not specified', () => {
        bucket = getBucket({mode: mode.single, alwaysSorted: undefined});
        
        columns.lastName.state.sortOrder = 1;
        bucket.sortBy(columns.lastName, 3, undefined);
        
        validate(columns.lastName, 0, 3,'asc');
      });
      
    });
    
    describe('nextSortingDirectionOn method should', () => {
      
      it('switch from "asc" to "desc" direction', () => {
        bucket = getBucket({mode: mode.single, alwaysSorted: undefined});
        bucket.sortBy(columns.firstName, 1, 'asc');
        
        bucket.nextSortingDirectionOn(columns.firstName);
        
        expect(bucket.getSortingDirection(columns.firstName)).toBe('desc');
      });
      
      it('switch from "desc" to "asc" direction if alwaysSorted option is enabled', () => {
        bucket = getBucket({mode: mode.single, alwaysSorted: true});
        bucket.sortBy(columns.firstName, 1, 'desc');
        
        bucket.nextSortingDirectionOn(columns.firstName);
        
        expect(bucket.getSortingDirection(columns.firstName)).toBe('asc');
      });
      
      it('switch clear from "desc" direction if alwaysSorted option is disabled', () => {
        bucket = getBucket({mode: mode.single, alwaysSorted: false});
        bucket.sortBy(columns.firstName, 1, 'desc');
        
        bucket.nextSortingDirectionOn(columns.firstName);
        
        expect(!!bucket.getSortingDirection(columns.firstName)).toBe(false);
      });
      
      it('do nothing if column is not in the bucket', () => {
        bucket = getBucket({mode: mode.single, alwaysSorted: false});
        
        bucket.nextSortingDirectionOn(columns.firstName);
        
        expect(bucket.columns.length).toBe(0);
        expect(columns.firstName.headerClass).toBe('');
      });
      
    });
    
    it('hasSortingApplied method should determine if sorting has been applied to the column', () => {
      bucket = getBucket({mode: mode.single, alwaysSorted: false});
      bucket.sortBy(columns.firstName, 1, 'desc');
      bucket.sortBy(columns.age, 2, 'asc');
      
      expect(bucket.hasSortingApplied(columns.firstName)).toBe(false);
      expect(bucket.hasSortingApplied(columns.lastName)).toBe(false);
      expect(bucket.hasSortingApplied(columns.age)).toBe(true);
    });
    
    describe('addColumn method should', () => {
      it('add new column', () => {
        bucket = getBucket({mode: mode.single, alwaysSorted: undefined});
        
        bucket.addColumn(columns.age);
        
        expect(bucket.columns.length).toBe(1);
        expect(bucket.columns).toContain(columns.age);
      });
      
      it('do nothing if column has been already added', () => {
        bucket = getBucket({mode: mode.single, alwaysSorted: undefined});
        bucket.addColumn(columns.age);
        
        bucket.addColumn(columns.age);
        
        expect(bucket.columns.length).toBe(1);
        expect(bucket.columns).toContain(columns.age);
      });
    });
    
    describe('removeColumn method should', () => {
      it('remove existing column', () => {
        bucket = getBucket({mode: mode.single, alwaysSorted: undefined});
        bucket.addColumn(columns.age);
        
        bucket.removeColumn(columns.age);
        
        expect(bucket.columns.length).toBe(0);
        expect(bucket.columns).not.toContain(columns.age);
      });
      
      it('do nothing if column is not in the bucket', () => {
        bucket = getBucket({mode: mode.single, alwaysSorted: undefined});
        
        bucket.removeColumn(columns.age);
        
        expect(bucket.columns.length).toBe(0);
        expect(bucket.columns).not.toContain(columns.age);
      });
    });
    
    describe('hasColumn method should', () => {
      it('return true if column in the bucket', () => {
        bucket = getBucket({mode: mode.single, alwaysSorted: undefined});
        bucket.addColumn(columns.age);
        
        let result = bucket.hasColumn(columns.age);
        
        expect(result).toBe(true);
      });
      
      it('return false if column is not in the bucket', () => {
        bucket = getBucket({mode: mode.single, alwaysSorted: undefined});
        
        let result = bucket.hasColumn(columns.age);
        
        expect(result).toBe(false);
      });
    });
    
	});
  
});

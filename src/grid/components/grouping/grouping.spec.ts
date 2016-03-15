import {GridTestHelpers} from '../../../unitTesting/grid/base';
import {GroupingComponent} from './grouping';
import {ColumnReorderingComponent} from '../column-reordering';
import {SortingComponent} from '../sorting';

describe('Grouping component', () => {
  let h: GridTestHelpers;
  
  let getComponent = (codeBased: any, domBased: string) => {
    let gridOptions = h.getGridOptions(codeBased, domBased + `<columns><column field="Name"></column></columns>`);
    let subject = new GroupingComponent(<any>h.components, gridOptions, <any>h.gridInternals);
    subject.tryEnable();
    return subject;
  }
  
  beforeEach(() => {
    h = new GridTestHelpers();
    h.beforeEach();
    
    let reorderingRegistration = {
      enable: sinon.spy()
    };
    let sortingRegistration = {
      instance: {
        addBucket: sinon.spy()
      },
      enable: sinon.spy()
    };
    
    h.components.get.for(ColumnReorderingComponent, reorderingRegistration);
    h.components.get.for(SortingComponent, sortingRegistration);
  });
  
  describe('should be able to create options', () => {

    it('from DOM based settings', () => {
      let grouping = getComponent({}, `<grouping></grouping>`);
      expect(grouping.options).toBeTruthy();

      grouping = getComponent({}, `<test></test>`);
      expect(grouping.options).toBeFalsy();
    });

    it('from code based settings', () => {
      let grouping = getComponent({ grouping: true }, ``);
      expect(grouping.options).toBeTruthy();

      grouping = getComponent({ test: true }, ``);
      expect(grouping.options).toBeFalsy();
      
      grouping = getComponent({ grouping: false }, ``);
      expect(grouping.options).toBeFalsy();
    });

  });
  
});
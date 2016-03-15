import {GridTestHelpers} from '../../../unitTesting/grid/base';
import {QueryLanguageComponent} from './query-language';

describe('QueryLanguage component', () => {
  let h: GridTestHelpers;
  
  let getComponent = (codeBased: any, domBased: string) => {
    let gridOptions = h.getGridOptions(codeBased, domBased + `<columns><column field="Name"></column></columns>`);
    let subject = new QueryLanguageComponent(gridOptions, <any>h.gridInternals, <any>h.dataSource, <any>h.components);
    subject.tryEnable();
    return subject;
  }
  
  beforeEach(() => {
    h = new GridTestHelpers();
    h.beforeEach();
  });
  
  describe('should be able to create options', () => {

    it('from DOM based settings', () => {
      let ql = getComponent({}, `<query-language></query-language>`);
      expect(ql.options).toBeTruthy();
      expect(ql.options.autoComplete).toBe(false);

      ql = getComponent({}, `<query-language auto-complete="foo"></query-language>`);
      expect(ql.options).toBeTruthy();
      expect(ql.options.autoComplete).toBe('foo');

      ql = getComponent({}, `<test></test>`);
      expect(ql.options).toBeFalsy();
    });

    it('from code based settings', () => {
      let ql = getComponent({ queryLanguage: true }, ``);
      expect(ql.options).toBeTruthy();
      expect(ql.options.autoComplete).toBe(false);
      
      ql = getComponent({ queryLanguage: { autoComplete: 'foo' } }, ``);
      expect(ql.options).toBeTruthy();
      expect(ql.options.autoComplete).toBe('foo');
      
      ql = getComponent({ test: true }, ``);
      expect(ql.options).toBeFalsy();
      
      ql = getComponent({ toolbox: false }, ``);
      expect(ql.options).toBeFalsy();
    });

  });
  
});
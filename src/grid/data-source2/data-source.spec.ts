import {GridTestHelpers} from '../../unitTesting/grid/base';
import {DataSource} from './data-source';

describe('DataSource', () => {
  let h: GridTestHelpers;
  let get = (codeBased: any, domBased: string) => {
    let gridOptions = h.getGridOptions({ dataSource: codeBased }, `<m-grid>${domBased}</m-grid>`);
    return new DataSource(gridOptions, <any>h.gridInternals);
  }

  beforeEach(() => {
    h = new GridTestHelpers();
    h.beforeEach();
  });

  describe('createOptions method', () => {
    it('should create options from DOM', () => {
      //let ds = get({}, '<data-source></data-source>');
    });
  });
});

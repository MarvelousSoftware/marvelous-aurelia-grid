import {GridTestHelpers} from '../../../unitTesting/grid/base';
import {ToolboxComponent} from './toolbox';

describe('Toolbox component', () => {
  let h: GridTestHelpers;
  
  let getComponent = (codeBased: any, domBased: string) => {
    let gridOptions = h.getGridOptions(codeBased, domBased + `<columns><column field="Name"></column></columns>`);
    let subject = new ToolboxComponent(gridOptions);
    subject.tryEnable();
    return subject;
  }
  
  beforeEach(() => {
    h = new GridTestHelpers();
    h.beforeEach();
  });
  
  describe('addButton method', () => {
    it('should add buttons', () => {
      let toolbox = getComponent({}, `<toolbox></toolbox>`);
      let b1 = { text: 'foo', click: () => { } };
      let b2 = { text: 'foo', click: () => { } };
      
      toolbox.addButton(b1);
      toolbox.addButton(b2);
      
      expect(toolbox.buttons).toContain(b1);
      expect(toolbox.buttons).toContain(b2);
    });
    
    it('should throw if required field is missing', () => {
      let toolbox = getComponent({}, `<toolbox></toolbox>`);
      
      let act = () => { toolbox.addButton(<any>{}) };
      
      expect(act).toThrowError(`Missing text or click handler.`);
    });
  });
  
  describe('should be able to create options', () => {

    it('from DOM based settings', () => {
      let toolbox = getComponent({}, `<toolbox></toolbox>`);
      expect(toolbox.options).toBeTruthy();

      toolbox = getComponent({}, `<test></test>`);
      expect(toolbox.options).toBeFalsy();
    });

    it('from code based settings', () => {
      let toolbox = getComponent({ toolbox: true }, ``);
      expect(toolbox.options).toBeTruthy();

      toolbox = getComponent({ test: true }, ``);
      expect(toolbox.options).toBeFalsy();
      
      toolbox = getComponent({ toolbox: false }, ``);
      expect(toolbox.options).toBeFalsy();
    });

  });
  
});
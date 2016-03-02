import {inject} from 'aurelia-dependency-injection';
import {GridComponent} from '../pluginability';
import {DataSource} from '../dataSource/dataSource';
import {GridInternals} from '../gridInternals';
import {GridOptions} from '../gridOptions';
import {Column} from '../models/column';
import {AureliaUtils} from 'marvelous-aurelia-core/aureliaUtils';

@inject(DataSource, AureliaUtils, GridInternals, GridOptions, Column)
export class FilterRowComponent extends GridComponent {
  options: {} | boolean;
  type: string;
  nullable: boolean;
  
  selectedCompareOperator: ICompareOperator;
  compareOperators: ICompareOperator[] = [];
  compareText: string;
    
  allCompareOperators: {[key:string]: ICompareOperator} = {
    'Equal': {
      name: 'Equal',
      value: 'equals',
      textRequired: true
    },
    'NotEqual': {
      name: 'NotEqual',
      value: 'not equals',
      textRequired: true
    },
    'Empty': {
      name: 'Empty',
      value: 'is empty',
      textRequired: false
    },
    'NotEmpty': {
      name: 'NotEmpty',
      value: 'is not empty',
      textRequired: false
    },
    'StartsWith': {
      name: 'StartsWith',
      value: 'starts with',
      textRequired: true
    },
    'EndsWith': {
      name: 'EndsWith',
      value: 'ends with',
      textRequired: true
    },
    'Contains': {
      name: 'Contains',
      value: 'contains',
      textRequired: true
    },
    'GreaterThan': {
      name: 'GreaterThan',
      value: 'greater than',
      textRequired: true
    },
    'GreaterThanOrEqual': {
      name: 'GreaterThanOrEqual',
      value: 'greater than or equal',
      textRequired: true
    },
    'LessThan': {
      name: 'LessThan',
      value: 'less than',
      textRequired: true
    },
    'LessThanOrEqual': {
      name: 'LessThanOrEqual',
      value: 'less than or equal',
      textRequired: true
    },
    'IsTrue': {
      name: 'IsTrue',
      value: 'is true',
      textRequired: false
    },
    'IsFalse': {
      name: 'IsFalse',
      value: 'is false',
      textRequired: false
    }
  };

  private _lastSubmittedCompareOperator: ICompareOperator;
  private _lastSubmittedCompareText: string;
  private _prevCompareOperator: ICompareOperator;  

  constructor(private _dataSource: DataSource, private _aureliaUtils: AureliaUtils, private _gridInternals: GridInternals,
  private _gridOptions: GridOptions, private _column: Column) {
    super();
  }

  start() {
    this.type = this._column.other.type || 'string';
    this.nullable = this._column.other.nullable !== undefined ? this._column.other.nullable !== 'false' : true;
    this.compareOperators = this._getCompareOperators(this.type, this.nullable);
    
    this.subs = [
      this._dataSource.subscribe('DataRead', params => this._onDataRead(params)),
      this._aureliaUtils.observe(this, 'selectedCompareOperator', (n,o) => { this._selectedCompareOperatorChanged(n,o); })
    ]
  }

  saveState(state) {
    if(!this.selectedCompareOperator && !this.compareText) {
      return;
    }
  
    state[this._column.getUniqueId()] = {
      selectedCompareOperator: this.selectedCompareOperator,
      compareText: this.compareText
    }
  }
  
  loadState(state) {
    let filtering: IFilterRowState = state[this._column.getUniqueId()];
    
    if(!filtering) {
      return;
    }
    
    if(filtering.selectedCompareOperator) {
      this.selectCompareOperator(filtering.selectedCompareOperator.name);
    }
    
    this.compareText = filtering.compareText;
  }
  
  selectCompareOperator(name: string) {
    let operator = this.compareOperators.filter(x => x.name === name); 
    
    if(operator.length === 0){
      return;
    }
    
    this.selectedCompareOperator = operator[0];
  }

  private _onDataRead(params: any) {
    if(!this.selectedCompareOperator) {
      return;
    }
    
    if(this.selectedCompareOperator.textRequired && !this.compareText) {
      return;
    }
    
    params.filtering = params.filtering || {};
    let fieldFilterings = params.filtering[this._column.field] || [];
    
    fieldFilterings.push({
      compareOperator: this.selectedCompareOperator.name,
      value: this.compareText
    });
    
    params.filtering[this._column.field] = fieldFilterings;
  }
  
  private _getCompareOperators(type: string, nullable: boolean): ICompareOperator[] {
    let operators: string[];
    
    switch(type) {
      case 'string':
        operators = ['Equal', 'NotEqual', 'StartsWith', 'EndsWith', 'Contains'];
        break;
      case 'number':
      case 'date':
        operators = ['Equal', 'NotEqual', 'GreaterThan', 'GreaterThanOrEqual', 
          'LessThan', 'LessThanOrEqual'];
        break;
      case 'boolean':
        operators = ['IsTrue', 'IsFalse'];
        break;
        
      default: 
        throw new Error(`Type '${this.type}' is not supported by filter row.`);
    }
    
    if(nullable) {
      operators.push('Empty');
      operators.push('NotEmpty');
    }
    
    return operators.map(x => this.allCompareOperators[x]);
  }
  
  refresh() {
    if(this.selectedCompareOperator.textRequired) {
      if(this._lastSubmittedCompareOperator === this.selectedCompareOperator && this._lastSubmittedCompareText === this.compareText) {
        return;
      }
      if(!this._lastSubmittedCompareText && !this.compareText) {
        // there's no text to compare and text wasn't just removed
        // so there's no need to refresh
        return;
      }
    } else {
      if(this._lastSubmittedCompareOperator === this.selectedCompareOperator) {
        // compare operator not changed
        return;
      }
    }
    
    if(!this.selectedCompareOperator && this._prevCompareOperator && this._prevCompareOperator.textRequired && !this.compareText) {
      // if previous compare operator was not used then there's no need to refresh
      // and it was not used if compareText is null and operator required it to have
      // some text
      return;
    }
    
    this._lastSubmittedCompareOperator = this.selectedCompareOperator;
    this._lastSubmittedCompareText = this.compareText;
    
    this._gridInternals.refresh();
  }
    
  private _selectedCompareOperatorChanged(newOp: ICompareOperator, oldOp: ICompareOperator) {
    if(oldOp === undefined) {
      // first call, no need to react
      return;
    }
    
    if(newOp.textRequired && !this.compareText) {
      return;
    }
    
    this._prevCompareOperator = oldOp;
    this.refresh();
    
    if(!newOp) {
      this.compareText = undefined;
    }
  }
  
  private _onCompareTextWrite(event: KeyboardEvent) {
    if(event.which === 13) {
      // on enter
      this.refresh();
      return false;
    }
    return true;
  }
  
  createOptions() {
    if(!this._gridOptions.domBased.has('filter-row') && !this._gridOptions.codeBased.filterRow) {
      return false;
    }

    if(this._column.other['row-filtering-disabled']) {
      return false;
    }
    
    if(!this._column.field) {
      return false;
    }
    
    return {};
  }
}

export interface IFilterRowState {
  selectedCompareOperator: any;
  compareText: string;
}

export interface ICompareOperator {
  name: string;
  value: string;
  
  /**
   * Indicate that compare operator needs text to compare.
   * E.g. `Equal` needs, but `IsTrue` doesn't. 
   */
  textRequired: boolean;
}
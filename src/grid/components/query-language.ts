import {inject} from 'aurelia-dependency-injection';
import {GridComponent, PaginationComponent, GridOptions, GridInternals, DataSource, ComponentsArray} from '../all';
import {IQueryLanguageOptions, QueryLanguage} from 'marvelous-aurelia-query-language'

@inject(GridOptions, GridInternals, DataSource, ComponentsArray)
export class QueryLanguageComponent extends GridComponent {
  editorOptions: IQueryLanguageOptions = {
    inlineButton: false,
    submitOnFocusOut: true
  };

  queryLanguage: QueryLanguage;

  constructor(private _gridOptions: GridOptions, private _gridInternals: GridInternals, private _dataSource: DataSource,
  private _components: ComponentsArray) {
    super();
  }

  start() {
    this.editorOptions.autoComplete = this.options.autoComplete;
    this.editorOptions.onSubmit = () => this.refresh();
    
    this.subs = [
      this._dataSource.subscribe('DataRead', params => this.onDataRead(params))
    ]
  }

  saveState(state) {    
    state.query = this.queryLanguage.query;
  }

  loadState(state) {
    this.queryLanguage.query = state.query;
  }

  onDataRead(params) {
    if(!this.queryLanguage || !this.queryLanguage.query) {
      // queryLanguage is defined if view model is attached
      return;
    }
    
    params.query = this.queryLanguage.query;
  }

  refresh() {
    let pagination = this._components.get(PaginationComponent).instance;
    pagination.selected = 1;
    return this._gridInternals.refresh();
  }

  createOptions(): any {
    if(!this._gridOptions.domBased.has('query-language') && !this._gridOptions.codeBased.queryLanguage) {
       return false;
    }
    
    let language = this._gridOptions.domBased.getSingleOrDefault('query-language');
    language.defineIfUndefined('autoComplete');
    
    return {
      autoComplete: language.get('autoComplete').evaluate() || false
    }
  }
}
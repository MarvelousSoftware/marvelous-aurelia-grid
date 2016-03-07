import {gridConfig} from './grid/config';

export function configure(aurelia, configFunc){
  aurelia.globalResources('./grid/grid');
  aurelia.globalResources('./grid/converters/translate');
  
  if(typeof configFunc === "function") {
    configFunc(gridConfig);    
  }
}

// export * from './grid/components/pagination';
// export * from './grid/components/filter-row';
// export * from './grid/components/sorting';
// export * from './grid/components/grouping';
// export * from './grid/components/query-language';
// export * from './grid/components/column-chooser';
// export * from './grid/components/toolbox';
// export * from './grid/components/column-reordering';

// export * from './grid/dataSource/dataSource';
// export * from './grid/dataSource/dataSourceManager';
// export * from './grid/dataSource/clientSideDataSource';
// export * from './grid/dataSource/serverSideDataSource';

//export * from './grid/models/column';

export {IReadContext} from './grid/dataSource/dataSource';
export {IGridConfig} from './grid/config';
export * from './grid/constants';
export * from './grid/column';
export * from './grid/grid';
export * from './grid/gridRenderer';
export * from './grid/interfaces';
export * from './grid/pluginability';
export * from './grid/gridInternals';
export * from './grid/gridOptions';
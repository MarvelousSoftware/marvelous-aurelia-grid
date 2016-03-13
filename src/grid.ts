import {gridConfig} from './grid/config';

export function configure(aurelia, configFunc){
  aurelia.globalResources('./grid/grid');
  aurelia.globalResources('./grid/converters/translate');
  
  if(typeof configFunc === "function") {
    configFunc(gridConfig);    
  }
}

export {IReadContext} from './grid/data-source/data-source';
export {IGridConfig} from './grid/config';
export * from './grid/constants';
export * from './grid/column';
export * from './grid/grid';
export * from './grid/interfaces';
export * from './grid/pluginability';
export * from './grid/grid-internals';
export * from './grid/grid-options';
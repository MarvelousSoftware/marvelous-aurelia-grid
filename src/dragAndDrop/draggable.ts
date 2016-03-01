import {customAttribute} from 'aurelia-templating';
import {inject} from 'aurelia-dependency-injection';
import {Utils} from 'marvelous-aurelia-core/utils';
import {DraggabilityCore} from './draggabilityCore';

@customAttribute('m-draggable')
@inject(Element)
export class DraggableCustomAttribute {
  subs: (()=>void)[] = [];
  
  constructor(private _element: HTMLElement) {
  }
  
  attached() {
    let handle = <HTMLElement>this._element.querySelector('[m-draggable-handle]') || this._element;
    let handles = handle.getElementsByTagName('*');
    
    let draggable = new DraggabilityCore({
      isHandle: (el: HTMLElement) => {
        if(el === handle) {
          return true;
        }
        
        for (let i = 0; i < handles.length; i++) {
          if(handles[i] === el) {
            return true;
          }
        }
        
        return false;
      },
      draggedElement: this._element
    });
    this.subs.push(draggable.register());
  }
  
  detached() {
    this.subs.forEach(x => x && x());
  }
}
import {BindingEngine} from 'aurelia-binding';
import {inject} from 'aurelia-dependency-injection';
import {Utils} from 'marvelous-aurelia-core/utils';

// TODO: deprecated, get rid of it
@inject(BindingEngine)
export class DOMSettingsReader {
  private _element: HTMLElement;
  private _bindingContext: any;
  private _settings: SettingsSlot;

  constructor(private _bindingEngine: BindingEngine) {
  }

  init(bindingContext: any, element: HTMLElement) {
    this._element = element;
    this._bindingContext = bindingContext;
    this._settings = new SettingsSlot(bindingContext, this._bindingEngine, element);
    this._parseRoot();
  }

  has(selector: string): boolean {
    return !!this.get(selector);
  }

  get(selector: string): SettingsSlot | SettingsSlot[] {
    let parts = selector.split(' ');
    let current = this._settings;

    parts.forEach(x => {
      if (current === undefined) {
        return;
      }

      current = current[x];
    });

    return current;
  }

  getSingle(selector: string): SettingsSlot {
    let setting = this.get(selector);

    if (setting === undefined) {
      return;
    }

    if (setting instanceof Array) {
      throw new Error(`Multiple settings defined for '${selector}'.`);
    }

    return <SettingsSlot>setting;
  }

  getSingleOrDefault(selector: string): SettingsSlot {
    return this.getSingle(selector) || SettingsSlot.empty(this._bindingEngine);
  }

  getMany(selector: string): SettingsSlot[] {
    let setting = this.get(selector);

    if (setting === undefined) {
      return [];
    }

    if (setting instanceof Array) {
      return setting;
    }

    return [<SettingsSlot>setting];
  }

  private _parseRoot() {
    this._parse(this._element, this._settings);
  }

  private _parse(currentElement: HTMLElement, currentSettingSlot: SettingsSlot) {
    for (let i = 0; i < currentElement.children.length; i++) {
      let element = <HTMLElement>currentElement.children[i];

      if (!element.children.length) {
        let newNodeSettings = this._createNodeSettings(element);
        let newSlotName = element.nodeName.toLowerCase();

        if (currentSettingSlot[newSlotName]) {
          if (currentSettingSlot[newSlotName] instanceof Array) {
            currentSettingSlot[newSlotName].push(newNodeSettings);
            continue;
          }

          let first = currentSettingSlot[newSlotName];
          currentSettingSlot[newSlotName] = [first, newNodeSettings];
          continue;
        }

        currentSettingSlot[newSlotName] = newNodeSettings;
        continue;
      }

      let name = element.nodeName.toLowerCase();
      currentSettingSlot.initInner(name, element);

      this._parse(element, currentSettingSlot[name]);
    }
  }

  private _createNodeSettings(element: HTMLElement) {
    let nodeSettings = new SettingsSlot(this._bindingContext, this._bindingEngine, element);

    if (!element.attributes) {
      return nodeSettings;
    }

    for (let index = 0; index < element.attributes.length; index++) {
      let attribute = element.attributes[index];

      let name = Utils.convertFromDashToLowerCamelCaseNotation(attribute.name);
      let setting = new AttributeSetting(name, this._bindingContext, attribute.value, this._bindingEngine);
      nodeSettings[setting.name] = setting;
    }

    return nodeSettings;
  }
}

export class SettingsSlot {
  static empty(bindingEngine) { return new SettingsSlot(undefined, bindingEngine, document.createElement('div')); }

  constructor(private __bindingContext: any, private __bindingEngine: BindingEngine, private __element: HTMLElement) {
  }

  getElement() {
    return this.__element;
  }

  defineIfUndefined(...names: any[]) {
    names.forEach(x => this[x] = this[x] || new AttributeSetting(x, this.__bindingContext, undefined, this.__bindingEngine));
  }

  initInner(name: string, element: HTMLElement) {
    this[name] = this[name] || new SettingsSlot(this.__bindingContext, this.__bindingEngine, element);
  }

  getAllAttributes(): AttributeSetting[] {
    let attributes = [];
    for (let key in this) {
      if (this[key] instanceof AttributeSetting) {
        attributes.push(this[key]);
      }
    }

    return attributes;
  }
  
  /**
   * Gets attribute defined in the settings slot.
   * In case if attribute with given name doesn't exist
   * a new one with undefined value is being created.
   */
  get(name: string): AttributeSetting {
    return this[name] || new AttributeSetting(name, this.__bindingContext, undefined, this.__bindingEngine);
  }
}

export class AttributeSetting {
  bindingContext: any;
  value: any;
  name: string;
  fullName: string;
  isExpression: boolean = false;

  constructor(name: string, bindingContext: any, value: any, private _bindingEngine: BindingEngine) {
    if (Utils.endsWith(name, '.bind')) {
      let bindIndex = name.lastIndexOf('.bind');
      this.name = name.substr(0, bindIndex);
      this.fullName = name;
      this.isExpression = true;
    } else {
      this.fullName = this.name = name;
    }

    this.bindingContext = bindingContext;
    this.value = value;
  }

  evaluate() {
    if (!this.isExpression) {
      return this.value;
    }

    return this._bindingEngine.parseExpression(this.value).evaluate({
      bindingContext: this.bindingContext,
      overrideContext: undefined
    }, undefined);
  }
}
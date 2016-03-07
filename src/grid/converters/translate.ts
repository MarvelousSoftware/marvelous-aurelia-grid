import {valueConverter} from 'aurelia-binding';
import {gridConfig} from '../config';

@valueConverter('mGridTranslate')
export class TranslateValueConverter {
  toView(value) {
    return this.translate(value, gridConfig.language);
  }
  
  translate(key: string, lang: string) {
    let translations = gridConfig.translations[lang];
    
    if (!!translations === false) {
      throw new Error(`Translations for '${lang}' language has been not found.`);
    }
    
    if (key in translations) {
      return translations[key];
    }
    
    if(lang !== gridConfig.fallbackLanguage) {
      return this.translate(key, gridConfig.fallbackLanguage);
    }
    
    return key;
  }
}
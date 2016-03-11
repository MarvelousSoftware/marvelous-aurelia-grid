export interface IGridConfig {
  /**
   * Current language.
   */
  language: string;
  
  /**
   * If current language has missing keys then this language will be used to
   * get translations.
   */
  fallbackLanguage: string;
  
  /**
   * All available translations.
   */
  translations: any;
}

export let gridConfig: IGridConfig = {
  language: 'en-US',
  fallbackLanguage: 'en-US',
  translations: {
    'en-US': {
      'grid/no-records': 'No records found.',
      'column-chooser/title': 'Column Chooser',
      'column-chooser/empty': 'Empty',
      'column-chooser/open-button-text': 'Column Chooser',
      'grouping/info': 'Drag a column header and drop it here to group by that column',
      'filter-row/equal': 'equals',
      'filter-row/not-equal': 'not equals',
      'filter-row/empty': 'is empty',
      'filter-row/not-empty': 'is not empty',
      'filter-row/starts-with': 'starts with',
      'filter-row/ends-with': 'ends with',
      'filter-row/contains': 'contains',
      'filter-row/greater-than': 'greater than',
      'filter-row/greater-than-or-equal': 'greater than or equal',
      'filter-row/less-than': 'less than',
      'filter-row/less-than-or-equal': 'less than or equal',
      'filter-row/is-true': 'is true',
      'filter-row/is-false': 'is false'
    },
    'pl-PL': {
      'grid/no-records': 'Brak danych.',
      'column-chooser/title': 'Dodatkowe kolumny',
      'column-chooser/empty': 'Pusto',
      'column-chooser/open-button-text': 'Dodatkowe kolumny',
      'grouping/info': 'Przeciągnij i upuść kolumnę tutaj, żeby użyć grupowania',
      'filter-row/equal': 'równa się',
      'filter-row/not-equal': 'nie równa się',
      'filter-row/empty': 'jest pusta',
      'filter-row/not-empty': 'nie jest pusta',
      'filter-row/starts-with': 'zaczyna się od',
      'filter-row/ends-with': 'kończy się z',
      'filter-row/contains': 'zawiera',
      'filter-row/greater-than': 'więcej niż',
      'filter-row/greater-than-or-equal': 'więcej lub dokładnie',
      'filter-row/less-than': 'mniej niż',
      'filter-row/less-than-or-equal': 'mniej lub dokładnie',
      'filter-row/is-true': 'prawda',
      'filter-row/is-false': 'fałsz'
    }
  }
};
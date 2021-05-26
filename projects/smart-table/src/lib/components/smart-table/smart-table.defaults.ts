import { SmartTableOptions } from '../../smart-table.types';

export const SMARTTABLE_DEFAULT_OPTIONS: SmartTableOptions = {
  defaultSortOrder: { key: 'id', order: 'asc' },
  loadDataMessage: 'De rijen worden geladen…',
  noDataMessage: 'Er zijn geen rijen die aan de criteria voldoen.',
  errorMessage: 'De data kon niet opgehaald worden.',
  pageSize: 10,
  pageSizeOptions: [10, 30, 50],
  resetSortOrderOnFilter: false,
  columnDateTimeFormat: 'dd/MM/yyyy - HH:mm',
  columnDateFormat: 'dd/MM/yyyy',
};

import {SmartTableColumnConfig} from '../smart-table.types';

export function sortColumn(a: SmartTableColumnConfig, b: SmartTableColumnConfig) {
  return a.sortIndex > b.sortIndex ? 1 : a.sortIndex < b.sortIndex ? -1 : 0;
}

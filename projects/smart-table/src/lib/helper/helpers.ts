import { SmartTableColumnConfig } from '../smart-table.types';

export function sortColumn(a: SmartTableColumnConfig, b: SmartTableColumnConfig) {
  return a.orderIndex > b.orderIndex ? 1 : a.orderIndex < b.orderIndex ? -1 : 0;
}

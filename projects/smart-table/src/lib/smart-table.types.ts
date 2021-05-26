import {Cell, CellWithMetadata, OrderBy, TableColumnFormat} from '@acpaas-ui/ngx-table';
import {LocalStorageType} from '@acpaas-ui/ngx-localstorage';
import {SmartTableFilter} from './components/filter/smart-table.filter';
import {Type} from '@angular/core';

export interface IModuleConfig {
  storageType?: LocalStorageType;
  identifier?: string;
  labels?: ILabels;
  options?: {
    useLowerCaseQueryParams?: boolean,
    noConfigApiCall?: boolean,
    noExport?: boolean,
    exportWithFilters?: boolean,
  };
}

export interface ILabels {
  columnOrdering?: IOrderingLabels;
  itemCounterLabel?: { singular: string, plural: string };
  itemsPerPageLabel?: { singular: string, plural: string };
}

export interface IOrderingLabels {
  orderBefore: string;
  orderAfter: string;
}

/**
 * The smart table's configuration,
 * as returned by the /config endpoint
 */
export interface SmartTableConfig {
  baseFilters?: SmartTableDataQueryFilter[];
  columns?: SmartTableColumnConfig[];
  filters?: SmartTableFilterConfig[];
  options?: SmartTableOptions;
}

export interface SmartTableTranslationsConfig {
  moreFilters?: string;
  export?: string;
  apply?: string;
  openColumnSelector?: string;
}

/**
 * Defaults are provided if these are not specified by the /config endpoint
 * @see smart-table.defaults.ts
 */
export interface SmartTableOptions {
  defaultSortOrder?: OrderBy;
  loadDataMessage?: string;
  noDataMessage?: string;
  errorMessage?: string;
  pageSize?: number;
  /** options for the pagesize dropdown */
  pageSizeOptions?: number[];
  resetSortOrderOnFilter?: boolean;
  /**
   * default format for date/time columns
   * @see https://angular.io/api/common/DatePipe
   */
  columnDateTimeFormat?: string;
  /**
   * default format for date columns
   * @see https://angular.io/api/common/DatePipe
   */
  columnDateFormat?: string;
  storageIdentifier?: string;
  persistTableConfig?: boolean;
  translations?: SmartTableTranslationsConfig;
}

export interface SmartTableColumnConfig {
  visible: boolean;
  label: string;
  key: string;
  type: SmartTableColumnType;
  classList?: string[];
  sortPath: string;
  canHide?: boolean;
  orderIndex?: number;
}

export enum SmartTableColumnType {
  Number = 'number',
  Text = 'text',
  Date = 'date',
  DateTime = 'dateTime',
}

export interface SmartTableColumnCustomType {
  name: string;
  format?: TableColumnFormat;
  component?: Type<Cell> | CellWithMetadata;
}

export enum SmartTableFilterType {
  Select = 'select',
  Input = 'input',
  Datepicker = 'datepicker',
  SearchFilter = 'search-filter',
}

export enum SmartTableFilterDisplay {
  Generic = 'generic',
  Visible = 'visible',
  Optional = 'optional',
}

export enum SmartTableFilterOperator {
  Equal = '=',
  ILike = 'ILIKE',
  In = 'in',
}

export interface SmartTableFilterConfig {
  id: string;
  type: SmartTableFilterType;
  field?: string;
  fields?: string[];
  operator?: SmartTableFilterOperator;
  display?: SmartTableFilterDisplay;
  label: string;
  options?: any[];            // Currently applies only to filters of type 'Select'
  placeholder?: string;
  value?: string | any[];      // See ACPaaS Filter class
}

export interface Filters {
  genericFilters: SmartTableFilter;
  optionalFilters: Array<SmartTableFilter>;
  visibleFilters: Array<SmartTableFilter>;
}

export interface UpdateFilterArgs {
  filter: SmartTableFilter;
  value: string | any[];      // See ACPaaS Filter class
}

export interface SmartTableDataQuery {
  filters: SmartTableDataQueryFilter[];
  sort?: SmartTableDataQuerySortOrder;
}

export interface SmartTableDataQueryFilter {
  fields: string[];
  operator?: SmartTableFilterOperator;
  value: any;
}

export interface SmartTableDataQuerySortOrder {
  path: string;
  ascending: boolean;
}

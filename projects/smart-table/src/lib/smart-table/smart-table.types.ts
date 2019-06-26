import { Filter } from '@acpaas-ui/ngx-components/utils';
import { OrderBy, TableColumnFormat } from '@acpaas-ui/ngx-components/table';
import { Component } from '@angular/core';

export interface SmartTableOptions {
    defaultSortOrder: OrderBy;
    optionalFiltersVisible?: boolean;
    loadDataMessage: string;
    noDataMessage: string;
    pageSize: number;
    pageSizeOptions: number[];
    resetSortOrderOnFilter: boolean;
}

export enum SmartTableColumnType {
    Number = 'number',
    Text = 'text',
    Date = 'date',
    DateTime = 'dateTime'
}

export interface SmartTableColumnCustomType {
    name: string;
    format: TableColumnFormat;
    component?: Component;
}

export interface SmartTableConfig {
    baseFilters: SmartTableDataQueryFilter[];
    columns: SmartTableColumnConfig[];
    filters: SmartTableFilterConfig[];
    options: SmartTableOptions;
}

export interface SmartTableColumnConfig {
    visible: boolean;
    label: string;
    key: string;
    type: SmartTableColumnType;
    classList?: string[];
    sortPath: string;
}

export enum SmartTableFilterType {
    Select = 'select',
    Input = 'input',
    Datepicker = 'datepicker',
}

export enum SmartTableFilterDisplay {
    Generic = 'generic',
    Visible = 'visible',
    Optional = 'optional'
}

export enum SmartTableFilterOperator {
    Equal = '=',
    ILike = 'ILIKE'
}

export interface SmartTableFilterConfig {
    id: string;
    type: SmartTableFilterType;
    field: string;
    fields?: string[];
    operator?: SmartTableFilterOperator;
    display: SmartTableFilterDisplay;
    label: string;
    options?: any[];            // Currently applies only to filters of type 'Select'
    placeholder?: string;
    value: string | any[];      // See ACPaaS Filter class
}

export class SmartTableFilter extends Filter {
    type: SmartTableFilterType;
    fields: string[];
    operator?: SmartTableFilterOperator;
    label: string;
    placeholder?: string;
    disabled: boolean;
}

export interface UpdateFilterArgs {
    filter: SmartTableFilter;
    value: string | any[];      // See ACPaaS Filter class
}

export interface SmartTableDataQuery {
    filters: SmartTableDataQueryFilter[];
    sort: SmartTableDataQuerySortOrder;
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

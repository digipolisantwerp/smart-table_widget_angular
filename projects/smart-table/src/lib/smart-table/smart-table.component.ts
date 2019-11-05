import { OrderBy, TableColumn, TableComponent } from '@acpaas-ui/ngx-components/table';
import { LocalstorageService } from '@acpaas-ui/ngx-components/localstorage';
import { FlyoutService } from '@acpaas-ui/ngx-components/flyout';
import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import deepMerge from 'deepmerge';
import unionBy from 'lodash.unionby';

import { SMARTTABLE_DEFAULT_OPTIONS } from './smart-table.defaults';
import { SmartTableService } from './smart-table.service';
import {
    SmartTableColumnCustomType,
    SmartTableColumnType,
    SmartTableConfig,
    SmartTableDataQuery,
    SmartTableDataQueryFilter,
    SmartTableFilter,
    SmartTableFilterConfig,
    SmartTableFilterDisplay,
    SmartTableFilterOperator,
    SmartTableFilterType,
    SmartTableOptions,
    UpdateFilterArgs,
} from './smart-table.types';

@Component({
    selector: 'aui-smart-table',
    styleUrls: ['./smart-table.component.scss'],
    templateUrl: './smart-table.component.html'
})
export class SmartTableComponent implements AfterViewInit {
    @Input() apiUrl: string;
    @Input() httpHeaders: HttpHeaders;
    @Input() columnTypes: SmartTableColumnCustomType[] = [];
    @Input()
    set configuration(configuration: SmartTableConfig) {
        this._configuration = configuration;
        if (Array.isArray(configuration.columns) && configuration.columns.length) {
            this.baseFilters = configuration.baseFilters || [];

            if (configuration.options) {
                this.options = deepMerge(SMARTTABLE_DEFAULT_OPTIONS, configuration.options);
                this.pageSize = this.options.pageSize;
            }

            this.initColumns();
            this.initFilters();

            if (this.columns.length) {
                this.getTableData(1);
            }
        }
    }
    get configuration(): SmartTableConfig {
        return this._configuration;
    }
    private _configuration: SmartTableConfig;

    /** fires when the user selects a row */
    @Output() rowClicked = new EventEmitter<any>();

    /** @internal */
    options: SmartTableOptions = SMARTTABLE_DEFAULT_OPTIONS;

    /** @internal */
    genericFilter: SmartTableFilter;
    /** @internal */
    visibleFilters: SmartTableFilter[] = [];
    /** @internal */
    optionalFilters: SmartTableFilter[] = [];

    /** @internal Whether the optional filters are currently visible (if any exist) */
    optionalFiltersVisible = false;
    /** @internal */
    selectableColumns: TableColumn[] = [];

    private baseFilters: SmartTableDataQueryFilter[] = [];
    private dataQuery: SmartTableDataQuery = { filters: [], sort: { path: '', ascending: false } };

    /** @internal */
    @ViewChild(TableComponent) tableComponent: TableComponent;
    columns: TableColumn[] = [{ value: '', label: '' }];

    public rows: Array<any> = [];

    /** @internal */
    orderBy: OrderBy;
    /** @internal */
    curPage = 1;
    /** @internal */
    pageSize = 5;
    /** @internal */
    totalResults = 0;
    /** @internal */
    columnsSelectorVisible = false;
    /** @internal */
    rowsLoading: boolean; // Used to trigger the AUI loading row when there's no data
    /** @internal */
    pageChanging: boolean; // Used to trigger our custom overlay on top of old data
    /** @internal */
    get hasRows(): boolean {
        return !this.rowsLoading && this.totalResults > 0;
    }

    constructor(
        private dataService: SmartTableService,
        private datePipe: DatePipe,
        private flyoutService: FlyoutService,
        private localstorageService: LocalstorageService
    ) {
        this.pageSize = this.options.pageSize;
        this.rowsLoading = true;
        this.pageChanging = false;
    }

    public ngAfterViewInit() {
        if (!this.configuration || (this.configuration && !this.configuration.columns)) {
            this.dataService.getConfiguration(this.apiUrl, this.httpHeaders).subscribe(
                data => {
                    let localStorageColumns = this.localstorageService.getItem(this.getLocalStorageKey()) || [];
                    // remove unknown / removed columns
                    localStorageColumns = localStorageColumns.filter((column) =>
                        !!data.columns.find((c) => c.key === column.key)
                    );
                    data.columns = deepMerge(data.columns, localStorageColumns, { arrayMerge: this.columnsMerge });
                    this.configuration = deepMerge(data, this.configuration) as SmartTableConfig;
                },
                err => {
                    console.error('Error: could not get configuration data', err);
                }
            );
        }
    }

    private getLocalStorageKey(): string {
        return this.configuration.options.storageIdentifier;
    }

    private columnsMerge(sourceArray, destinationArray, options) {
        return unionBy(destinationArray, sourceArray, 'key');
    }

    protected initColumns() {
        this.columns = [];
        this.selectableColumns = [];
        this.configuration.columns.forEach(column => {
            const _column: TableColumn = {
                value: column.key,
                label: column.label,
                hidden: !(column.visible || column.visible == null),
                disableSorting: !column.sortPath
            };

            this.selectableColumns.push(Object.assign({}, _column));

            if (column.visible || column.visible == null) {
                if (Array.isArray(column.classList) && column.classList.length) {
                    _column.classList = column.classList;
                }

                const columnType = this.columnTypes.find(ct => ct.name === column.type);
                if (columnType) {
                    _column.format = columnType.format;
                    _column.component = columnType.component;
                } else {
                    switch (column.type) {
                        case SmartTableColumnType.DateTime: {
                            _column.format = value => this.datePipe.transform(value,
                                this.options.columnDateTimeFormat || 'dd/MM/yyyy - hh:mm');
                            break;
                        }
                        case SmartTableColumnType.Date: {
                            _column.format = value => this.datePipe.transform(value,
                                this.options.columnDateFormat || 'dd/MM/yyyy');
                            break;
                        }
                    }
                }
                this.columns.push(_column);
            }
        });
        this.resetOrderBy();
    }

    protected initFilters() {
        if (this.configuration && Array.isArray(this.configuration.filters) && this.configuration.filters.length) {
            this.visibleFilters = this.setupFilter(this.configuration.filters, SmartTableFilterDisplay.Visible);
            this.optionalFilters = this.setupFilter(this.configuration.filters, SmartTableFilterDisplay.Optional);
            this.initGenericFilter();
        }
        this.syncDataQuery();
    }

    protected createFilter(filter: SmartTableFilterConfig): SmartTableFilter {
        const _filter = new SmartTableFilter();
        _filter.id = filter.id;
        _filter.type = filter.type;
        _filter.fields = [filter.field];
        _filter.operator = filter.operator;
        _filter.label = filter.label;
        _filter.placeholder = filter.placeholder;
        _filter.options = filter.options;
        _filter.value = filter.value;
        return _filter;
    }

    protected setupFilter(filters: SmartTableFilterConfig[], type: SmartTableFilterDisplay) {
        return filters.filter(filter => filter.display === type).map(this.createFilter);
    }

    protected initGenericFilter() {
        const _genericFilter = this.configuration.filters.find(
            filter => filter.display === SmartTableFilterDisplay.Generic
        );
        if (_genericFilter) {
            this.genericFilter = new SmartTableFilter();
            this.genericFilter.id = 'generic';
            this.genericFilter.type = SmartTableFilterType.Input;
            this.genericFilter.fields = [..._genericFilter.fields];
            this.genericFilter.operator = SmartTableFilterOperator.ILike;
            this.genericFilter.label = _genericFilter.label || '';
            this.genericFilter.placeholder = _genericFilter.placeholder || '';
        }
    }

    protected getTableData(page: number, pageSize?: number) {
        this.pageChanging = !this.rowsLoading;
        this.dataService
            .getData(this.apiUrl, this.httpHeaders, this.dataQuery, page, pageSize || this.pageSize)
            .subscribe(
                data => {
                    this.rowsLoading = false;
                    this.pageChanging = false;
                    if (data._embedded) {
                        this.rows = data._embedded.resourceList;
                    }
                    if (data._page) {
                        this.curPage = parseInt(data._page.number, 10);
                        if (pageSize) {
                            this.pageSize = pageSize;
                        }
                        this.totalResults = data._page.totalElements;
                    }
                },
                err => {
                    console.error('Error: could not get table data', err);
                }
            );
    }

    protected resetOrderBy() {
        if (this.options.defaultSortOrder) {
            this.orderBy = this.options.defaultSortOrder;
        }
    }

    protected syncDataQuery() {
        if (this.orderBy) {
            const sortColumn = this.configuration.columns.find(column => column.key === this.orderBy.key);
            if (sortColumn) {
                this.dataQuery.sort = { path: sortColumn.sortPath, ascending: this.orderBy.order === 'asc' };
            }
        }

        this.dataQuery.filters = [...this.baseFilters];

        this.dataQuery.filters = [
            ...this.dataQuery.filters,
            ...this.createDataQueryFilters(this.visibleFilters),
            ...this.createDataQueryFilters(this.optionalFilters)
        ];

        const createdFilter = this.createDataQueryFilter(this.genericFilter);
        if (createdFilter) {
            this.dataQuery.filters.push(createdFilter);
        }
    }

    createDataQueryFilters(filters: SmartTableFilter[]) {
        return filters.filter(filter => filter && filter.value).map(this.createDataQueryFilter);
    }

    createDataQueryFilter(filter: SmartTableFilter) {
        if (filter && filter.value) {
            return {
                fields: filter.fields,
                operator: filter.operator,
                value: filter.operator === SmartTableFilterOperator.ILike ? `%${filter.value}%` : filter.value
            };
        }
    }

    public onPageChanged(page) {
        if (!isNaN(page)) {
            this.getTableData(parseInt(page, 10), this.pageSize);
        }
    }

    public onPageSizeChanged(pageSize) {
        if (!isNaN(pageSize)) {
            this.getTableData(1, parseInt(pageSize, 10));
        }
    }

    public onClickRow(row) {
        this.rowClicked.emit(row);
    }

    public onFilter(value: UpdateFilterArgs) {
        if (this.options.resetSortOrderOnFilter) {
            this.resetOrderBy();
        }
        this.syncDataQuery();
        this.getTableData(1);
    }

    public onOrderBy(orderBy: OrderBy) {
        this.orderBy = orderBy;
        this.syncDataQuery();
        this.getTableData(this.curPage);
    }

    public toggleOptionalFilters() {
        this.optionalFiltersVisible = !this.optionalFiltersVisible;
    }

    public exportToExcel() {
        this.pageChanging = true;
        this.dataService.getAllData(this.apiUrl, this.httpHeaders, this.dataQuery)
            .subscribe(data => {
                const exportData = this.filterOutColumns(data._embedded.resourceList);
                this.dataService.exportAsExcelFile(exportData, 'smart-table');
                this.pageChanging = false;
            });
    }

    public onColumnsSelected() {
        const clonedConfiguration = deepMerge({}, this.configuration);
        clonedConfiguration.columns = clonedConfiguration.columns.map(col => {
            col.visible = !this.selectableColumns.find(sCol => sCol.value === col.key).hidden;
            return col;
        });
        if (this.configuration.options.persistTableConfig) {
            if (!this.getLocalStorageKey()) {
                throw new Error("No 'storageIdentifier' was set to be able to persist table configuration. Please set an unique `storageIdentifier` in your BFF configuration.");
            }
            this.localstorageService.setItem(this.getLocalStorageKey(), clonedConfiguration.columns);
        }
        this.configuration = clonedConfiguration;
        this.flyoutService.close();
    }

    public toggleSelectedColumn(value) {
        const column = this.selectableColumns.find((col) => col.value === value);
        column.hidden = !column.hidden;
    }

    private filterOutColumns(data): any {
        const columnKeys = this.columns.map((col) => { return col.value });
        return data.map(d => {
            return Object.keys(d)
                .filter(key => columnKeys.indexOf(key) >= 0)
                .reduce((acc, key) => (acc[key] = d[key], acc), {})
        });
    }
}

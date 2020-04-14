import {OrderBy, TableColumn} from '@acpaas-ui/ngx-table';
import {LocalstorageService} from '@acpaas-ui/ngx-localstorage';
import {FlyoutService} from '@acpaas-ui/ngx-flyout';
import {DatePipe} from '@angular/common';
import {Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {HttpHeaders} from '@angular/common/http';

import {SMARTTABLE_DEFAULT_OPTIONS} from './smart-table.defaults';
import {SmartTableService} from './smart-table.service';
import {
  SmartTableColumnConfig,
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
import {filter, first, map, mapTo, scan, shareReplay, startWith, switchMap, takeUntil, tap} from 'rxjs/operators';
import {PROVIDE_ID} from '../indentifier.provider';
import {forkJoin, merge, Observable, Subject} from 'rxjs';

@Component({
  selector: 'aui-smart-table',
  styleUrls: ['./smart-table.component.scss'],
  templateUrl: './smart-table.component.html'
})
export class SmartTableComponent implements OnInit, OnDestroy {
  @Input() apiUrl: string;
  @Input() httpHeaders: HttpHeaders;
  @Input() columnTypes: SmartTableColumnCustomType[] = [];

  configuration$: Observable<SmartTableConfig>;

  // @Input()
  // set configuration(configuration: SmartTableConfig) {
  // }

  @Input()
  configuration;

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
  private dataQuery: SmartTableDataQuery = {filters: [], sort: {path: '', ascending: false}};

  allColumns$: Observable<TableColumn[]>;
  visibleColumns$: Observable<TableColumn[]>;
  private toggleHideColumn$: Subject<void> = new Subject();

  private destroy$ = new Subject();

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
  rowsLoading: boolean; // Used to trigger the AUI loading row when there's no data
  /** @internal */
  pageChanging: boolean; // Used to trigger our custom overlay on top of old data
  /** @internal */
  get hasRows(): boolean {
    return !this.rowsLoading && this.totalResults > 0;
  }

  // Use this to have unique ids with multiple smart table instances on one page.
  public instanceId: string = Math.random().toString(36).substr(2, 9);

  constructor(
    private dataService: SmartTableService,
    private datePipe: DatePipe,
    private flyoutService: FlyoutService,
    private localstorageService: LocalstorageService,
    @Inject(PROVIDE_ID) private storageIdentifier: string,
  ) {
    this.pageSize = this.options.pageSize;
    this.rowsLoading = true;
    this.pageChanging = false;
  }

  ngOnInit(): void {
    this.configuration$ = merge(
      this.getConfiguration(this.storageIdentifier)
    ).pipe(
      shareReplay(1)
    );

    this.allColumns$ = this.configuration$.pipe(
      first(),
      tap(() => this.selectableColumns = []),
      map((config: SmartTableConfig) => {
        return config.columns.map((column: SmartTableColumnConfig): TableColumn => {
          const _column: TableColumn = {
            value: column.key,
            label: column.label,
            hidden: !(column.visible || column.visible == null),
            disableSorting: !column.sortPath
          };
          if (column.canHide !== false) {
            this.selectableColumns.push(Object.assign({}, _column));
          }
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
          }
          return _column;
        });
      }),
      startWith([]),
      tap(() => this.resetOrderBy()),
      shareReplay(1)
    );

    // Persist columns configuration in storage
    this.toggleHideColumn$.pipe(
      takeUntil(this.destroy$),
      tap(() => this.flyoutService.close()),
      switchMap(() => this.configuration$.pipe(first())),
      filter((config: SmartTableConfig) => config.options.persistTableConfig === true && !!config.options.storageIdentifier),
      map((configuration: SmartTableConfig) => {
        configuration.columns.map(column => {
          const found = this.selectableColumns.find(c => c.value === column.key);
          if (found) {
            column.visible = !found.hidden;
          }
          return column;
        });
        return configuration;
      }),
      tap((config: SmartTableConfig) =>
        this.localstorageService.storage.setItem(config.options.storageIdentifier, JSON.stringify(config.columns)))
    ).subscribe();

    this.visibleColumns$ = merge(
      this.allColumns$,
      this.toggleHideColumn$.pipe(
        switchMap(() => this.allColumns$),
        scan((acc: Array<TableColumn>, columns: Array<TableColumn>) => {
          return columns.map(column => {
            const found = this.selectableColumns.find(c => c.value === column.value);
            if (found) {
              column.hidden = found.hidden;
            }
            return column;
          });
        }, [])
      )
    ).pipe(
      map((columns: Array<TableColumn>) => columns.filter(c => !!c && !c.hidden)),
    );

    this.configuration$.pipe(
      switchMap(() => forkJoin(
        this.initFilters()
      )),
      switchMap(() => this.getTableData(1))
    ).subscribe();
  }

  public getConfiguration(storageIdentifier: string = this.storageIdentifier): Observable<SmartTableConfig> {
    return this.dataService.getConfiguration(this.apiUrl, this.httpHeaders)
      .pipe(
        first(),
        map((configuration: SmartTableConfig) => {
          return {
            ...configuration,
            baseFilters: configuration.baseFilters || [],
            options: {
              ...SMARTTABLE_DEFAULT_OPTIONS,
              storageIdentifier,
              ...configuration.options
            }
          };
        }),
        map((configuration: SmartTableConfig) => {
          // Find columns that were saved in storage
          const localStorageColumns = (this.getLocalStorageColumns(configuration.options.storageIdentifier) || [])
            .filter((column) => !!configuration.columns.find((c) => c.key === column.key));
          const columnsNotInStorage = configuration.columns.filter(column => !localStorageColumns.some(c => c.key === column.key));
          configuration.columns = [
            ...localStorageColumns,
            ...columnsNotInStorage
          ];
          return {
            ...configuration,
            columns: [
              ...localStorageColumns,
              ...columnsNotInStorage
            ]
          };
        }),
      );
  }

  private getLocalStorageColumns(identifier) {
    const json = this.localstorageService.storage.getItem(identifier);
    try {
      return JSON.parse(json);
    } catch (err) {
      return null;
    }
  }

  protected initFilters(): Observable<void> {
    return this.configuration$.pipe(
      first(),
      filter((config: SmartTableConfig) => !!config && Array.isArray(config.filters) && config.filters.length > 0),
      tap((config: SmartTableConfig) => {
        this.visibleFilters = this.setupFilter(config.filters, SmartTableFilterDisplay.Visible);
        this.optionalFilters = this.setupFilter(config.filters, SmartTableFilterDisplay.Optional);
        this.initGenericFilter();
      }),
      switchMap(() => this.syncDataQuery()),
      first()
    );
  }

  protected setupFilter(filters: SmartTableFilterConfig[], type: SmartTableFilterDisplay) {
    return filters.filter(f => f.display === type).map((filterConfig) => {
      const _filter = new SmartTableFilter();
      _filter.id = filterConfig.id;
      _filter.type = filterConfig.type;
      _filter.fields = [filterConfig.field];
      _filter.operator = filterConfig.operator;
      _filter.label = filterConfig.label;
      _filter.placeholder = filterConfig.placeholder;
      _filter.options = filterConfig.options;
      _filter.value = filterConfig.value;
      return _filter;
    });
  }

  protected initGenericFilter() {
    this.configuration$.pipe(
      first(),
      map((config: SmartTableConfig) => config.filters.find(f => f.display === SmartTableFilterDisplay.Generic)),
      filter(f => !!f),
      tap(genericFilter => {
        this.genericFilter = new SmartTableFilter();
        this.genericFilter.id = 'generic';
        this.genericFilter.type = SmartTableFilterType.Input;
        this.genericFilter.fields = [...genericFilter.fields];
        this.genericFilter.operator = SmartTableFilterOperator.ILike;
        this.genericFilter.label = genericFilter.label || '';
        this.genericFilter.placeholder = genericFilter.placeholder || '';
      })
    ).subscribe();
  }

  protected getTableData(page: number, pageSize?: number): Observable<void> {
    this.pageChanging = !this.rowsLoading;
    return this.dataService
      .getData(this.apiUrl, this.httpHeaders, this.dataQuery, page, pageSize || this.pageSize)
      .pipe(
        tap((data) => {
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
        })
      );
  }

  protected resetOrderBy() {
    if (this.options.defaultSortOrder) {
      this.orderBy = this.options.defaultSortOrder;
    }
  }

  protected syncDataQuery(): Observable<void> {
    return this.configuration$.pipe(
      first(),
      tap(() => {
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
      }),
      tap((config: SmartTableConfig) => {
        if (!this.orderBy) {
          return;
        }
        const sortColumn = config.columns.find(column => column.key === this.orderBy.key);
        if (!sortColumn) {
          return;
        }
        this.dataQuery.sort = {path: sortColumn.sortPath, ascending: this.orderBy.order === 'asc'};

      }),
      mapTo(undefined)
    );
  }

  createDataQueryFilters(filters: SmartTableFilter[]) {
    return filters.filter(f => f && f.value).map(this.createDataQueryFilter);
  }

  createDataQueryFilter(f: SmartTableFilter) {
    if (f && f.value) {
      return {
        fields: f.fields,
        operator: f.operator,
        value: f.operator === SmartTableFilterOperator.ILike ? `%${f.value}%` : f.value
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

  public onColumnsSelected() {
    this.toggleHideColumn$.next();
    // this.configuration$.pipe(
    //   first(),
    //   tap(() => this.flyoutService.close()),
    //   filter(config => config.options.persistTableConfig === true),
    //   filter(config => !!config.options.storageIdentifier),
    //   tap((config: SmartTableConfig) =>
    //     this.localstorageService.storage.setItem(config.options.storageIdentifier, JSON.stringify(this.allColumns$)))
    // ).subscribe();
  }

  public onClickRow(row) {
    this.rowClicked.emit(row);
  }

  public onFilter(value: UpdateFilterArgs) {
    if (this.options.resetSortOrderOnFilter) {
      this.resetOrderBy();
    }
    this.syncDataQuery().pipe(
      switchMap(() => this.getTableData(1)),
      first()
    ).subscribe();
  }

  public onOrderBy(orderBy: OrderBy) {
    this.orderBy = orderBy;
    this.syncDataQuery().pipe(
      switchMap(() => this.getTableData(this.curPage)),
      first()
    ).subscribe();
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

  public toggleSelectedColumn(value) {
    const column = this.selectableColumns.find((col) => col.value === value);
    column.hidden = !column.hidden;
  }

  private filterOutColumns(data): any {
    // TODO!
    /*
    const columnKeys = this.allColumns$.map((col) => col.value);
    return data.map(d => {
      return Object.keys(d)
        .filter(key => columnKeys.indexOf(key) >= 0)
        .reduce((acc, key) => (acc[key] = d[key], acc), {});
    });
     */
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

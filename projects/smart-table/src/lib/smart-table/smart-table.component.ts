import {OrderBy, TableColumn} from '@acpaas-ui/ngx-table';
import {LocalstorageService} from '@acpaas-ui/ngx-localstorage';
import {FlyoutService} from '@acpaas-ui/ngx-flyout';
import {DatePipe} from '@angular/common';
import {Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {HttpHeaders} from '@angular/common/http';
import {SMARTTABLE_DEFAULT_OPTIONS} from './smart-table.defaults';
import {SmartTableService} from './smart-table.service';
import {
  SmartTableColumnCustomType,
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
import {filter, first, map, mapTo, scan, shareReplay, startWith, switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {PROVIDE_ID} from '../indentifier.provider';
import {BehaviorSubject, combineLatest, merge, Observable, of, Subject} from 'rxjs';
import {TableFactory} from '../services/table.factory';

@Component({
  selector: 'aui-smart-table',
  styleUrls: ['./smart-table.component.scss'],
  templateUrl: './smart-table.component.html'
})
export class SmartTableComponent implements OnInit, OnDestroy {
  @Input() apiUrl: string;
  @Input() httpHeaders: HttpHeaders;
  @Input() columnTypes: SmartTableColumnCustomType[] = [];

  @Input()
  set configuration(value: SmartTableConfig) {
    (this.customConfiguration$ as BehaviorSubject<SmartTableConfig>).next(value);
  }

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
  selectableColumns$: Observable<TableColumn[]>;

  private baseFilters: SmartTableDataQueryFilter[] = [];
  private dataQuery: SmartTableDataQuery = {filters: [], sort: {path: '', ascending: false}};

  /**
   * Observable that contains the configuration set for the smart table.
   * This data is collected from two sources:
   *  - configuration coming from the api
   *  - manual @input() configuration that may override api configuration
   */
  configuration$: Observable<SmartTableConfig>;
  /**
   * Custom configuration that comes in with setting the @input() configuration
   */
  private customConfiguration$: Observable<SmartTableConfig> = new BehaviorSubject(null);
  /**
   * Represents all the columns that the table may contain
   */
  allColumns$: Observable<TableColumn[]>;
  /**
   * Represent the columns that are visible at the moment,
   * this array is a subset from the allColumns$ observable
   */
  visibleColumns$: Observable<TableColumn[]>;

  // Fires when the user wants to hide columns
  public toggleHideColumn$: Subject<void> = new Subject();
  // Fires when the user toggles a checkbox to hide a column.
  // This doesn't actually hide the columns but changes data
  public toggleSelectedColumn$: Subject<{ key: string }> = new Subject();

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
    private flyOutService: FlyoutService,
    private localstorageService: LocalstorageService,
    @Inject(PROVIDE_ID) private storageIdentifier: string,
    private factory: TableFactory
  ) {
    this.pageSize = this.options.pageSize;
    this.rowsLoading = true;
    this.pageChanging = false;
  }

  ngOnInit(): void {
    this.configuration$ = merge(
      this.getConfiguration(),
      this.customConfiguration$.pipe(
        filter(config => !!config),
        switchMap((customConfig) => combineLatest(of(customConfig), this.configuration$).pipe(first())),
        map(([customConfig, configuration]) => {
          // Whenever we have custom configuration coming in, override existing configuration
          return {
            ...configuration,
            ...customConfig,
            options: {
              ...configuration.options,
              ...customConfig.options
            }
          };
        })
      )
    ).pipe(
      // Every time configuration changes, get the columns from the storage again
      // (because storage identifier will most likely have changed)
      map(config => config.options.persistTableConfig ? this.getLocalStorageColumns(config) : config),
      shareReplay(1)
    );

    // Columns are extracted from configuration
    this.allColumns$ = this.configuration$.pipe(
      map((config: SmartTableConfig) =>
        config.columns.map(c => this.factory.createTableColumnFromConfig(c, this.columnTypes, this.options.columnDateFormat))),
      startWith([]),
      tap(() => this.resetOrderBy()),
      shareReplay(1)
    );

    // Persist columns configuration in storage whenever we show/hide columns
    this.toggleHideColumn$.pipe(
      takeUntil(this.destroy$),
      tap(() => this.flyOutService.close()),
      switchMap(() => combineLatest(this.configuration$, this.selectableColumns$)),
      filter(([config, selectableColumns]: [SmartTableConfig, TableColumn[]]) =>
        config.options.persistTableConfig === true && !!config.options.storageIdentifier),
      map(([configuration, selectableColumns]) => {
        configuration.columns.map(column => {
          const found = (selectableColumns as Array<TableColumn>).find(c => c.value === column.key);
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

    /**
     * Visible columns start of with all columns and then
     * will be a subset of all columns whenever the user hides/shows columns
     */
    this.visibleColumns$ = merge(
      this.allColumns$,
      this.toggleHideColumn$.pipe(
        switchMap(() => combineLatest(this.allColumns$, this.selectableColumns$).pipe((take(1)))),
        scan((acc, array) => {
          const [columns, selectableColumns] = array;
          return columns.map(column => {
            const found = selectableColumns.find(c => c.value === column.value);
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

    /**
     * Selectable Columns are all columns that are
     * set in configuration to be hideable
     */
    this.selectableColumns$ = merge(
      combineLatest(
        this.allColumns$,
        this.configuration$,
      ).pipe(
        map(([allColumns, configuration]) => {
          return (allColumns as TableColumn[]).filter(column => {
            const config = configuration.columns.find(c => c.key === column.value);
            return config.canHide !== false;
          });
        }),
      ),
      this.toggleSelectedColumn$.pipe(
        switchMap((v) => this.selectableColumns$.pipe(take(1), scan((acc, selectableColumns) => {
            const i = (selectableColumns as TableColumn[]).findIndex(c => c.value === v.key);
            if (i > -1) {
              selectableColumns[i].hidden = !selectableColumns[i].hidden;
            }
            return selectableColumns;
          }, []))
        )
      )).pipe(
      startWith([]),
      shareReplay(1),
    );

    // Start the show!
    this.configuration$.pipe(
      switchMap(() => this.initFilters()),
      switchMap(() => this.getTableData(1))
    ).subscribe();
  }

  public getConfiguration(): Observable<SmartTableConfig> {
    return this.dataService.getConfiguration(this.apiUrl, this.httpHeaders)
      .pipe(
        first(),
        map((configuration: SmartTableConfig) => {
          // Start of with default options and override
          // those with whatever options we get from the configuration
          return {
            ...configuration,
            baseFilters: configuration.baseFilters || [],
            options: {
              ...SMARTTABLE_DEFAULT_OPTIONS,
              ...configuration.options
            }
          };
        }),
        map(config => {
          // Override the storage identifier is we configured it in the module
          if (this.storageIdentifier) {
            return {
              ...config,
              options: {
                ...config.options,
                storageIdentifier: this.storageIdentifier
              }
            };
          } else {
            return config;
          }
        })
      );
  }

  public getLocalStorageColumns(configuration: SmartTableConfig) {
    const json = this.localstorageService.storage.getItem(configuration.options.storageIdentifier);
    try {
      const localStorageColumns = (JSON.parse(json) || [])
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
    } catch (error) {
      console.warn('Warning: could not parse smart table columns from storage!');
      return configuration;
    }
  }

  public initFilters(): Observable<void> {
    return this.configuration$.pipe(
      take(1),
      filter((config: SmartTableConfig) => !!config && Array.isArray(config.filters) && config.filters.length > 0),
      tap((config: SmartTableConfig) => {
        this.visibleFilters = this.setupFilter(config.filters, SmartTableFilterDisplay.Visible);
        this.optionalFilters = this.setupFilter(config.filters, SmartTableFilterDisplay.Optional);
        this.initGenericFilter();
      }),
      switchMap(() => this.syncDataQuery()),
      take(1)
    );
  }

  protected setupFilter(filters: SmartTableFilterConfig[], type: SmartTableFilterDisplay): Array<SmartTableFilter> {
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
      take(1),
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

  public getTableData(page: number, pageSize?: number): Observable<void> {
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
        }),
        take(1)
      );
  }

  protected resetOrderBy() {
    if (this.options.defaultSortOrder) {
      this.orderBy = this.options.defaultSortOrder;
    }
  }

  protected syncDataQuery(): Observable<void> {
    return this.configuration$.pipe(
      take(1),
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
      this.getTableData(parseInt(page, 10), this.pageSize).subscribe();
    }
  }

  public onPageSizeChanged(pageSize) {
    if (!isNaN(pageSize)) {
      this.getTableData(1, parseInt(pageSize, 10)).subscribe();
    }
  }

  public onColumnsSelected() {
    this.toggleHideColumn$.next();
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
    this.dataService.getAllData(this.apiUrl, this.httpHeaders, this.dataQuery).pipe(
      switchMap((data) => this.filterOutColumns(data._embedded.resourceList)),
      tap(exportData => this.dataService.exportAsExcelFile(exportData, 'smart-table')),
      tap(() => this.pageChanging = false),
      first()
    ).subscribe();
  }

  public toggleSelectedColumn(value) {
    this.toggleSelectedColumn$.next({key: value});
  }

  private filterOutColumns(data): Observable<Array<TableColumn>> {
    return this.allColumns$.pipe(
      map(cols => cols.map(c => c.value)),
      map(columnKeys => {
        return data.map(d => {
          return Object.keys(d)
            .filter(key => columnKeys.indexOf(key) >= 0)
            .reduce((acc, key) => (acc[key] = d[key], acc), {});
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

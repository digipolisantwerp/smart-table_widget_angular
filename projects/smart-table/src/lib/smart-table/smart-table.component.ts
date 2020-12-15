import {OrderBy, TableColumn} from '@acpaas-ui/ngx-table';
import {LocalstorageService} from '@acpaas-ui/ngx-localstorage';
import {FlyoutService} from '@acpaas-ui/ngx-flyout';
import {DatePipe} from '@angular/common';
import {Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {SMARTTABLE_DEFAULT_OPTIONS} from './smart-table.defaults';
import {SmartTableService} from './smart-table.service';
import {
  SmartTableColumnCustomType,
  SmartTableConfig,
  SmartTableDataQuery,
  SmartTableDataQueryFilter,
  SmartTableFilterDisplay,
  SmartTableFilterOperator,
  SmartTableFilterType,
  UpdateFilterArgs,
} from './smart-table.types';
import {
  auditTime,
  catchError,
  filter,
  first,
  map,
  scan,
  share,
  shareReplay,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
  withLatestFrom
} from 'rxjs/operators';
import {PROVIDE_ID} from '../indentifier.provider';
import {BehaviorSubject, combineLatest, merge, Observable, of, Subject} from 'rxjs';
import {TableFactory} from '../services/table.factory';
import {SmartTableFilter} from '../filter/smart-table.filter';
import {selectFilters} from '../selectors/smart-table.selectors';
import {Store} from '@ngrx/store';
import {IAppState} from '../store';
import {ConstructColumns, GetConfiguration, SetCustomConfiguration, SetId} from '../store/smart-table.actions';
import {selectColumns, selectConfiguration} from '../store/smart-table.selectors';

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
    this.store.dispatch(new SetCustomConfiguration(value, this.instanceId));
  }

  /** fires when the user selects a row */
  @Output()
  rowClicked = new EventEmitter<any>();
  @Output()
  filter = new EventEmitter<SmartTableFilter[]>();

  /** @internal */
  genericFilter$: Observable<SmartTableFilter>;
  /** @internal */
  visibleFilters$: Observable<SmartTableFilter[]>;
  /** @internal */
  optionalFilters$: Observable<SmartTableFilter[]>;
  /** @internal Whether the optional filters are currently visible (if any exist) */
  optionalFiltersVisible = false;

  private dataQuery$: Observable<SmartTableDataQuery>;

  /**
   * Observable that contains the configuration set for the smart table.
   * This data is collected from two sources:
   *  - configuration coming from the api
   *  - manual @input() configuration that may override api configuration
   */
  configuration$: Observable<SmartTableConfig>;

  // All columns known to the table
  columns$: Observable<TableColumn[]>;
  // A subset of columns$, the ones that are made (in)visible by the user
  visibleColumns$: Observable<TableColumn[]>;

  public onFilterChanged$: Observable<UpdateFilterArgs>;
  public activeFilters$: Observable<Array<SmartTableFilter>>;

  private destroy$ = new Subject();

  public rows$: Observable<Array<any>>;
  public error$: Observable<HttpErrorResponse>;

  /** @internal */
  orderBy$: Subject<OrderBy> = new BehaviorSubject<OrderBy>(SMARTTABLE_DEFAULT_OPTIONS.defaultSortOrder);
  /** @internal */
  currentPage$ = new BehaviorSubject<number>(1);
  /** @internal */
  pageSize$ = new BehaviorSubject<number>(SMARTTABLE_DEFAULT_OPTIONS.pageSize);
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
    private factory: TableFactory,
    private store: Store<IAppState>
  ) {
    this.rowsLoading = true;
    this.pageChanging = false;
  }

  ngOnInit(): void {
    // Initialize our state with a table-unique identifier that
    // we will use to select portions of the state with
    this.store.dispatch(new SetId(this.instanceId));
    /*
      Observables data flow:

      Dispatch get configuration to the store:
      STORE ---> GET_CONFIGURATION
      configuration$
            +
            |
            +-> columns$ +------+
            |                      |
            +-> orderBy$ +---------+
            |                      |
            |   genericFilter$     |
            +-> visibleFilters$ +--+
                optionalFilters$   |
                                   v
                              dataQuery$
                                   +
                                   |
      pageSize$                    v
      currentPage$ +-----------> rows$ <-+ GET rows (getData)

     */

    this.configuration$ = this.store.pipe(selectConfiguration(this.instanceId));
    // Rebuild columns whenever a new configuration comes in
    this.configuration$.pipe(
      takeUntil(this.destroy$),
      tap((config) => this.store.dispatch(new ConstructColumns(config, this.instanceId, this.columnTypes)))
    ).subscribe();
    // Columns are extracted from configuration
    this.columns$ = this.store.pipe(selectColumns(this.instanceId));
    // Visible columns are a subset from all columns
    this.visibleColumns$ = this.columns$.pipe(
      map(columns => columns.filter(c => c.hidden === false))
    );

    // Filters are based on the configuration coming in
    this.optionalFilters$ = this.configuration$.pipe(selectFilters(this.factory, SmartTableFilterDisplay.Optional));
    this.visibleFilters$ = this.configuration$.pipe(selectFilters(this.factory, SmartTableFilterDisplay.Visible));
    this.genericFilter$ = this.configuration$.pipe(selectFilters(this.factory, SmartTableFilterDisplay.Generic, genericFilter => ({
        ...genericFilter,
        id: 'generic',
        type: SmartTableFilterType.Input,
        operator: SmartTableFilterOperator.ILike,
      })),
      map(filters => (filters && filters[0]) || null),
      shareReplay(1)
    );

    /**
     * Whenever a filter changes value,
     * merge all valueChanges$ of all filters
     */
    this.onFilterChanged$ = combineLatest([
      this.genericFilter$,
      this.optionalFilters$,
      this.visibleFilters$,
    ]).pipe(
      takeUntil(this.destroy$),
      filter(([a, b, c]) => !!a && !!b && !!c),
      switchMap(([genericFilter, optionalFilter, visibleFilter]: [SmartTableFilter | any, SmartTableFilter[], SmartTableFilter[]]) =>
        merge(...[genericFilter, ...optionalFilter, ...visibleFilter].map(f => f.valueChanges$))),
      takeUntil(this.destroy$),
      withLatestFrom(this.configuration$),
      map(([value, configuration]: [UpdateFilterArgs, SmartTableConfig]) => {
        this.currentPage$.next(1);
        if (configuration.options && configuration.options.resetSortOrderOnFilter) {
          this.resetOrderBy();
        }
        return value;
      }),
      share(),
    );

    /**
     * Active filters is an array of all the filters (with their values)
     * that are applied on the table at the moment. The array will be empty
     * if no filters are applied at the moment.
     */
    this.activeFilters$ = this.onFilterChanged$.pipe(
      takeUntil(this.destroy$),
      scan((accumulator: SmartTableFilter[], update: UpdateFilterArgs) => {
        const index = accumulator.findIndex(f => f.id === update.filter.id);
        if (index < 0 && !!update.value && !!update.value.length) {
          accumulator.push(update.filter);
        } else if (index >= 0 && !!update.value && !!update.value.length) {
          accumulator[index] = update.filter;
        } else {
          accumulator.splice(index, 1);
        }
        return accumulator;
      }, []),
      tap(filters => this.filter.next(filters)),
      startWith([])
    );
    // Build up the data query based on the different filters
    // A new data query will be created every time that new filters come in
    this.dataQuery$ = combineLatest([
      this.activeFilters$,
      this.configuration$,
      this.orderBy$
    ]).pipe(
      map(([activeFilters, configuration, orderBy]:
             [any, SmartTableConfig, OrderBy]) => {
        const filters = [
          ...configuration.baseFilters,
          ...this.createDataQueryFilters(activeFilters),
        ];
        return [filters, configuration, orderBy];
      }),
      map(([filters, configuration, orderBy]: [any[], SmartTableConfig, OrderBy]) => {
        if (!orderBy) {
          return {filters};
        }
        const sortColumn = configuration.columns.find(column => column.key === orderBy.key);
        if (!sortColumn) {
          return {filters};
        }
        return {
          filters,
          sort: {path: sortColumn.sortPath, ascending: orderBy.order === 'asc'}
        };
      }),
      startWith({filters: [], sort: {path: '', ascending: false}}),
    );
    // Get the data on the bases of the data query
    // or when we change the pagination
    this.rows$ = combineLatest(
      this.dataQuery$,
      this.pageSize$,
      this.currentPage$
    ).pipe(
      auditTime(100),  // Skip initial time based values, don't reset the timer after new values come in
      tap(() => this.pageChanging = !this.rowsLoading),
      switchMap(([dataQuery, pageSize, page]) =>
        this.dataService.getData(this.apiUrl, this.httpHeaders, dataQuery, page, pageSize)),
      filter(data => !!data),
      map((data) => {
        this.rowsLoading = false;
        this.pageChanging = false;
        if (data._page) {
          this.totalResults = data._page.totalElements;
        }
        return data._embedded ? data._embedded.resourceList : [];
      }),
      startWith([]),
      share()
    );

    this.error$ = this.rows$.pipe(
      catchError(err => of(err)),
      filter(err => err instanceof HttpErrorResponse)
    );

    // Start the show!!
    this.store.dispatch(new GetConfiguration(this.instanceId, this.apiUrl, this.httpHeaders, this.columnTypes));
  }

  protected resetOrderBy(defaultSortOrder?) {
    const sortOrder = defaultSortOrder || SMARTTABLE_DEFAULT_OPTIONS.defaultSortOrder;
    if (sortOrder) {
      this.orderBy$.next(sortOrder);
    }
  }

  createDataQueryFilters(filters: SmartTableFilter[]): SmartTableDataQueryFilter[] {
    return filters.filter(f => f && f.value && f.value.length).map(this.createDataQueryFilter);
  }

  createDataQueryFilter(f: SmartTableFilter): SmartTableDataQueryFilter {
    if (f && f.value && f.value.length) {
      return {
        fields: f.fields,
        operator: f.operator,
        value: f.operator === SmartTableFilterOperator.ILike ? `%${f.value}%` : f.value
      };
    }
  }

  public onPageChanged(page) {
    if (!isNaN(page)) {
      this.currentPage$.next(Number(page));
    }
  }

  public onPageSizeChanged(pageSize) {
    if (!isNaN(pageSize)) {
      this.pageSize$.next(Number(pageSize));
    }
  }

  public onClickRow(row) {
    this.rowClicked.emit(row);
  }

  public onOrderBy(orderBy: OrderBy) {
    this.orderBy$.next(orderBy);
    this.configuration$.pipe(
      take(1),
      map(obj => obj.options.storageIdentifier),
      tap(storageID => {
        return this.addToLocalStorage(storageID, 'defaultSortOrder', orderBy);
      })
    ).subscribe();
  }

  public toggleOptionalFilters() {
    this.optionalFiltersVisible = !this.optionalFiltersVisible;
  }

  public exportToExcel() {
    this.pageChanging = true;
    this.dataQuery$.pipe(
      first(),
      switchMap(dataQuery => this.dataService.getAllData(this.apiUrl, this.httpHeaders, dataQuery)),
      switchMap((data) => this.filterOutColumns(data._embedded.resourceList)),
      tap(exportData => this.dataService.exportAsExcelFile(exportData, 'smart-table')),
      tap(() => this.pageChanging = false),
      first()
    ).subscribe();
  }

  private filterOutColumns(data): Observable<Array<TableColumn>> {
    return this.columns$.pipe(
      map(cols => cols.map(c => c.value)),
      map(columnKeys => {
        return data.map(d => {
          return Object.keys(d)
            .filter(key => columnKeys.indexOf(key) >= 0)
            .reduce((acc, key) => {
              acc[key] = d[key];
              return acc;
            }, {});
        });
      })
    );
  }

  private addToLocalStorage(name: string, key: string, value: any) {
    let storageObj: any = this.localstorageService.storage.getItem(name);
    storageObj = !storageObj ? {} : JSON.parse(storageObj);
    storageObj[key] = value;
    this.localstorageService.storage.setItem(name, JSON.stringify(storageObj));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

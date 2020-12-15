import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {merge, Observable, of} from 'rxjs';
import {Action, Store} from '@ngrx/store';
import {
  AddressedAtId,
  ConstructColumns,
  GetConfiguration,
  GetConfigurationFail,
  GetConfigurationSuccess,
  InitFromStorage,
  InitFromStorageSuccess,
  SetColumns,
  SmartTableActions
} from './smart-table.actions';
import {catchError, filter, map, mapTo, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {SMARTTABLE_DEFAULT_OPTIONS} from '../smart-table/smart-table.defaults';
import {TableFactory} from '../services/table.factory';
import {TableColumn} from '@acpaas-ui/ngx-table';
import {IAppState} from './index';
import {selectColumns, selectConfiguration} from './smart-table.selectors';
import {StorageService} from '../storage/storage.service';
import {SmartTableColumnConfig} from '../smart-table/smart-table.types';
import {SmartTableService} from '../smart-table/smart-table.service';

@Injectable()
export class SmartTableEpics {
  @Effect()
  getConfiguration$: Observable<Action> = this.actions$.pipe(
    ofType(SmartTableActions.GET_CONFIGURATION),
    switchMap((action: GetConfiguration) => this.api.getConfiguration(action.apiUrl, action.headers).pipe(
      map(res => new GetConfigurationSuccess(res, action.id, action.columnTypes)),
      catchError(err => of(new GetConfigurationFail(err)))
    ))
  );

  @Effect()
  createColumns$: Observable<Action> = this.actions$.pipe(
    ofType(SmartTableActions.CONSTRUCT_COLUMNS),
    map((action: ConstructColumns) => {
      const columns: TableColumn[] = action.configuration.columns.map(c =>
        this.factory.createTableColumnFromConfig(c, action.columnTypes, SMARTTABLE_DEFAULT_OPTIONS));
      return new SetColumns(columns, action.id);
    })
  );

  @Effect()
  populateWhenConfigurationComesIn$: Observable<Action> = merge(
    this.actions$.pipe(ofType(SmartTableActions.GET_CONFIGURATION_SUCCESS)),
    this.actions$.pipe(ofType(SmartTableActions.SET_CUSTOM_CONFIGURATION)),
  ).pipe(
    // Re-init from storage after setting custom configuration because storage identifier
    // may have changed
    map((action: GetConfigurationSuccess) => new InitFromStorage(action.id))
  );

  @Effect()
  populateConfigurationFromStorage$: Observable<Action> = this.actions$.pipe(
    ofType(SmartTableActions.INIT_FROM_STORAGE),
    switchMap((action: InitFromStorage) => this.storage.getStoredConfiguration(action.id).pipe(
      tap(console.log),
      map(res => new InitFromStorageSuccess(res, action.id)),
    ))
  );

  @Effect({dispatch: false})
  persistColumns$: Observable<void> = this.actions$.pipe(
    ofType(SmartTableActions.PERSIST_COLUMNS),
    switchMap((action: AddressedAtId) => of(action).pipe(
      withLatestFrom(this.store.pipe(selectConfiguration(action.id))),
      withLatestFrom(this.store.pipe(selectColumns(action.id)))
    )),
    filter(([[action, configuration], columns]) => !!configuration
      && !!configuration.options.persistTableConfig
      && !!configuration.options.storageIdentifier),
    switchMap(([[action, configuration], columns]) => {
      const result: SmartTableColumnConfig[] = configuration.columns.map(column => {
        const found = columns.find(c => c.value === column.key);
        if (found) {
          column.visible = !found.hidden;
        }
        return column;
      });
      return this.storage.persistColumnsToLocalStorage(action.id, result);
    }),
    mapTo(undefined)
  );

  constructor(
    private actions$: Actions,
    private factory: TableFactory,
    private store: Store<IAppState>,
    private storage: StorageService,
    private api: SmartTableService) {
  }
}

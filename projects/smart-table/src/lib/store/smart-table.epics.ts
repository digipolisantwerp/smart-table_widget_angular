import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Observable, of} from 'rxjs';
import {Action, Store} from '@ngrx/store';
import {
  AddressedAtId,
  InitFromStorage,
  InitFromStorageSuccess,
  SetColumns,
  SetConfiguration,
  SmartTableActions
} from './smart-table.actions';
import {filter, map, mapTo, switchMap, withLatestFrom} from 'rxjs/operators';
import {SMARTTABLE_DEFAULT_OPTIONS} from '../smart-table/smart-table.defaults';
import {TableFactory} from '../services/table.factory';
import {TableColumn} from '@acpaas-ui/ngx-table';
import {IAppState} from './index';
import {selectColumns, selectConfiguration} from './smart-table.selectors';
import {StorageService} from '../storage/storage.service';
import {SmartTableColumnConfig} from '../smart-table/smart-table.types';

@Injectable()
export class SmartTableEpics {
  @Effect()
  createColumnsWhenConfigurationComesIn: Observable<Action> = this.actions$.pipe(
    ofType(SmartTableActions.SET_CONFIGURATION),
    map((action: SetConfiguration) => {
      const columns: TableColumn[] = action.configuration.columns.map(c =>
        this.factory.createTableColumnFromConfig(c, action.columnTypes, SMARTTABLE_DEFAULT_OPTIONS));
      return new SetColumns(columns, action.id);
    })
  );

  @Effect()
  populateConfigurationFromStorage$: Observable<Action> = this.actions$.pipe(
    ofType(SmartTableActions.INIT_FROM_STORAGE),
    switchMap((action: InitFromStorage) => of(action).pipe(
      withLatestFrom(this.store.pipe(selectConfiguration(action.id))),
      withLatestFrom(this.storage.getColumns(action.id)),
      withLatestFrom(this.storage.getSortOrder(action.id))
    )),
    filter(([[[action, configuration], columns], sortOrder]) => !!configuration.options.persistTableConfig),
    map(([[[action, config], columns], sortOrder]) => {
      // columns
      const configuration = {...config};
      const localStorageColumns = columns
        .filter((column) => !!configuration.columns.find((c) => c.key === column.key));
      const columnsNotInStorage = configuration.columns.filter(column => !localStorageColumns.some(c => c.key === column.key));
      configuration.columns = [
        ...localStorageColumns,
        ...columnsNotInStorage
      ];

      // Sort order
      if (!!sortOrder) {
        configuration.options.defaultSortOrder = sortOrder;
      }
      return new InitFromStorageSuccess(configuration, action.id);
    })
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

  constructor(private actions$: Actions, private factory: TableFactory, private store: Store<IAppState>, private storage: StorageService) {
  }
}

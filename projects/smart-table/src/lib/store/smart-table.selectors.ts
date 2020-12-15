import {createFeatureSelector, select} from '@ngrx/store';
import {combineLatest, OperatorFunction} from 'rxjs';
import {SmartTableConfig} from '../smart-table/smart-table.types';
import {filter, map} from 'rxjs/operators';
import {IAppState} from './index';
import {TableColumn} from '@acpaas-ui/ngx-table';

export const selectSmartTableState = createFeatureSelector('aui-smart-table');

export const selectConfiguration: (id: string) => OperatorFunction<any, SmartTableConfig> = (id) => source$ => {
  return combineLatest([
    source$.pipe(select(selectSmartTableState), select(state => state[id]), select(state => state.configuration)),
    source$.pipe(select(selectSmartTableState), select(state => state[id]), select(state => state.customConfiguration)),
    source$.pipe(select(selectSmartTableState), select(state => state[id]), select(state => state.configurationFromStorage)),
  ]).pipe(
    filter(([configuration, customConfiguration]) => !!configuration && !!customConfiguration),
    map(([configuration, customConfiguration, configurationFromStorage]) => {
      const config = {
        ...configuration,
        ...customConfiguration,
        options: {
          ...configuration.options,
          ...customConfiguration.options
        }
      };

      // Merge with local storage
      if (!!configurationFromStorage) {
        // Columns
        if (configurationFromStorage && configurationFromStorage.columns) {
          const localStorageColumns = configurationFromStorage.columns
            .filter((column) => !!config.columns.find((c) => c.key === column.key));
          const columnsNotInStorage = config.columns.filter(column => !localStorageColumns.some(c => c.key === column.key));
          config.columns = [
            ...localStorageColumns,
            ...columnsNotInStorage
          ];
        }


        // Sort order
        if (!!configurationFromStorage.options) {
          config.options = {
            ...config.options,
            ...configurationFromStorage.options
          };
        }
      }

      return config;
    })
  );
};

export const selectColumns: (id: string) => OperatorFunction<IAppState, TableColumn[]> = (id) => source$ => {
  return source$.pipe(
    select(selectSmartTableState),
    select(state => state[id]),
    filter(state => !!state),
    select(state => state.columns),
    filter(columns => columns && columns.length > 0),
  );
};

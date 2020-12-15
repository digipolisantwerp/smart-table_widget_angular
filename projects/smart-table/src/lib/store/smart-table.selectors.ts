import {createFeatureSelector, select} from '@ngrx/store';
import {OperatorFunction} from 'rxjs';
import {SmartTableConfig} from '../smart-table/smart-table.types';
import {filter} from 'rxjs/operators';
import {IAppState} from './index';
import {TableColumn} from '@acpaas-ui/ngx-table';

export const selectSmartTableState = createFeatureSelector('aui-smart-table');

export const selectConfiguration: (id: string) => OperatorFunction<any, SmartTableConfig> = (id) => source$ => {
  return source$.pipe(
    select(selectSmartTableState),
    select(state => state[id]),
    filter(state => !!state),
    select(state => state.configuration),
    filter(config => !!config)
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

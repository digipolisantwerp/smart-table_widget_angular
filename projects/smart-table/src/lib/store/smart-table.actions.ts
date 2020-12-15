import {Action} from '@ngrx/store';
import * as uuid from 'uuid';
import {SmartTableColumnCustomType, SmartTableConfig} from '../smart-table/smart-table.types';
import {TableColumn} from '@acpaas-ui/ngx-table';

export enum SmartTableActions {
  SET_ID = 'SMART_TABLE_SET_ID',
  INIT_FROM_STORAGE = 'SMART_TABLE_INIT_FROM_STORAGE',
  INIT_FROM_STORAGE_SUCCESS = 'SMART_TABLE_INIT_FROM_STORAGE_SUCCESS',
  SET_CONFIGURATION = 'SMART_TABLE_SET_CONFIGURATION',
  SET_COLUMNS = 'SMART_TABLE_SET_COLUMNS',
  TOGGLE_COLUMN_VISIBILITY = 'SMART_TABLE_TOGGLE_COLUMN_VISIBILITY',
  PERSIST_COLUMNS = 'SMART_TABLE_PERSIST_COLUMNS'
}

export interface AddressedAtId {
  id: string;
}

export class InitFromStorage implements Action, AddressedAtId {
  type = SmartTableActions.INIT_FROM_STORAGE;

  constructor(public id: string) {
  }
}

export class InitFromStorageSuccess implements Action, AddressedAtId {
  type = SmartTableActions.INIT_FROM_STORAGE_SUCCESS;

  constructor(public configuration: SmartTableConfig, public id: string) {
  }
}

export class SetId implements Action {
  type = SmartTableActions.SET_ID;

  constructor(public id: string = uuid.v4()) {
  }
}

export class SetConfiguration implements Action, AddressedAtId {
  type = SmartTableActions.SET_CONFIGURATION;

  public constructor(public configuration: SmartTableConfig, public id: string, public columnTypes: SmartTableColumnCustomType[]) {
  }
}

export class SetColumns implements Action, AddressedAtId {
  type = SmartTableActions.SET_COLUMNS;

  constructor(public columns: Array<TableColumn>, public id) {
  }
}

export class ToggleColumnVisibility implements Action, AddressedAtId {
  type = SmartTableActions.TOGGLE_COLUMN_VISIBILITY;

  constructor(public columnKey: string, public id) {
  }
}

export class PersistColumns implements Action, AddressedAtId {
  type = SmartTableActions.PERSIST_COLUMNS;

  constructor(public id) {
  }
}

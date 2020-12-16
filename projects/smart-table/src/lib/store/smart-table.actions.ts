import {Action} from '@ngrx/store';
import * as uuid from 'uuid';
import {SmartTableColumnCustomType, SmartTableConfig} from '../smart-table/smart-table.types';
import {TableColumn} from '@acpaas-ui/ngx-table';
import {HttpErrorResponse, HttpHeaders} from '@angular/common/http';

export enum SmartTableActions {
  SET_ID = 'SMART_TABLE_SET_ID',
  GET_CONFIGURATION = 'SMART_TABLE_GET_CONFIGURATION',
  GET_CONFIGURATION_SUCCESS = 'SMART_TABLE_GET_CONFIGURATION_SUCCESS',
  GET_CONFIGURATION_FAIL = 'SMART_TABLE_GET_CONFIGURATION_FAIL',
  CONSTRUCT_COLUMNS = 'SMART_TABLE_CONSTRUCT_COLUMNS',
  INIT_FROM_STORAGE = 'SMART_TABLE_INIT_FROM_STORAGE',
  INIT_FROM_STORAGE_SUCCESS = 'SMART_TABLE_INIT_FROM_STORAGE_SUCCESS',
  SET_CUSTOM_CONFIGURATION = 'SET_CUSTOM_CONFIGURATION',
  CONSTRUCT_COLUMNS_SUCCESS = 'SMART_TABLE_CONSTRUCT_COLUMNS_SUCCESS',
  TOGGLE_COLUMN_VISIBILITY = 'SMART_TABLE_TOGGLE_COLUMN_VISIBILITY',
  PERSIST_COLUMNS = 'SMART_TABLE_PERSIST_COLUMNS'
}

export interface AddressedAtId {
  id: string;
}

export class GetConfiguration implements Action, AddressedAtId {
  type = SmartTableActions.GET_CONFIGURATION;

  constructor(public id, public apiUrl: string, public headers: HttpHeaders, public columnTypes: SmartTableColumnCustomType[]) {
  }
}

export class ConstructColumns implements Action, AddressedAtId {
  type = SmartTableActions.CONSTRUCT_COLUMNS;

  public constructor(public configuration: SmartTableConfig, public id: string, public columnTypes: SmartTableColumnCustomType[]) {
  }
}

export class GetConfigurationSuccess implements Action, AddressedAtId {
  type = SmartTableActions.GET_CONFIGURATION_SUCCESS;

  constructor(public configuration: SmartTableConfig, public id, public columnTypes: SmartTableColumnCustomType[]) {
  }
}

export class GetConfigurationFail implements Action {
  type = SmartTableActions.GET_CONFIGURATION_FAIL;

  constructor(public error: HttpErrorResponse) {
  }
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

export class SetCustomConfiguration implements Action, AddressedAtId {
  type = SmartTableActions.SET_CUSTOM_CONFIGURATION;

  public constructor(public configuration: SmartTableConfig, public id: string) {
  }
}


export class SetColumns implements Action, AddressedAtId {
  type = SmartTableActions.CONSTRUCT_COLUMNS_SUCCESS;

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

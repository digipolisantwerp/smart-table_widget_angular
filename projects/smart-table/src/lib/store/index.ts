import {SmartTableConfig} from '../smart-table/smart-table.types';
import {TableColumn} from '@acpaas-ui/ngx-table';

export class IAppState {
  'aui-smart-table': ISmartTableState;
}

export interface ISmartTableState {
  [smartTableIdentifier: string]: {
    id: string;
    configuration: SmartTableConfig;
    columns: TableColumn[]
  };
}

import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {SmartTableColumnCustomType, SmartTableConfig} from '../smart-table/smart-table.types';
import {TableColumn} from '@acpaas-ui/ngx-table';
import {map} from 'rxjs/operators';
import {TableFactory} from './table.factory';

@Injectable()
export class ConfigurationService {
  private _config$: { [id: string]: Observable<SmartTableConfig> };

  readonly setConfiguration$ = new Subject<SmartTableConfig>();

  constructor(private factory: TableFactory) {
  }

  setConfiguration(id: string, value: Observable<SmartTableConfig>) {
    if (!this._config$) {
      this._config$ = {};
    }
    this._config$[id] = value;
  }

  getConfiguration(id: string): Observable<SmartTableConfig> {
    return this._config$[id];
  }

  getColumns(id: string, columnTypes: SmartTableColumnCustomType[]): Observable<Array<TableColumn>> {
    return this.getConfiguration(id).pipe(
      map((config: SmartTableConfig) =>
        config.columns.map(columnConfig => this.factory.createTableColumnFromConfig(columnConfig, columnTypes)))
    );
  }
}

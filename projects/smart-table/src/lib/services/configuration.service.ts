import {Injectable} from '@angular/core';
import {combineLatest, concat, merge, Observable, of, Subject} from 'rxjs';
import {SmartTableColumnCustomType, SmartTableConfig} from '../smart-table.types';
import {TableColumn} from '@acpaas-ui/ngx-table';
import {filter, first, map, shareReplay, switchMap} from 'rxjs/operators';
import {TableFactory} from './table.factory';
import {sortColumn} from '../helper/helpers';

@Injectable()
export class ConfigurationService {
  private readonly _config$: { [id: string]: Observable<SmartTableConfig> } = {};
  private readonly _setConfig$: { [id: string]: Subject<SmartTableConfig> } = {};

  constructor(private factory: TableFactory) {
  }

  initConfiguration(param: {
    id: string,
    backendCallback: () => Observable<SmartTableConfig>,
    storageCallback: (config: SmartTableConfig) => Observable<SmartTableConfig>,
    customConfiguration$: Observable<SmartTableConfig>
  }): void {
    const {id, backendCallback, storageCallback, customConfiguration$} = param;
    this._setConfig$[id] = new Subject<SmartTableConfig>();
    this._config$[id] = concat(
      backendCallback(),  // First get the default configuration
      merge(
        customConfiguration$.pipe( // And then override with configuration we get from the user
          filter(config => !!config),
          switchMap((customConfig) => combineLatest([of(customConfig), this.getConfiguration(id)]).pipe(first())),
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
          }),
          // Only override with stored configuration on custom configuration coming in
          switchMap(config => config && config.options.persistTableConfig ? storageCallback(config) : of(config))
        ),
        this._setConfig$[id]
      )
    ).pipe(
      shareReplay(1)
    );
  }

  getConfiguration(id: string): Observable<SmartTableConfig> {
    return this._config$[id];
  }

  setConfiguration(id: string, configuration: SmartTableConfig): void {
    if (!this._setConfig$[id]) {
      return;
    }
    this._setConfig$[id].next(configuration);
  }

  getColumns(id: string, columnTypes: SmartTableColumnCustomType[]): Observable<Array<TableColumn>> {
    return this.getConfiguration(id).pipe(
      map((config: SmartTableConfig) =>
        config.columns
          .sort(sortColumn)
          .map(columnConfig => this.factory.createTableColumnFromConfig(columnConfig, columnTypes, config.options)))
    );
  }
}

import {Injectable} from '@angular/core';
import {combineLatest, concat, merge, Observable, of, Subject} from 'rxjs';
import {SmartTableColumnCustomType, SmartTableConfig} from '../smart-table/smart-table.types';
import {TableColumn} from '@acpaas-ui/ngx-table';
import {filter, first, map, shareReplay, switchMap} from 'rxjs/operators';
import {TableFactory} from './table.factory';

@Injectable()
export class ConfigurationService {
  private _config$: { [id: string]: Observable<SmartTableConfig> };

  readonly setConfiguration$ = new Subject<SmartTableConfig>();

  constructor(private factory: TableFactory) {
  }

  initConfiguration(param: {
    id: string,
    backendCallback: () => Observable<SmartTableConfig>,
    storageCallback: (config: SmartTableConfig) => SmartTableConfig,
    customConfiguration$: Observable<SmartTableConfig>
  }): void {
    if (!this._config$) {
      this._config$ = {};
    }
    const {id, backendCallback, storageCallback, customConfiguration$} = param;
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
          map(storageCallback)
        ),
        this.setConfiguration$
      )
    ).pipe(
      shareReplay(1)
    );
  }

  getConfiguration(id: string): Observable<SmartTableConfig> {
    return this._config$[id];
  }

  getColumns(id: string, columnTypes: SmartTableColumnCustomType[]): Observable<Array<TableColumn>> {
    return this.getConfiguration(id).pipe(
      map((config: SmartTableConfig) =>
        config.columns.sort(c => c.sortIndex).map(columnConfig => this.factory.createTableColumnFromConfig(columnConfig, columnTypes)))
    );
  }
}

import {Observable, OperatorFunction} from 'rxjs';
import {SmartTableConfig, SmartTableFilterConfig, SmartTableFilterDisplay} from '../smart-table.types';
import {SmartTableFilter} from '../components/filter/smart-table.filter';
import {filter, map, shareReplay, startWith} from 'rxjs/operators';
import {TableFactory} from '../services/table.factory';

export const selectFilters: (factory: TableFactory, type: SmartTableFilterDisplay, mapFilterToConfig?: (filter: SmartTableFilterConfig)
  => SmartTableFilterConfig) => OperatorFunction<SmartTableConfig, Array<SmartTableFilter>>
  = (factory, type, mapFilterToConfig) => {
  return (source$: Observable<SmartTableConfig>) => source$.pipe(
    filter((config: SmartTableConfig) => !!config && Array.isArray(config.filters) && config.filters.length > 0),
    map((config: SmartTableConfig) => config.filters
      .filter(f => f.display === type)
      .map(filterConfig => factory.createSmartFilterFromConfig(mapFilterToConfig ? mapFilterToConfig(filterConfig) : filterConfig)),
    ),
    startWith([]),
    shareReplay(1),
  );
};

import {ISmartTableState} from './index';
import {
  InitFromStorageSuccess,
  SetColumns,
  SetConfiguration,
  SetId,
  SmartTableActions,
  ToggleColumnVisibility
} from './smart-table.actions';
import {TableColumn} from '@acpaas-ui/ngx-table';
import {SmartTableConfig} from '../smart-table/smart-table.types';

export function smartTableReducer(state: ISmartTableState, action) {
  switch (action.type) {
    case SmartTableActions.SET_ID:
      return {
        ...state,
        [(action as SetId).id]: {
          configuration: null
        }
      };
    case SmartTableActions.SET_CONFIGURATION: {
      const update = (action as SetConfiguration);
      return {
        ...state,
        [update.id]: {
          ...state[update.id],
          configuration: update.configuration
        }
      };
    }
    case SmartTableActions.INIT_FROM_STORAGE_SUCCESS: {
      const update = (action as InitFromStorageSuccess);
      let columns: TableColumn[] = [...state[update.id].columns];
      const configuration: SmartTableConfig = update.configuration;
      if (columns && columns.length) {
        columns = columns.map(column => {
          return {
            ...column,
            hidden: !configuration.columns.find(c => c.key === column.value).visible
          };
        });
      }
      return {
        ...state,
        [update.id]: {
          ...state[update.id],
          configuration: update.configuration,
          columns
        }
      };
    }
    case SmartTableActions.SET_COLUMNS: {
      const update = (action as SetColumns);
      return {
        ...state,
        [update.id]: {
          ...state[update.id],
          columns: update.columns
        }
      };
    }
    case SmartTableActions.TOGGLE_COLUMN_VISIBILITY: {
      const update = action as ToggleColumnVisibility;
      const columns: TableColumn[] = [...state[action.id].columns];
      const i = columns.findIndex(c => c.value === update.columnKey);
      if (i > -1) {
        columns[i].hidden = !columns[i].hidden;
      }
      return {
        ...state,
        [update.id]: {
          ...state[update.id],
          columns
        }
      };
    }
    default:
      return state;
  }
}

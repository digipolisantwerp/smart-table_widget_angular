import {ISmartTableState} from './index';
import {
  ChangeColumnSortIndex,
  GetConfigurationSuccess,
  InitFromStorageSuccess,
  SetColumns,
  SetCustomConfiguration,
  SetId,
  SmartTableActions,
  ToggleColumnVisibility
} from './smart-table.actions';
import {TableColumn} from '@acpaas-ui/ngx-table';
import {moveItemInArray} from '@angular/cdk/drag-drop';

export function smartTableReducer(state: ISmartTableState, action) {
  switch (action.type) {
    case SmartTableActions.SET_ID:
      return {
        ...state,
        [(action as SetId).id]: {
          ...state[(action as SetId).id],
          configuration: null,
          configurationFromStorage: null
        }
      };
    case SmartTableActions.GET_CONFIGURATION_SUCCESS: {
      const update = (action as GetConfigurationSuccess);
      return {
        ...state,
        [update.id]: {
          ...state[update.id],
          configuration: update.configuration
        }
      };
    }
    case SmartTableActions.SET_CUSTOM_CONFIGURATION: {
      const update = (action as SetCustomConfiguration);
      const s = state && state[update.id] ? {
        ...state[update.id],
        customConfiguration: update.configuration
      } : {customConfiguration: update.configuration};
      return {
        ...state,
        [update.id]: {...s}
      };
    }
    case SmartTableActions.INIT_FROM_STORAGE_SUCCESS: {
      const update = (action as InitFromStorageSuccess);
      /*  let columns: TableColumn[] = [...(state[update.id] && state[update.id].columns)];
        const configuration: SmartTableConfig = update.configuration;
        if (columns && columns.length) {
          columns = columns.map(column => {
            return {
              ...column,
              hidden: !configuration.columns.find(c => c.key === column.value).visible
            };
          });
        }*/
      return {
        ...state,
        [update.id]: {
          ...state[update.id],
          configurationFromStorage: {...update.configuration}
        }
      };
    }
    case SmartTableActions.CONSTRUCT_COLUMNS_SUCCESS: {
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
    case SmartTableActions.CHANGE_COLUMN_SORT_INDEX : {
      const update = action as ChangeColumnSortIndex;
      let columns = [...state[update.id].columns];
      if (!columns) {
        return state;
      }
      moveItemInArray(columns, update.previousIndex, update.newIndex);
      columns = columns.map((c, i) => ({...c, sortIndex: i}));
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

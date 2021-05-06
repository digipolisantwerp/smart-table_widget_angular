import { Injectable } from '@angular/core';
import {
  SmartTableColumnConfig,
  SmartTableColumnCustomType,
  SmartTableColumnType,
  SmartTableFilterConfig,
  SmartTableOptions
} from '../smart-table.types';
import { TableColumn } from '@acpaas-ui/ngx-table';
import { DatePipe } from '@angular/common';
import { SmartTableFilter } from '../components/filter/smart-table.filter';

@Injectable()
export class TableFactory {
  constructor(private datePipe: DatePipe) {
  }

  createTableColumnFromConfig(
    columnConfig: SmartTableColumnConfig,
    columnTypes: SmartTableColumnCustomType[],
    options?: SmartTableOptions
  ): TableColumn {
    const column: TableColumn = {
      value: columnConfig.key,
      label: columnConfig.label,
      hidden: !(columnConfig.visible || columnConfig.visible == null),
      disableSorting: !columnConfig.sortPath
    };
    if (columnConfig.visible || columnConfig.visible == null) {
      if (Array.isArray(columnConfig.classList) && columnConfig.classList.length) {
        column.classList = columnConfig.classList;
      }

      const columnType = columnTypes.find(ct => ct.name === columnConfig.type);
      if (columnType) {
        column.format = columnType.format;
        column.component = columnType.component;
      } else {
        switch (columnConfig.type) {
          case SmartTableColumnType.DateTime: {
            column.format = value => {
              let returnValue;
              try {
                returnValue = this.datePipe.transform(value, (options && options.columnDateTimeFormat) || 'dd/MM/yyyy - hh:mm');
              } catch (err) {
                returnValue = '';
              }
              return returnValue;
            };
            break;
          }
          case SmartTableColumnType.Date: {
            column.format = value => {
              let returnValue;
              try {
                returnValue = this.datePipe.transform(value, (options && options.columnDateFormat) || 'dd/MM/yyyy');
              } catch (err) {
                returnValue = '';
              }
              return returnValue;
            };
            break;
          }
        }
      }
    }
    return column;
  }

  createSmartFilterFromConfig(filterConfig: SmartTableFilterConfig): SmartTableFilter {
    return new SmartTableFilter(filterConfig);
  }
}

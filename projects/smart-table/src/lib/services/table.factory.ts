import {Injectable} from '@angular/core';
import {
  SmartTableColumnConfig,
  SmartTableColumnCustomType,
  SmartTableColumnType,
  SmartTableFilterConfig,
  SmartTableOptions
} from '../smart-table.types';
import {TableColumn} from '@acpaas-ui/ngx-table';
import {DatePipe} from '@angular/common';
import {SmartTableFilter} from '../components/filter/smart-table.filter';

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
              if (typeof value !== 'string' || this.isValidISODate(value)) {
                return this.datePipe.transform(value, (options && options.columnDateTimeFormat) || 'dd/MM/yyyy - hh:mm');
              }
              return '';
            };
            break;
          }
          case SmartTableColumnType.Date: {
            column.format = value => {
              if (typeof value !== 'string' || this.isValidDate(value) || this.isValidISODate(value)) {
                return this.datePipe.transform(value, (options && options.columnDateFormat) || 'dd/MM/yyyy');
              }
              return '';
            };
            break;
          }
        }
      }
    }
    return column;
  }


  isValidDate(dateStr: string): boolean {
    return /^\d{4}[-]\d{2}[-]\d{2}$/.test(dateStr);
  }

  isValidISODate(dateStr: string): boolean {
    return /^\d{4}[-]\d{2}[-]\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(dateStr);
  }

  createSmartFilterFromConfig(filterConfig: SmartTableFilterConfig): SmartTableFilter {
    return new SmartTableFilter(filterConfig);
  }
}

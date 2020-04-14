import {Injectable} from '@angular/core';
import {SmartTableColumnConfig, SmartTableColumnCustomType, SmartTableColumnType} from '../smart-table/smart-table.types';
import {TableColumn} from '@acpaas-ui/ngx-table';
import {DatePipe} from '@angular/common';

@Injectable()
export class TableFactory {
  constructor(private datePipe: DatePipe) {
  }

  createTableColumnFromConfig(
    columnConfig: SmartTableColumnConfig,
    columnTypes: SmartTableColumnCustomType[], format?: string): TableColumn {
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
            column.format = value => this.datePipe.transform(value,
              format || 'dd/MM/yyyy - hh:mm');
            break;
          }
          case SmartTableColumnType.Date: {
            column.format = value => this.datePipe.transform(value,
              format || 'dd/MM/yyyy');
            break;
          }
        }
      }
    }
    return column;
  }
}

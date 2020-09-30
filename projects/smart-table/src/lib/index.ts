import { SmartTableComponent } from './smart-table/smart-table.component';
import { SmartTableService } from './smart-table/smart-table.service';
import { TableDatepickerFilterComponent } from './table-datepicker-filter/table-datepicker-filter.component';
import { TableInputFilterComponent } from './table-input-filter/table-input-filter.component';
import { TableSelectFilterComponent } from './table-select-filter/table-select-filter.component';
import { TableSearchFilterComponent } from './table-search-filter/table-search-filter.component';

export const components = [
  SmartTableComponent,
  TableInputFilterComponent,
  TableSelectFilterComponent,
  TableDatepickerFilterComponent,
  TableSearchFilterComponent
];

export const services = [
  SmartTableService
];

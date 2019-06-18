import { SmartTableComponent } from './smart-table/smart-table.component';
import { SmartTableService } from './smart-table/smart-table.service';
import { TableDatepickerFilterComponent } from './table-datepicker-filter/table-datepicker-filter.component';
import { TableFilterSelectorComponent } from './table-filter-selector/table-filter-selector.component';
import { TableInputFilterComponent } from './table-input-filter/table-input-filter.component';
import { TableSelectFilterComponent } from './table-select-filter/table-select-filter.component';


export const components = [
    SmartTableComponent,
    TableFilterSelectorComponent,
    TableInputFilterComponent,
    TableSelectFilterComponent,
    TableDatepickerFilterComponent
];

export const exportComponents = [
    SmartTableComponent
];

export const services = [
    SmartTableService
];

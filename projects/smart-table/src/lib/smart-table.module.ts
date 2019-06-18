import { NgModule } from '@angular/core';
import { SmartTableComponent } from './smart-table/smart-table.component';
import { TableInputFilterComponent } from './table-input-filter/table-input-filter.component';
import { TableSelectFilterComponent } from './table-select-filter/table-select-filter.component';
import { TableFilterSelectorComponent } from './table-filter-selector/table-filter-selector.component';
import { TableDatepickerFilterComponent } from './table-datepicker-filter/table-datepicker-filter.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from '@acpaas-ui/ngx-components/table';
import { PaginationModule, ItemCounterModule } from '@acpaas-ui/ngx-components/pagination';
import { DatepickerModule } from '@acpaas-ui/ngx-components/forms';

@NgModule({
  declarations: [
    SmartTableComponent,
    TableInputFilterComponent,
    TableSelectFilterComponent,
    TableDatepickerFilterComponent,
    TableFilterSelectorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    PaginationModule,
    ItemCounterModule,
    DatepickerModule
  ],
  exports: [
    SmartTableComponent
  ]
})
export class SmartTableModule { }

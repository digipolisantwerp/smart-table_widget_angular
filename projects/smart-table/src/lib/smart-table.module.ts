import { NgModule } from '@angular/core';
import { SmartTableComponent } from './smart-table/smart-table.component';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TableModule } from '@acpaas-ui/ngx-components/table';
import { PaginationModule, ItemCounterModule } from '@acpaas-ui/ngx-components/pagination';
import { DatepickerModule } from '@acpaas-ui/ngx-components/forms';
import { components, services } from './index';

@NgModule({
  declarations: [
    ...components
  ],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    PaginationModule,
    ItemCounterModule,
    DatepickerModule,
    HttpClientModule
  ],
  providers: [
    DatePipe,
    ...services
  ],
  exports: [
    SmartTableComponent
  ]
})
export class SmartTableModule { }

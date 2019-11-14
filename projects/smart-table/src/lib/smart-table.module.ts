import { NgModule, ModuleWithProviders } from '@angular/core';
import { SmartTableComponent } from './smart-table/smart-table.component';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TableModule } from '@acpaas-ui/ngx-components/table';
import { PaginationModule, ItemCounterModule } from '@acpaas-ui/ngx-components/pagination';
import { DatepickerModule } from '@acpaas-ui/ngx-components/forms';
import { FlyoutModule } from '@acpaas-ui/ngx-components/flyout';
import { SearchFilterModule } from '@acpaas-ui/ngx-components/forms';
import { LocalstorageModule, LOCALSTORAGE_CONFIG,
         LocalstorageConfig, DEFAULT_LOCALSTORAGE_CONFIG } from '@acpaas-ui/ngx-components/localstorage';
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
    HttpClientModule,
    FlyoutModule,
    SearchFilterModule,
    LocalstorageModule
  ],
  providers: [
    DatePipe,
    ...services
  ],
  exports: [
    SmartTableComponent,
    ...components
  ]
})
export class SmartTableModule {
  static forRoot(
    localstorageConfig: LocalstorageConfig = DEFAULT_LOCALSTORAGE_CONFIG
  ): ModuleWithProviders {
    return {
      ngModule: SmartTableModule,
      providers: [
        { provide: LOCALSTORAGE_CONFIG, useValue: localstorageConfig },
        DatePipe,
        ...services
      ],
    };
  }
}

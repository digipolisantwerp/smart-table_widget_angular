import {ModuleWithProviders, NgModule} from '@angular/core';
import {SmartTableComponent} from './smart-table/smart-table.component';
import {CommonModule, DatePipe} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {ReactiveFormsModule} from '@angular/forms';
import {TableModule} from '@acpaas-ui/ngx-components/table';
import {ItemCounterModule, PaginationModule} from '@acpaas-ui/ngx-components/pagination';
import {DatepickerModule, SearchFilterModule} from '@acpaas-ui/ngx-components/forms';
import {FlyoutModule} from '@acpaas-ui/ngx-components/flyout';
import {
  DEFAULT_LOCALSTORAGE_CONFIG,
  LOCALSTORAGE_CONFIG,
  LocalstorageConfig,
  LocalstorageModule
} from '@acpaas-ui/ngx-components/localstorage';
import {components, services} from './index';

@NgModule({
  declarations: [
    ...components
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
        {provide: LOCALSTORAGE_CONFIG, useValue: localstorageConfig},
        DatePipe,
        ...services
      ],
    };
  }
}

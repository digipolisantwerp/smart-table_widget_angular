import {ModuleWithProviders, NgModule} from '@angular/core';
import {SmartTableComponent} from './components/smart-table/smart-table.component';
import {CommonModule, DatePipe} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {ReactiveFormsModule} from '@angular/forms';
import {TableModule} from '@acpaas-ui/ngx-table';
import {ITEM_COUNTER_LABEL, ItemCounterModule, ITEMS_PER_PAGE_LABEL, PaginationModule} from '@acpaas-ui/ngx-pagination';
import {DatepickerModule, SearchFilterModule} from '@acpaas-ui/ngx-forms';
import {FlyoutModule} from '@acpaas-ui/ngx-flyout';
import {components, services} from './index';
import {LOCALSTORAGE_CONFIG, LocalstorageModule} from '@acpaas-ui/ngx-localstorage';
import {IModuleConfig} from './components/smart-table/smart-table.types';
import {PROVIDE_CONFIG, PROVIDE_ID, provideLocalstorageConfig} from './indentifier.provider';
import {TableFactory} from './services/table.factory';
import {TableColumnSelectorComponent} from './components/column-selector/column-selector.component';
import {ConfigurationService} from './services/configuration.service';
import {StorageService} from './services/storage.service';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {TableInputFilterComponent} from './components/table-input-filter/table-input-filter.component';
import {TableSelectFilterComponent} from './components/table-select-filter/table-select-filter.component';
import {TableDatepickerFilterComponent} from './components/table-datepicker-filter/table-datepicker-filter.component';
import {TableSearchFilterComponent} from './components/table-search-filter/table-search-filter.component';
import {SmartTableService} from './components/smart-table/smart-table.service';

const defaultConfiguration: IModuleConfig = {
  storageType: 'localStorage',
  identifier: 'aui-smart-table',
};


@NgModule({
  declarations: [
    SmartTableComponent,
    TableInputFilterComponent,
    TableSelectFilterComponent,
    TableDatepickerFilterComponent,
    TableSearchFilterComponent,
    TableColumnSelectorComponent
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
    LocalstorageModule.forRoot(defaultConfiguration),
    ItemCounterModule,
    DragDropModule
  ],
  providers: [
    DatePipe,
    SmartTableService,
    TableFactory,
    {
      provide: PROVIDE_ID,
      useValue: null
    },
    ConfigurationService,
    StorageService
  ],
  exports: [
    SmartTableComponent,
    ...components
  ]
})
export class SmartTableModule {
  static forRoot(moduleConfiguration: IModuleConfig = defaultConfiguration): ModuleWithProviders {
    return {
      ngModule: SmartTableModule,
      providers: [
        {
          provide: PROVIDE_CONFIG,
          useValue: moduleConfiguration
        },
        {
          provide: PROVIDE_ID,
          useValue: moduleConfiguration.identifier
        },
        {
          provide: LOCALSTORAGE_CONFIG,
          useFactory: provideLocalstorageConfig,
          deps: [PROVIDE_CONFIG]
        },
        {
          provide: ITEMS_PER_PAGE_LABEL,
          useValue: moduleConfiguration.labels && moduleConfiguration.labels.itemsPerPageLabel
        },
        {
          provide: ITEM_COUNTER_LABEL,
          useValue: moduleConfiguration.labels && moduleConfiguration.labels.itemCounterLabel
        },
        DatePipe,
        ...services,
        TableFactory,
      ],
    };
  }
}


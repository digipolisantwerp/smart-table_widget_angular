import {ModuleWithProviders, NgModule} from '@angular/core';
import {SmartTableComponent} from './smart-table/smart-table.component';
import {CommonModule, DatePipe} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {ReactiveFormsModule} from '@angular/forms';
import {TableModule} from '@acpaas-ui/ngx-table';
import {ITEM_COUNTER_LABEL, ItemCounterModule, ITEMS_PER_PAGE_LABEL, PaginationModule} from '@acpaas-ui/ngx-pagination';
import {DatepickerModule, SearchFilterModule} from '@acpaas-ui/ngx-forms';
import {FlyoutModule} from '@acpaas-ui/ngx-flyout';
import {components, services} from './index';
import {LOCALSTORAGE_CONFIG, LocalstorageModule} from '@acpaas-ui/ngx-localstorage';
import {IModuleConfig} from './smart-table/smart-table.types';
import {PROVIDE_CONFIG, PROVIDE_ID, provideLocalstorageConfig} from './indentifier.provider';
import {TableFactory} from './services/table.factory';
import {StoreModule} from '@ngrx/store';
import {smartTableReducer} from './store/smart-table.reducer';
import {ColumnSelectorComponent} from './components/column-selector/column-selector.component';
import {EffectsModule} from '@ngrx/effects';
import {SmartTableEpics} from './store/smart-table.epics';
import {StorageModule} from './storage/storage.module';

const defaultConfiguration: IModuleConfig = {
  storageType: 'localStorage',
  identifier: 'aui-smart-table',
};


@NgModule({
  declarations: [
    ...components,
    ColumnSelectorComponent
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
    StoreModule.forFeature('aui-smart-table', smartTableReducer),
    EffectsModule.forFeature([SmartTableEpics]),
    StorageModule
  ],
  providers: [
    DatePipe,
    ...services,
    TableFactory,
    {
      provide: PROVIDE_ID,
      useValue: null
    }
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


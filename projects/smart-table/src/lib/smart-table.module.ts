import {ModuleWithProviders, NgModule, ValueProvider} from '@angular/core';
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
import {ILabels, IModuleConfig} from './smart-table/smart-table.types';
import {PROVIDE_CONFIG, PROVIDE_ID, provideLocalstorageConfig} from './indentifier.provider';
import {TableFactory} from './services/table.factory';

const defaultConfiguration: IModuleConfig = {
  storageType: 'localStorage',
  identifier: 'aui-smart-table'
};
// Do not remove following line as this line prevents build errors for the smart table module
// @dynamic
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
    LocalstorageModule.forRoot(defaultConfiguration),
    ItemCounterModule
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
  private static labelProviders: Array<ValueProvider> = [];

  static withLabels(labels: ILabels) {
    if (labels && labels.itemsPerPageLabel) {
      this.labelProviders.push({
        provide: ITEMS_PER_PAGE_LABEL,
        useValue: labels.itemsPerPageLabel
      });
    }
    if (labels && labels.itemCounterLabel) {
      this.labelProviders.push({
        provide: ITEM_COUNTER_LABEL,
        useValue: labels.itemCounterLabel
      });
    }

    return this;
  }

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
        DatePipe,
        ...services,
        TableFactory,
        ...this.labelProviders
      ],
    };
  }
}


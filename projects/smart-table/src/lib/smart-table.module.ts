import {ModuleWithProviders, NgModule} from '@angular/core';
import {SmartTableComponent} from './smart-table/smart-table.component';
import {CommonModule, DatePipe} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {ReactiveFormsModule} from '@angular/forms';
import {TableModule} from '@acpaas-ui/ngx-table';
import {ItemCounterModule, PaginationModule} from '@acpaas-ui/ngx-pagination';
import {DatepickerModule, SearchFilterModule} from '@acpaas-ui/ngx-forms';
import {FlyoutModule} from '@acpaas-ui/ngx-flyout';
import {components, services} from './index';
import {LOCALSTORAGE_CONFIG, LocalstorageModule} from '@acpaas-ui/ngx-localstorage';
import {IModuleConfig} from './smart-table/smart-table.types';
import {PROVIDE_CONFIG, PROVIDE_ID, provideIdentifier} from './indentifier.provider';
import {TableFactory} from './services/table.factory';

const defaultConfiguration: IModuleConfig = {
  storageType: 'localStorage',
  identifier: 'aui-smart-table'
};

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
    LocalstorageModule.forRoot(defaultConfiguration)
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
  static forRoot(localstorageConfig: IModuleConfig = defaultConfiguration): ModuleWithProviders {
    return {
      ngModule: SmartTableModule,
      providers: [
        {
          provide: PROVIDE_CONFIG,
          useValue: localstorageConfig
        },
        {
          provide: PROVIDE_ID,
          useFactory: provideIdentifier,
          deps: [PROVIDE_CONFIG]
        },
        {
          provide: LOCALSTORAGE_CONFIG,
          useValue: {
            storageType: localstorageConfig.storageType
          }
        },
        DatePipe,
        ...services,
        TableFactory
      ],
    };
  }
}


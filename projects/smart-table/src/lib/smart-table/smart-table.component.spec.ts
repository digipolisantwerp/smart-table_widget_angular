import { TestBed, async } from '@angular/core/testing';
import { SmartTableComponent } from './smart-table.component';
import * as sinon from 'sinon';
import { FlyoutService } from '@acpaas-ui/ngx-components/flyout';
import { DatePipe } from '@angular/common';
import { SmartTableService } from './smart-table.service';
import { LocalstorageService } from '@acpaas-ui/ngx-components/localstorage';
import { SmartTableConfig } from './smart-table.types';
import { SMARTTABLE_DEFAULT_OPTIONS } from './smart-table.defaults';

describe('SmartTableComponent', () => {

  let flyOutService: FlyoutService;
  let datePipe: DatePipe;
  let smartTableService: SmartTableService;
  let component: SmartTableComponent;
  let localStorageService: LocalstorageService;
  let defaultTableConfig: SmartTableConfig;

  beforeEach(() => {
    flyOutService = sinon.createStubInstance(FlyoutService) as FlyoutService;
    datePipe = sinon.createStubInstance(DatePipe) as unknown as DatePipe;
    smartTableService = sinon.createStubInstance(SmartTableService) as unknown as SmartTableService;
    localStorageService = sinon.createStubInstance(LocalstorageService) as unknown as LocalstorageService;
    component = new SmartTableComponent(smartTableService, datePipe, flyOutService, localStorageService);

    defaultTableConfig = {
      baseFilters: [],
      columns: [],
      filters: [],
      options: { ...SMARTTABLE_DEFAULT_OPTIONS }
    }
  });

  describe('loading configuration', () => {
    it('should load page size options ans merge with existing array, without creating doubles', () => {
      const configuration: SmartTableConfig = {
        ...defaultTableConfig,
        options: {
          ...defaultTableConfig.options,
          pageSizeOptions: [10, 15, 20, 25, 30]
        }
      };
      component.configuration = configuration;
      // Right now the pagesizeoptions should be overridden by the new options, the arrays shouldn't be merged
      expect(component.configuration.options.pageSizeOptions).toEqual([10, 15, 20, 25, 30]);
    });
  });

});

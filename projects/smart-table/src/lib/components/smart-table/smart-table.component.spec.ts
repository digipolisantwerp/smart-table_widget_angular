import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SmartTableComponent } from './smart-table.component';
import { TableInputFilterComponent } from '../table-input-filter/table-input-filter.component';
import { TableSelectFilterComponent } from '../table-select-filter/table-select-filter.component';
import { TableDatepickerFilterComponent } from '../table-datepicker-filter/table-datepicker-filter.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TableModule } from '@acpaas-ui/ngx-table';
import { ItemCounterModule, PaginationModule } from '@acpaas-ui/ngx-pagination';
import { DatepickerModule, SearchFilterModule } from '@acpaas-ui/ngx-forms';
import { ApiService } from '../../services/api.service';
import * as sinon from 'sinon';
import { SinonSandbox, SinonStub } from 'sinon';
import { DatePipe } from '@angular/common';
import { LocalstorageService } from '@acpaas-ui/ngx-localstorage';
import { PROVIDE_CONFIG, PROVIDE_ID } from '../../providers/indentifier.provider';
import { TableFactory } from '../../services/table.factory';
import { SmartTableConfig, SmartTableFilterConfig, SmartTableFilterDisplay } from '../../smart-table.types';
import { cold } from 'jasmine-marbles';
import { TableSearchFilterComponent } from '../table-search-filter/table-search-filter.component';
import { TableColumnSelectorComponent } from '../column-selector/column-selector.component';
import { ConfigurationService } from '../../services/configuration.service';
import { StorageService } from '../../services/storage.service';

describe('Smart Table Test', () => {
  let component: SmartTableComponent;
  let fixture: ComponentFixture<SmartTableComponent>;
  let storageService: LocalstorageService;
  let mockConfiguration: SmartTableConfig;
  let sandbox: SinonSandbox;
  let factory: TableFactory;
  let service: ApiService;
  let mockFilters: SmartTableFilterConfig[];
  let configurationService: ConfigurationService;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    await TestBed.configureTestingModule({
      declarations: [
        SmartTableComponent,
        TableInputFilterComponent,
        TableSelectFilterComponent,
        TableDatepickerFilterComponent,
        TableSearchFilterComponent,
        TableColumnSelectorComponent
      ],
      imports: [
        ReactiveFormsModule,
        TableModule,
        ItemCounterModule,
        PaginationModule,
        DatepickerModule,
        SearchFilterModule
      ],
      providers: [
        {
          provide: TableFactory,
          useValue: sinon.createStubInstance(TableFactory)
        },
        {
          provide: ApiService,
          useValue: sinon.createStubInstance(ApiService)
        },
        {
          provide: DatePipe,
          useValue: sinon.createStubInstance(DatePipe)
        },
        {
          provide: LocalstorageService,
          useValue: sinon.createStubInstance(LocalstorageService)
        },
        {
          provide: PROVIDE_ID,
          useValue: 'test-smart-table'
        },
        {
          provide: ConfigurationService,
          useValue: sinon.createStubInstance(ConfigurationService)
        },
        {
          provide: StorageService,
          useValue: sinon.createStubInstance(StorageService)
        },
        {
          provide: PROVIDE_CONFIG,
          useValue: {}
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SmartTableComponent);
    component = fixture.componentInstance;

    mockConfiguration = {
      columns: [],
      filters: [],
      baseFilters: [],
      options: {
        storageIdentifier: 'id',
        persistTableConfig: false,
      }
    };

    mockFilters = [
      {
        id: 'a',
        display: SmartTableFilterDisplay.Visible
      },
      {
        id: 'b',
        display: SmartTableFilterDisplay.Optional
      }
    ] as any;

    storageService = TestBed.get(LocalstorageService);
    factory = TestBed.get(TableFactory);
    sandbox.stub(storageService, 'storage').value({
      getItem: sinon.stub(),
      setItem: sinon.stub()
    });
    service = TestBed.get(ApiService);
    (service.getData as SinonStub).returns(cold('a'));
    const storage: StorageService = TestBed.get(StorageService);
    (storage.persistConfiguration as SinonStub).returns(cold('--a', { a: undefined }));
    configurationService = TestBed.get(ConfigurationService);
  });

  afterEach(() => {
    sandbox.reset();
  });

  describe('Creation', () => {
    it('should create a valid component', () => {
      expect(fixture).toBeDefined();
      expect(component).toBeDefined();
    });
  });

  describe('Filters', () => {
    it('should create the visible filters', () => {
      (configurationService.getConfiguration as SinonStub).returns(cold('---a', {
        a: {
          ...mockConfiguration,
          filters: [...mockFilters]
        }
      }));
      (factory.createSmartFilterFromConfig as SinonStub).callsFake(config => {
        return {
          id: config.id
        };
      });
      fixture.detectChanges();
      expect(component.visibleFilters$).toBeObservable(cold('a--b', {
        a: [],
        b: [{
          id: 'a'
        }]
      }));
    });

    it('should create the optional filters', () => {
      (configurationService.getConfiguration as SinonStub).returns(cold('---a', {
        a: {
          ...mockConfiguration,
          filters: [...mockFilters]
        }
      }));
      (factory.createSmartFilterFromConfig as SinonStub).callsFake(config => {
        return {
          id: config.id
        };
      });
      fixture.detectChanges();
      expect(component.optionalFilters$).toBeObservable(cold('a--b', {
        a: [],
        b: [{
          id: 'b'
        }]
      }));
    });

    it('should hide an array filter with on values', () => {
      const filters = [{ value: [] }];
      const result = component.createDataQueryFilters(filters as any);
      expect(result.length).toBe(0);
    });
  });
});

import {SmartTableComponent} from './smart-table.component';
import * as sinon from 'sinon';
import {SinonSandbox, SinonStub} from 'sinon';
import {FlyoutService} from '@acpaas-ui/ngx-flyout';
import {DatePipe} from '@angular/common';
import {SmartTableService} from './smart-table.service';
import {LocalstorageService} from '@acpaas-ui/ngx-localstorage';
import {SmartTableConfig} from './smart-table.types';
import {SMARTTABLE_DEFAULT_OPTIONS} from './smart-table.defaults';
import {cold} from 'jasmine-marbles';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TableInputFilterComponent} from '../table-input-filter/table-input-filter.component';
import {TableSelectFilterComponent} from '../table-select-filter/table-select-filter.component';
import {TableDatepickerFilterComponent} from '../table-datepicker-filter/table-datepicker-filter.component';
import {TableModule} from '@acpaas-ui/ngx-table';
import {ItemCounterModule, PaginationModule} from '@acpaas-ui/ngx-pagination';
import {ReactiveFormsModule} from '@angular/forms';
import {DatepickerModule} from '@acpaas-ui/ngx-forms';
import {PROVIDE_ID} from '../indentifier.provider';

describe('SmartTableComponent', () => {

  let flyOutService: FlyoutService;
  let datePipe: DatePipe;
  let smartTableService: SmartTableService;
  let component: SmartTableComponent;
  let fixture: ComponentFixture<SmartTableComponent>;
  let localStorageService: LocalstorageService;
  let defaultTableConfig: SmartTableConfig;
  let sandbox: SinonSandbox;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: FlyoutService,
          useValue: sinon.createStubInstance(FlyoutService)
        },
        {
          provide: SmartTableService,
          useValue: sinon.createStubInstance(SmartTableService)
        },
        {
          provide: LocalstorageService,
          useValue: sinon.createStubInstance(LocalstorageService)
        },
        {
          provide: DatePipe,
          useValue: sinon.createStubInstance(DatePipe)
        },
        {
          provide: PROVIDE_ID,
          useValue: 'test-identifier'
        }
      ],
      imports: [
        TableModule,
        PaginationModule,
        ItemCounterModule,
        ReactiveFormsModule,
        DatepickerModule
      ],
      declarations: [
        SmartTableComponent,
        TableInputFilterComponent,
        TableSelectFilterComponent,
        TableDatepickerFilterComponent
      ]
    }).compileComponents();

    flyOutService = TestBed.get(FlyoutService);
    smartTableService = TestBed.get(SmartTableService);
    localStorageService = TestBed.get(LocalstorageService);
    datePipe = TestBed.get(DatePipe);

    sandbox = sinon.createSandbox();
    sandbox.stub(localStorageService, 'storage').value({
      getItem: sinon.stub(),
      setItem: sinon.stub()
    });

    fixture = TestBed.createComponent(SmartTableComponent);
    component = fixture.componentInstance;

    defaultTableConfig = {
      baseFilters: [],
      columns: [],
      filters: [],
      options: {...SMARTTABLE_DEFAULT_OPTIONS}
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Component Creation', () => {
    it('should create a valid component', () => {
      expect(fixture).toBeDefined();
      expect(component).toBeDefined();
    });
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
      (smartTableService.getConfiguration as SinonStub).returns(cold('--(a|)', {a: configuration}));
      const result$ = component.getConfiguration();
      expect(result$).toBeObservable(cold('--(a|)', {
        a: {
          baseFilters: [],
          columns: [],
          filters: [],
          options: {
            ...SMARTTABLE_DEFAULT_OPTIONS,
            storageIdentifier: 'test-identifier',
            pageSizeOptions: [10, 15, 20, 25, 30]
          }
        }
      }));
    });
  });

  describe('Storage Identifier', () => {
    it('should use default storage identifier, provided by module', () => {
      (smartTableService.getConfiguration as SinonStub).returns(cold('---(a|)', {a: defaultTableConfig}));
      const result$ = component.getConfiguration();
      expect(result$).toBeObservable(cold('---(a|)', {
        a: {
          baseFilters: [],
          columns: [],
          filters: [],
          options: {
            ...SMARTTABLE_DEFAULT_OPTIONS,
            storageIdentifier: 'test-identifier'
          }
        }
      }));
    });
    it('should use configuration set storage identifier', () => {
      (smartTableService.getConfiguration as SinonStub).returns(cold('---(a|)', {
        a: {
          ...defaultTableConfig,
          options: {
            ...defaultTableConfig.options,
            storageIdentifier: 'new-identifier'
          }
        }
      }));
      const result$ = component.getConfiguration();
      expect(result$).toBeObservable(cold('---(a|)', {
        a: {
          baseFilters: [],
          columns: [],
          filters: [],
          options: {
            ...SMARTTABLE_DEFAULT_OPTIONS,
            storageIdentifier: 'new-identifier'
          }
        }
      }));
    });
  });

  describe('Loading Columns from Storage', () => {
    it('should retrieve columns from storage if any', () => {
      (localStorageService.storage.getItem as SinonStub).returns([
        {key: 'a'},
        {key: 'b'},
        {key: 'c'}
      ]);
      (smartTableService.getConfiguration as SinonStub).returns(cold('---(a|)', {
        a: {
          ...defaultTableConfig,
          columns: [{key: 'a'}, {key: 'b'}, {key: 'd'}]
        }
      }));
      const result$ = component.getConfiguration();
      expect(result$).toBeObservable(cold('---(a|)', {
        a: {
          baseFilters: [],
          columns: [{key: 'a'}, {key: 'b'}, {key: 'd'}],
          filters: [],
          options: {
            ...SMARTTABLE_DEFAULT_OPTIONS,
            storageIdentifier: 'test-identifier'
          }
        }
      }));
      expect((localStorageService.storage.getItem as SinonStub).called).toBe(true);
    });
  });
});

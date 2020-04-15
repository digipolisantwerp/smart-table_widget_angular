import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SmartTableComponent} from './smart-table.component';
import {TableInputFilterComponent} from '../table-input-filter/table-input-filter.component';
import {TableSelectFilterComponent} from '../table-select-filter/table-select-filter.component';
import {TableDatepickerFilterComponent} from '../table-datepicker-filter/table-datepicker-filter.component';
import {ReactiveFormsModule} from '@angular/forms';
import {TableModule} from '@acpaas-ui/ngx-table';
import {ItemCounterModule, PaginationModule} from '@acpaas-ui/ngx-pagination';
import {DatepickerModule} from '@acpaas-ui/ngx-forms';
import {SmartTableService} from './smart-table.service';
import * as sinon from 'sinon';
import {SinonSandbox, SinonStub} from 'sinon';
import {DatePipe} from '@angular/common';
import {LocalstorageService} from '@acpaas-ui/ngx-localstorage';
import {PROVIDE_ID} from '../indentifier.provider';
import {TableFactory} from '../services/table.factory';
import {SmartTableConfig} from './smart-table.types';
import {cold} from 'jasmine-marbles';

describe('Smart Table Test', () => {
  let component: SmartTableComponent;
  let fixture: ComponentFixture<SmartTableComponent>;
  let smartTableService: SmartTableService;
  let datePipe: DatePipe;
  let storageService: LocalstorageService;
  let mockConfiguration: SmartTableConfig;
  let sandbox: SinonSandbox;
  let factory: TableFactory;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    await TestBed.configureTestingModule({
      declarations: [
        SmartTableComponent,
        TableInputFilterComponent,
        TableSelectFilterComponent,
        TableDatepickerFilterComponent
      ],
      imports: [
        ReactiveFormsModule,
        TableModule,
        ItemCounterModule,
        PaginationModule,
        DatepickerModule
      ],
      providers: [
        {
          provide: TableFactory,
          useValue: sinon.createStubInstance(TableFactory)
        },
        {
          provide: SmartTableService,
          useValue: sinon.createStubInstance(SmartTableService)
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

    storageService = TestBed.get(LocalstorageService);
    factory = TestBed.get(TableFactory);
    sandbox.stub(storageService, 'storage').value({
      getItem: sinon.stub(),
      setItem: sinon.stub()
    });
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

  describe('Sourcing Configuration', () => {
    it('should get configuration from api service', () => {
      sinon.stub(component, 'getConfiguration').returns(cold('--(a|)', {a: mockConfiguration}));
      const spyOnGetColumns = sinon.stub(component, 'getLocalStorageColumns');
      fixture.detectChanges();
      const result$ = component.configuration$;
      expect(result$).toBeObservable(cold('--a', {a: mockConfiguration}));
      expect(spyOnGetColumns.calledOnce).toBe(false);
    });

    it('should initialize filters and get data when configuration comes in', () => {
      sinon.stub(component, 'getConfiguration').returns(cold('(a|)', {a: mockConfiguration}));
      const spyOnInitFilters = sinon.stub(component, 'initFilters').returns(cold('a'));
      const spyOnGetData = sinon.stub(component, 'getTableData').returns(cold('a'));
      fixture.detectChanges();
      expect(component.configuration$).toBeObservable(cold('a', {a: mockConfiguration}));
      expect(spyOnInitFilters.calledOnce).toBe(true);
      expect(spyOnGetData.withArgs(1).calledOnce).toBe(true);
    });

    it('should override the configuration by having custom configuration coming in', () => {
      sinon.stub(component, 'getConfiguration').returns(cold('---(a|)', {a: mockConfiguration}));
      component.configuration = {options: {pageSizeOptions: [10, 11, 12]}};
      fixture.detectChanges();
      const result$ = component.configuration$;
      expect(result$).toBeObservable(cold('---(ab)', {
        a: {
          ...mockConfiguration,
          options: {
            ...mockConfiguration.options,
            pageSizeOptions: [10, 11, 12]
          }
        },
        b: {...mockConfiguration}
      }));
    });

    it('should get persisted configuration when option is set so', () => {
      const spyOnGetColumns = sinon.stub(component, 'getLocalStorageColumns').callsFake((config) => {
        return {
          ...config,
          columns: ['a', 'b', 'c']
        };
      });
      sinon.stub(component, 'getConfiguration').returns(cold('--(a|)', {
        a: {
          ...mockConfiguration,
          options: {...mockConfiguration.options, persistTableConfig: true}
        }
      }));
      fixture.detectChanges();
      expect(component.configuration$).toBeObservable(cold('--a', {
        a: {
          ...mockConfiguration,
          columns: ['a', 'b', 'c'],
          options: {
            ...mockConfiguration.options,
            persistTableConfig: true
          }
        }
      }));
      expect(spyOnGetColumns.calledOnce).toBe(true);
    });
  });

  describe('Creating Columns', () => {
    it('should create columns when configuration comes in', () => {
      sinon.stub(component, 'getConfiguration').returns(cold('---a', {
        a: {
          ...mockConfiguration,
          columns: ['a', 'b']
        }
      }));
      (factory.createTableColumnFromConfig as SinonStub).returns('column');
      fixture.detectChanges();
      expect(component.allColumns$).toBeObservable(cold('a--b', {
        a: [],
        b: ['column', 'column']
      }));
    });
  });

  describe('Visible Columns', () => {
    it('should display all columns that are visible by default', () => {
      sinon.stub(component, 'getConfiguration').returns(cold('---(a|)', {
        a: {
          ...mockConfiguration,
          columns: [
            {
              key: 'a'
            },
            {
              key: 'b'
            }
          ]
        }
      }));
      (factory.createTableColumnFromConfig as SinonStub).callsFake((config) => {
        return {value: config.key, hidden: config.key === 'a'};
      });
      fixture.detectChanges();
      expect(component.visibleColumns$).toBeObservable(cold('a--b', {
        a: [],
        b: [
          {
            value: 'b',
            hidden: false
          }
        ]
      }));
    });
    it('should toggle visible columns', () => {
      sinon.stub(component, 'getConfiguration').returns(cold('---(a|)', {
        a: {
          ...mockConfiguration,
          columns: [
            {
              key: 'a',
              visible: true,
            },
            {
              key: 'b',
              visible: true
            }
          ]
        }
      }));
      (factory.createTableColumnFromConfig as SinonStub).callsFake((config) => {
        return {value: config.key, hidden: false};
      });
      component.toggleSelectedColumn$ = cold('-----a', {a: {key: 'a'}}) as any;
      component.toggleHideColumn$ = cold('--------a') as any;
      fixture.detectChanges();
      expect(component.visibleColumns$).toBeObservable(cold('a--b----c', {
        a: [],
        b: [
          {
            value: 'a',
            hidden: true
          },
          {
            value: 'b',
            hidden: false
          }
        ],
        c: [
          {
            value: 'a',
            hidden: true
          },
          {
            value: 'b',
            hidden: false
          }
        ]
      }));
    });
  });

  describe('Selectable Columns', () => {
    it('should get selectable columns from configuration', () => {
      sinon.stub(component, 'getConfiguration').returns(cold('---(a|)', {
        a: {
          ...mockConfiguration,
          columns: [{
            key: 'a',
            canHide: false
          }, {
            key: 'b'
          }]
        }
      }));
      (factory.createTableColumnFromConfig as SinonStub).callsFake((config) => {
        return {value: config.key, hidden: false};
      });
      fixture.detectChanges();
      expect(component.selectableColumns$).toBeObservable(cold('a--b', {
        a: [],
        b: [{value: 'b', hidden: false}]
      }));
    });

    it('should toggle hidden status of selectable column', () => {
      sinon.stub(component, 'getConfiguration').returns(cold('---(a|)', {
        a: {
          ...mockConfiguration,
          columns: [{
            key: 'a',
            canHide: false
          }, {
            key: 'b'
          }]
        }
      }));
      (factory.createTableColumnFromConfig as SinonStub).callsFake((config) => {
        return {value: config.key, hidden: false};
      });
      component.toggleSelectedColumn$ = cold('-------a', {a: {key: 'b'}}) as any;
      fixture.detectChanges();
      expect(component.selectableColumns$).toBeObservable(cold('a--b---c', {
        a: [],
        b: [{
          value: 'b',
          hidden: true
        }],
        c: [{
          value: 'b',
          hidden: true
        }],
      }));
    });
  });
});

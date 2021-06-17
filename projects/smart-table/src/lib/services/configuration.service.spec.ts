import { cold, hot } from 'jasmine-marbles';
import { SmartTableConfig } from '../smart-table.types';
import { TestBed } from '@angular/core/testing';
import { ConfigurationService } from './configuration.service';
import { TableFactory } from './table.factory';
import * as sinon from 'sinon';
import { SinonStub } from 'sinon';

describe('Configuration Service', () => {
  let mockConfiguration: SmartTableConfig;
  let service: ConfigurationService;
  let factory: TableFactory;
  beforeEach(() => {
    mockConfiguration = {
      columns: [],
      filters: [],
      baseFilters: [],
      options: {
        storageIdentifier: 'id',
        persistTableConfig: false,
      },
    };
    TestBed.configureTestingModule({
      providers: [
        ConfigurationService,
        {
          provide: TableFactory,
          useValue: sinon.createStubInstance(TableFactory),
        },
      ],
    });
    service = TestBed.get(ConfigurationService);
    factory = TestBed.get(TableFactory);
  });
  describe('Sourcing Configuration', () => {
    it('should get configuration from api service', () => {
      service.initConfiguration({
        id: 'some-id',
        backendCallback: () => cold('---(a|)', { a: mockConfiguration }),
        customConfiguration$: cold(''),
        storageCallback: () => cold(''),
      });
      const result$ = service.getConfiguration('some-id');
      expect(result$).toBeObservable(cold('---a', { a: mockConfiguration }));
    });

    it('should override the configuration by having custom configuration coming in', () => {
      service.initConfiguration({
        id: 'some-id',
        backendCallback: () => cold('---(a|)', { a: mockConfiguration }),
        customConfiguration$: hot('--------a', { a: { options: { pageSizeOptions: [10, 11, 12] } } }),
        storageCallback: () => cold(''),
      });
      const result$ = service.getConfiguration('some-id');
      expect(result$).toBeObservable(cold('---a----b', {
        a: { ...mockConfiguration },
        b: {
          ...mockConfiguration,
          options: {
            ...mockConfiguration.options,
            pageSizeOptions: [10, 11, 12],
          },
        },
      }));
    });
    it('should wait for the backend data before overriding configuration', () => {
      service.initConfiguration({
        id: 'some-id',
        backendCallback: () => cold('----(a|)', { a: mockConfiguration }),
        customConfiguration$: cold('-a', { a: { options: { pageSizeOptions: [10, 11, 12] } } }),
        storageCallback: () => cold(''),
      });
      const result$ = service.getConfiguration('some-id');
      expect(result$).toBeObservable(cold('----ab', {
        a: { ...mockConfiguration },
        b: {
          ...mockConfiguration,
          options: {
            ...mockConfiguration.options,
            pageSizeOptions: [10, 11, 12],
          },
        },
      }));
    });

    it('should get persisted configuration when option is set so', () => {
      service.initConfiguration({
        id: 'some-id',
        backendCallback: () => cold('--(a|)', { a: { ...mockConfiguration } }),
        customConfiguration$: cold('-a', { a: { options: { persistTableConfig: true } } }),
        storageCallback: () => cold('---(a|)', {
          a: {
            ...mockConfiguration,
            options: { ...mockConfiguration.options, defaultSortOrder: { key: 'k', order: 'asc' }, persistTableConfig: true },
          }
        })
      });
      const result$ = service.getConfiguration('some-id');
      expect(result$).toBeObservable(cold('--a---b', {
        a: { ...mockConfiguration },
        b: {
          ...mockConfiguration,
          options: {
            ...mockConfiguration.options,
            defaultSortOrder: { key: 'k', order: 'asc' },
            persistTableConfig: true,
          },
        },
      }));
    });
  });
  describe('Getting Columns', () => {
    it('should get columns, ordered by sort id', () => {
      sinon.stub(service, 'getConfiguration').returns(cold('----a', {
        a: {
          ...mockConfiguration,
          columns: [{
            key: 'a',
            orderIndex: 3,
          }, {
            key: 'b',
            orderIndex: 0,
          }],
        },
      }));
      (factory.createTableColumnFromConfig as SinonStub).callsFake((columnConfig) => ({ ...columnConfig, made: true }));
      const result$ = service.getColumns('some-id', []);
      expect(result$).toBeObservable(cold('----a', {
        a: [
          { key: 'b', orderIndex: 0, made: true },
          { key: 'a', orderIndex: 3, made: true },
        ],
      }));
    });
  });
});

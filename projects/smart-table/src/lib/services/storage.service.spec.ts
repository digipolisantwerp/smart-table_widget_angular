import { StorageService } from './storage.service';
import { TestBed } from '@angular/core/testing';
import { LocalstorageService } from '@acpaas-ui/ngx-localstorage';
import * as sinon from 'sinon';
import { SinonSandbox, SinonStub } from 'sinon';
import { SmartTableConfig } from '../smart-table.types';

describe('Storage Service Test', () => {
  let service: StorageService;
  let mockConfiguration: SmartTableConfig;
  let storage: LocalstorageService;
  let sandbox: SinonSandbox;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StorageService,
        {
          provide: LocalstorageService,
          useValue: sinon.createStubInstance(LocalstorageService),
        },
      ],
    });
    storage = TestBed.get(LocalstorageService);
    service = TestBed.get(StorageService);
    mockConfiguration = {
      columns: [],
      filters: [],
      baseFilters: [],
      options: {
        storageIdentifier: 'id',
        persistTableConfig: false,
      },
    };
    sandbox = sinon.createSandbox();
    sandbox.stub(storage, 'storage').value({
      setItem: sinon.stub(),
      getItem: sinon.stub(),
    });
  });
  afterEach(() => {
    sandbox.reset();
  });

  describe('Persisting configuration', () => {
    it('should not persist if the option is disabled in configuration', () => {
      service.persistConfiguration('some-id', { ...mockConfiguration, options: { persistTableConfig: false } });
      expect((storage.storage.setItem as SinonStub).called).toBe(false);
    });
    it('should persist columns when option enabled', () => {
      const param = {
        ...mockConfiguration,
        columns: [
          { key: 'a', orderIndex: 0 },
          { key: 'b', orderIndex: 1 },
        ],
        options: {
          storageIdentifier: 'identifier',
          defaultSortOrder: { key: 'a', order: 'asc' },
          persistTableConfig: true,
        },
      };
      service.persistConfiguration('some-id', param as any);
      expect((storage.storage.setItem as SinonStub).withArgs('identifier', JSON.stringify({
        columns: [
          { key: 'a', orderIndex: 0 },
          { key: 'b', orderIndex: 1 },
        ],
        options: {
          defaultSortOrder: { key: 'a', order: 'asc' },
        },
      })).calledOnce).toBe(true);
    });
  });

  describe('Getting configuration', () => {
    it('should not get configuration when option is disabled', () => {
      const config = service.getConfiguration({ ...mockConfiguration, options: { persistTableConfig: false } });
      expect(config).toEqual({ ...mockConfiguration, options: { persistTableConfig: false } });
      expect((storage.storage.getItem as SinonStub).called).toBe(false);
    });
    it('should get unaltered configuration in no columns are in localstorage', () => {
      const config = {
        ...mockConfiguration,
        columns: [
          { key: 'a' },
          { key: 'b' },
        ],
        options: {
          persistTableConfig: true,
          identifier: 'identifier',
        },
      } as any;
      (storage.storage.getItem as SinonStub).withArgs('identifier').returns(JSON.stringify({}));
      const newConfig = service.getConfiguration(config);
      expect(newConfig).toEqual(config);
    });
    it('should override existing columns with new keys from storage', () => {
      const config = {
        ...mockConfiguration,
        columns: [
          { key: 'a', someOtherKey: 'random', order: 'asc' },
          { key: 'b' },
        ],
        options: {
          persistTableConfig: true,
          storageIdentifier: 'identifier',
        },
      } as any;
      (storage.storage.getItem as SinonStub).withArgs('identifier').returns(JSON.stringify({
        columns: [
          { key: 'a', orderIndex: 1, order: 'desc' },
        ],
        options: {
          defaultSortOrder: { key: 'a', order: 'asc' },
        },
      }));
      const newConfig = service.getConfiguration(config);
      expect(newConfig).toEqual({
        ...config,
        columns: [
          // It should not be replacing columns, but overriding existing properties
          { key: 'a', someOtherKey: 'random', orderIndex: 1, order: 'desc' },
          { key: 'b' },
        ],
        options: {
          ...config.options,
          defaultSortOrder: { key: 'a', order: 'asc' },
        },
      });
    });
  });
});

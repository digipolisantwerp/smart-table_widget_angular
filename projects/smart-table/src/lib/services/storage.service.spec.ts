import { StorageService } from './storage.service';
import { TestBed } from '@angular/core/testing';
import * as sinon from 'sinon';
import { SinonSandbox, SinonStub } from 'sinon';
import { SmartTableColumnType, SmartTableConfig } from '../smart-table.types';

describe('Storage Service Test', () => {
  let service: StorageService;
  let mockConfiguration: SmartTableConfig;
  let sandbox: SinonSandbox;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StorageService,
      ],
    });
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
  });
  afterEach(() => {
    sandbox.reset();
  });

  describe('Persisting configuration', () => {
      it('should not persist if the option is disabled in configuration', () => {
        spyOn(window.localStorage, 'setItem');
        service.persistConfiguration('some-id', { ...mockConfiguration, options: { persistTableConfig: false } });
        expect(window.localStorage.setItem).not.toHaveBeenCalled();
    });
      it('should persist columns when option enabled', () => {
        spyOn(window.localStorage, 'setItem');
        const configuration = {
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
      service.persistConfiguration('some-id', configuration as any);
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        configuration.options.storageIdentifier,
        JSON.stringify({
          columns: configuration.columns,
          options: {
            defaultSortOrder: configuration.options.defaultSortOrder,
          },
        })
      );
    });
  });

  describe('Getting configuration', () => {
      it('should not get configuration when option is disabled', () => {
        spyOn(window.localStorage, 'getItem');
        const config = service.getConfiguration({ ...mockConfiguration, options: { persistTableConfig: false } });
        expect(config).toEqual({ ...mockConfiguration, options: { persistTableConfig: false } });
        expect(window.localStorage.getItem).not.toHaveBeenCalled();
    });
      it('should get unaltered configuration in no columns are in localstorage', () => {
      const config = {
        ...mockConfiguration,
        columns: [
          { key: 'a' },
          { key: 'b' },
        ],
        options: {
          persistTableConefig: true,
          identifier: 'identifier',
        },
      } as any;
    const newConfig = service.getConfiguration(config);
      expect(newConfig).toEqual(config);
      });
      
      it('should override existing columns with new keys from storage', () => {
          const defaultConfig = {
            ...mockConfiguration, 
            columns: [
            { key: 'a', orderIndex: 0, visible: true, label:'test column a', type: SmartTableColumnType.Text , sortPath: 'testa' },
            { key: 'b', orderIndex: 1, visible: true, label:'test column b', type: SmartTableColumnType.Text  , sortPath: 'testb' },
            ],
            filters: [],
            baseFilters: [],
            options: {
                storageIdentifier: 'identifier',
                persistTableConfig: true,
              },
            storageType: 'localStorage'
        } as any;

          const storedConfig = {
            ...mockConfiguration,
            columns: [
                { key: 'a', orderIndex: 2 , visible: true, label:'test column a', type: SmartTableColumnType.Text , sortPath: 'testa'},
                { key: 'c', orderIndex: 3, visible: true, label:'test column c', type: SmartTableColumnType.Text  , sortPath: 'testc' },
            ],
            options: {
                defaultSortOrder: { key: 'a', order: 'asc' },
            },
        };
          
        spyOn(service, 'getStoredItem').and.returnValue(storedConfig);

        const config = service.getConfiguration(defaultConfig);

        expect(service.getStoredItem).toHaveBeenCalledWith(
              defaultConfig.storageType,
              defaultConfig.options.storageIdentifier
        );
          
        expect(config).toEqual({
        columns: [
          { key: 'a', orderIndex: 2,  visible: true, label:'test column a', type: SmartTableColumnType.Text , sortPath: 'testa' },
          { key: 'b', orderIndex: 1, visible: true, label:'test column b', type: SmartTableColumnType.Text  , sortPath: 'testb' },
        ],
        filters: [],
        baseFilters: [],
        options: {
          storageIdentifier: 'identifier',
          persistTableConfig: true,
          defaultSortOrder: { key: 'a', order: 'asc' },
                    },
            storageType: 'localStorage'

      });
    });
  });
});

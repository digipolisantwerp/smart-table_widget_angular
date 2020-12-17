import {Injectable} from '@angular/core';
import {LocalstorageService} from '@acpaas-ui/ngx-localstorage';
import {SmartTableConfig} from '../smart-table/smart-table.types';

@Injectable()
export class StorageService {

  constructor(private localstorageService: LocalstorageService) {
  }

  getConfiguration(defaultConfiguration: SmartTableConfig): SmartTableConfig {
    if (!(defaultConfiguration
      && defaultConfiguration.options
      && defaultConfiguration.options.storageIdentifier
      && defaultConfiguration.options.persistTableConfig)) {
      return defaultConfiguration;
    }
    const obj = this.getStoredItem(defaultConfiguration.options.storageIdentifier);
    const config = {...defaultConfiguration};
    if (obj && obj.columns && Array.isArray(obj.columns)) {
      const localStorageColumns = (obj.columns || [])
        .filter((column) => !!defaultConfiguration.columns.find((c) => c.key === column.key))
        .map((column) => {
          const found = defaultConfiguration.columns.find(c => c.key === column.key);
          // Do not replace existing columns, but override properties
          return {
            ...found,
            ...column
          };
        });
      const columnsNotInStorage = defaultConfiguration.columns.filter(column => !localStorageColumns.some(c => c.key === column.key));
      config.columns = [
        ...localStorageColumns,
        ...columnsNotInStorage
      ];
    }
    if (obj && obj.options && obj.options) {
      config.options = {
        ...config.options,
        ...obj.options
      };
    }
    return config;
  }

  persistConfiguration(id: string, configuration: SmartTableConfig): void {
    if (!(configuration && configuration.options && configuration.options.persistTableConfig)) {
      return;
    }
    // tslint:disable-next-line:no-console
    console.info('Info: persisting table configuration to storage.');
    const name = configuration.options.storageIdentifier;
    const obj = this.getStoredItem(name);
    obj.columns = [...configuration.columns];
    obj.options = {
      ...obj.options,
      defaultSortOrder: configuration.options.defaultSortOrder
    };
    this.setItemToStorage(name, obj);
  }

  private setItemToStorage(name: string, object: any): void {
    this.localstorageService.storage.setItem(name, JSON.stringify(object));
  }

  private getStoredItem(name: string): any {
    let storageObj: any = this.localstorageService.storage.getItem(name);
    try {
      storageObj = !storageObj ? {} : JSON.parse(storageObj);
      return storageObj;
    } catch (err) {
      console.warn(err);
      console.warn('WARNING: Could not persist in storage!');
      return {};
    }
  }
}

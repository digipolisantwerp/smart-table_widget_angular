import { Injectable } from '@angular/core';
import { SmartTableConfig } from '../smart-table.types';

@Injectable()
export class StorageService {

  getConfiguration(defaultConfiguration: SmartTableConfig): SmartTableConfig {
    if (!(defaultConfiguration
      && defaultConfiguration.options
      && defaultConfiguration.options.storageIdentifier
      && defaultConfiguration.options.persistTableConfig)) {
      return defaultConfiguration;
    }
    const obj = this.getStoredItem(defaultConfiguration.storageType, defaultConfiguration.options.storageIdentifier);
    const config = { ...defaultConfiguration };
    if (obj && obj.columns && Array.isArray(obj.columns)) {
      const localStorageColumns = (obj.columns || [])
        .filter((column) => !!defaultConfiguration.columns.find((c) => c.key === column.key))
        .map((column) => {
          const found = defaultConfiguration.columns.find(c => c.key === column.key);
          // Do not replace existing columns, but override properties
          return {
            ...found,
            ...column,
          };
        });
      const columnsNotInStorage = defaultConfiguration.columns.filter(column => !localStorageColumns.some(c => c.key === column.key));
      config.columns = [
        ...localStorageColumns,
        ...columnsNotInStorage,
      ];
    }
    if (obj && obj.options && obj.options) {
      config.options = {
        ...config.options,
        ...obj.options,
      };
    }
    return config;
  }

  persistConfiguration(id: string, configuration: SmartTableConfig): void {
    if (!(configuration && configuration.options && configuration.options.storageIdentifier && configuration.options.persistTableConfig)) {
      return;
    }
    // tslint:disable-next-line:no-console
    console.info('Info: persisting table configuration to storage.');
    const name = configuration.options.storageIdentifier;
    const obj = this.getStoredItem(configuration.storageType, name);
    obj.columns = [...configuration.columns];
    obj.options = {
      ...obj.options,
      defaultSortOrder: configuration.options.defaultSortOrder,
    };
    this.setItemToStorage(configuration.storageType, name, obj);
  }

  private setItemToStorage(storage:string ='localStorage', name: string, object: any): void {
    window[storage].setItem(name, JSON.stringify(object));
  }

  private getStoredItem(storage:string = 'localStorage', name: string): any {
    let storageObj: any = window[storage].getItem(name);
    try {
      storageObj = !storageObj ? {} : JSON.parse(storageObj);
      return storageObj;
    } catch (err) {
      console.warn(err);
      return {};
    }
  }
}

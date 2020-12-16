import {Injectable} from '@angular/core';
import {ConfigurationService} from './configuration.service';
import {Observable} from 'rxjs';
import {distinctUntilChanged, filter, mapTo, skip, tap} from 'rxjs/operators';
import {LocalstorageService} from '@acpaas-ui/ngx-localstorage';
import {SmartTableConfig} from '../smart-table/smart-table.types';

@Injectable()
export class StorageService {
  private storageIsEnabled = filter((config: SmartTableConfig) => config && config.options && config.options.persistTableConfig);

  constructor(private configurationService: ConfigurationService, private localstorageService: LocalstorageService) {
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
        .filter((column) => !!defaultConfiguration.columns.find((c) => c.key === column.key));
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

  persistConfiguration(id: string): Observable<void> {
    return this.configurationService.getConfiguration(id).pipe(
      distinctUntilChanged(),
      skip(2),  // Skip initial values, only start persisting with new values
      this.storageIsEnabled,
      tap((config) => {
        // tslint:disable-next-line:no-console
        console.info('Info: persisting table configuration to storage.');
        const name = config.options.storageIdentifier;
        const obj = this.getStoredItem(name);
        obj.columns = [...config.columns];
        this.setItemToStorage(name, obj);
      }),
      mapTo(undefined)
    );
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

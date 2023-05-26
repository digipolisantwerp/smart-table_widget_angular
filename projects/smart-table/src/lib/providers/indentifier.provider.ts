import { InjectionToken } from '@angular/core';

import { ILocalStorageConfig, IModuleConfig } from '../smart-table.types';

export const PROVIDE_ID = new InjectionToken('Provide-Identifier');
export const PROVIDE_CONFIG = new InjectionToken('SmartTable-Provide-Config');

export function provideLocalstorageConfig(config: IModuleConfig): ILocalStorageConfig {
  return {
    storageType: config.storageType || 'localStorage',
  };
}

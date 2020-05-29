import {InjectionToken} from '@angular/core';
import {IModuleConfig} from './smart-table/smart-table.types';

export const PROVIDE_ID = new InjectionToken('Provide-Identifier');
export const PROVIDE_CONFIG = new InjectionToken('SmartTable-Provide-Config');

export function provideIdentifier(config: IModuleConfig) {
  return config.identifier || 'localStorage';
}

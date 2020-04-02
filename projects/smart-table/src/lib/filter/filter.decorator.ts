import {AbstractFilter} from './abstract-filter';
import {debounceTime, takeUntil, tap} from 'rxjs/operators';
import * as _ from 'lodash';

export function SmartTableFilter<T extends { new(...args: any[]): AbstractFilter }>() {
  function decorator(constructor: T) {

    const newConstructor: any = (...args) => {
      const instance: AbstractFilter = new constructor(args);
      instance.id = `filter-${_.uniqueId()}`;
      instance.formControl.valueChanges.pipe(
        takeUntil(instance.destroy$),
        debounceTime(200),
        tap((newValue: string) => instance.onFilter(newValue)),
      ).subscribe();
      return instance;
    };

    // copy prototype so intanceof operator still works
    newConstructor.prototype = constructor.prototype;


    // return new constructor (will override original)
    return newConstructor;
  }

  return decorator;
}

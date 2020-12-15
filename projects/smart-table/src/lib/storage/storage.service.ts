import {Injectable} from '@angular/core';
import {LocalstorageService} from '@acpaas-ui/ngx-localstorage';
import {select, Store} from '@ngrx/store';
import {IAppState} from '../store';
import {Observable, of} from 'rxjs';
import {selectConfiguration} from '../store/smart-table.selectors';
import {SmartTableColumnConfig, SmartTableConfig} from '../smart-table/smart-table.types';
import {catchError, first, map, mapTo, tap} from 'rxjs/operators';
import {OrderBy} from '@acpaas-ui/ngx-table';

@Injectable()
export class StorageService {
  get identifier(): (id) => Observable<string> {
    return (id) => this.store.pipe(selectConfiguration(id)).pipe(
      select((config: SmartTableConfig) => config.options.storageIdentifier),
      first()
    );
  }

  constructor(private localstorageService: LocalstorageService, private store: Store<IAppState>) {
  }

  persistColumnsToLocalStorage(id: string, columns: SmartTableColumnConfig[]): Observable<void> {
    return this.addToLocalStorage(id, 'columns', columns);
  }

  getColumns(id: string): Observable<SmartTableColumnConfig[]> {
    return this.getItem(id).pipe(
      map((object: any) => object.columns || []),
      catchError(() => of([]))
    );
  }

  getSortOrder(id: string): Observable<OrderBy> {
    return this.getItem(id).pipe(
      map((item: any) => (item && item.defaultSortOrder) || {})
    );
  }

  private getItem(id: string): Observable<object> {
    return this.identifier(id).pipe(
      map((identifier: string) => this.localstorageService.storage.getItem(identifier)),
      map(object => JSON.parse(object)),
      catchError(() => of({}))
    );
  }

  private addToLocalStorage(id: string, key: string, value: any): Observable<void> {
    const storageIdentifier$ = this.identifier(id);
    return storageIdentifier$.pipe(
      tap(identifier => {
        let storageObj: any = this.localstorageService.storage.getItem(identifier);
        storageObj = !storageObj ? {} : JSON.parse(storageObj);
        storageObj[key] = value;
        this.localstorageService.storage.setItem(identifier, JSON.stringify(storageObj));
      }),
      mapTo(undefined)
    );
  }
}

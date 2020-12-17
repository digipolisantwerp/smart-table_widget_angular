import {Component, Input, OnInit} from '@angular/core';
import {ConfigurationService} from '../../services/configuration.service';
import {combineLatest, merge, Observable, Subject} from 'rxjs';
import {SmartTableColumnConfig, SmartTableConfig} from '../smart-table/smart-table.types';
import {first, map, shareReplay, switchMap, tap} from 'rxjs/operators';
import {FlyoutService} from '@acpaas-ui/ngx-flyout';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

@Component({
  selector: 'aui-table-column-selector',
  templateUrl: './column-selector.component.html',
  styleUrls: ['./column-selector.component.scss']
})
export class TableColumnSelectorComponent implements OnInit {
  @Input()
  instanceId: string;
  configuration$: Observable<SmartTableConfig>;

  pendingColumnOperation$: Observable<SmartTableColumnConfig[]>;
  toggleColumnsVisibility$ = new Subject<string>();
  updateSortIndexByKey$ = new Subject<{ oldIndex: number, newIndex: number }>();

  constructor(
    private configurationService: ConfigurationService,
    private flyoutService: FlyoutService) {
  }

  private static sortColumn(a, b) {
    return a.sortIndex > b.sortIndex ? 1 : a.sortIndex < b.sortIndex ? -1 : 0;
  }

  ngOnInit() {
    this.configuration$ = this.configurationService.getConfiguration(this.instanceId);
    this.pendingColumnOperation$ = merge(
      this.configuration$.pipe(map(config => [...config.columns.sort(TableColumnSelectorComponent.sortColumn)])),
      this.toggleColumnsVisibility$.pipe(
        switchMap((key: string) => this.pendingColumnOperation$.pipe(
          first(),
          map(columns => {
            const newColumns = [...columns];
            const index = newColumns.findIndex(c => c.key === key);
            if (index > -1) {
              newColumns[index].visible = !(newColumns[index].visible !== false);
            }
            return newColumns;
          })
        ))
      ),
      this.updateSortIndexByKey$.pipe(
        switchMap((payload) => this.pendingColumnOperation$.pipe(
          first(),
          map(c => {
            const columns = [...c];
            moveItemInArray(columns, payload.oldIndex, payload.newIndex);
            return columns.map((item, sortIndex) => ({...item, sortIndex}));
          })
        ))
      )
    ).pipe(
      map(columns => columns.sort((a, b) => a.sortIndex > b.sortIndex ? 1 : a.sortIndex < b.sortIndex ? -1 : 0)),
      shareReplay(1)
    );
  }

  applyChanges(): void {
    combineLatest([
      this.configuration$,
      this.pendingColumnOperation$
    ]).pipe(
      first(),
      map(([config, columns]): SmartTableConfig => {
        return {
          ...config,
          columns: (columns as SmartTableColumnConfig[])
        };
      }),
      tap(console.log),
      // This operation will trigger a new configuration to be loaded, thus our pendingColumnOperations will be reset
      // to the new configuration coming in. That's why we don't have to manually reset the observable.
      tap((config: SmartTableConfig) => this.configurationService.setConfiguration$.next(config)),
      tap(() => this.flyoutService.close())
    ).subscribe();
  }

  updateColumnsSortIndex(event: CdkDragDrop<SmartTableColumnConfig[]>) {
    console.log(event);
    this.updateSortIndexByKey$.next({
      oldIndex: event.previousIndex,
      newIndex: event.currentIndex
    });
  }
}

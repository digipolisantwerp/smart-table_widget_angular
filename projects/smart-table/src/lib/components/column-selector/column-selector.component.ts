import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ConfigurationService} from '../../services/configuration.service';
import {combineLatest, merge, Observable, Subject} from 'rxjs';
import {SmartTableColumnConfig, SmartTableConfig} from '../../smart-table/smart-table.types';
import {first, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {FlyoutService} from '@acpaas-ui/ngx-flyout';

@Component({
  selector: 'aui-table-column-selector',
  templateUrl: './column-selector.component.html',
  styleUrls: ['./column-selector.component.scss']
})
export class TableColumnSelectorComponent implements OnInit, OnDestroy {
  @Input()
  instanceId: string;
  configuration$: Observable<SmartTableConfig>;

  pendingColumnOperation$: Observable<SmartTableColumnConfig[]>;
  toggleSelectedColumnByKey$ = new Subject<string>();

  private destroy$ = new Subject();

  constructor(
    private configurationService: ConfigurationService,
    private flyoutService: FlyoutService) {
  }

  ngOnInit() {
    this.configuration$ = this.configurationService.getConfiguration(this.instanceId);
    this.pendingColumnOperation$ = merge(
      this.configuration$.pipe(map(config => [...config.columns])),
      this.toggleSelectedColumnByKey$.pipe(
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
      )
    );

    this.pendingColumnOperation$.pipe(
      takeUntil(this.destroy$)
    ).subscribe();
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
      tap((config: SmartTableConfig) => this.configurationService.setConfiguration$.next(config)),
      tap(() => this.flyoutService.close())
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

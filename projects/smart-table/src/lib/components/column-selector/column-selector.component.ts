import {Component, Inject, Input, OnInit} from '@angular/core';
import {ConfigurationService} from '../../services/configuration.service';
import {Observable} from 'rxjs';
import {IOrderingLabels, SmartTableColumnConfig, SmartTableConfig} from '../../smart-table.types';
import {first, map} from 'rxjs/operators';
import {moveItemInArray} from '@angular/cdk/drag-drop';
import {PROVIDE_SORT_LABELS} from '../../providers/sort-labels.provider';
import {sortColumn} from '../../helper/helpers';

@Component({
  selector: 'aui-table-column-selector',
  templateUrl: './column-selector.component.html',
  styleUrls: ['./column-selector.component.scss']
})
export class TableColumnSelectorComponent implements OnInit {
  @Input()
  instanceId: string;
  configuration$: Observable<SmartTableConfig>;
  columns$: Observable<SmartTableColumnConfig[]>;

  constructor(
    private configurationService: ConfigurationService,
    @Inject(PROVIDE_SORT_LABELS) public labels: IOrderingLabels) {
  }

  ngOnInit() {
    this.configuration$ = this.configurationService.getConfiguration(this.instanceId);
    this.columns$ = this.configuration$.pipe(
      map(config => config.columns.sort(sortColumn))
    );
  }

  updateOrderIndex(payload: { oldIndex: number, newIndex: number }): Observable<SmartTableConfig> {
    return this.configuration$.pipe(
      first(),
      map((c: SmartTableConfig) => {
        const columns = [...c.columns.sort(sortColumn)];
        moveItemInArray(columns, payload.oldIndex, payload.newIndex);
        return {
          ...c,
          columns: columns
            .map((item, orderIndex) => ({...item, orderIndex}))
            .sort(sortColumn)
        };
      })
    );
  }

  toggleColumnVisibility(key: string): Observable<SmartTableConfig> {
    return this.configuration$.pipe(
      first(),
      map(config => {
        const newColumns = [...config.columns];
        const index = newColumns.findIndex(c => c.key === key);
        if (index > -1) {
          newColumns[index].visible = !(newColumns[index].visible !== false);
        }
        return {
          ...config,
          columns: newColumns.sort(sortColumn)
        };
      })
    );
  }

  toggleVisibilityHook(key: string): void {
    this.toggleColumnVisibility(key)
      .subscribe((config) => this.configurationService.setConfiguration(this.instanceId, config));
  }

  moveColumnUp(index: number): void {
    this.updateOrderIndex({
      oldIndex: index,
      newIndex: index - 1
    }).subscribe(config => this.configurationService.setConfiguration(this.instanceId, config));
  }

  moveColumnDown(index: number): void {
    this.updateOrderIndex({
      oldIndex: index,
      newIndex: index + 1
    }).subscribe(config => this.configurationService.setConfiguration(this.instanceId, config));
  }
}

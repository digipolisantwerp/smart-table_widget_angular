import {Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {SmartTableConfig} from '../../smart-table/smart-table.types';
import {Store} from '@ngrx/store';
import {IAppState} from '../../store';
import {selectColumns, selectConfiguration} from '../../store/smart-table.selectors';
import {map} from 'rxjs/operators';
import {TableColumn} from '@acpaas-ui/ngx-table';
import {ChangeColumnSortIndex, PersistColumns, ToggleColumnVisibility} from '../../store/smart-table.actions';
import {CdkDragDrop} from '@angular/cdk/drag-drop';

@Component({
  selector: 'aui--table-column-selector',
  templateUrl: './column-selector.component.html',
  styleUrls: ['./column-selector.component.scss']
})
export class ColumnSelectorComponent implements OnInit {
  configuration$: Observable<SmartTableConfig>;
  columns$: Observable<Array<TableColumn>>;
  selectableColumns$: Observable<Array<TableColumn>>;

  @Input()
  uniqueIdentifier: string;

  constructor(private store: Store<IAppState>) {
  }

  ngOnInit() {
    this.configuration$ = this.store.pipe(selectConfiguration(this.uniqueIdentifier));
    this.columns$ = this.store.pipe(selectColumns(this.uniqueIdentifier));
  }

  toggleSelectedColumn(key: string): void {
    this.store.dispatch(new ToggleColumnVisibility(key, this.uniqueIdentifier));
  }

  changeSortIndex(event: CdkDragDrop<TableColumn[]>) {
    this.store.dispatch(new ChangeColumnSortIndex(event.previousIndex, event.currentIndex, this.uniqueIdentifier));
  }

  columnMayHide(key: string): Observable<boolean> {
    return this.configuration$.pipe(
      map(c => c.columns.find(column => column.key === key)),
      map(config => config.canHide !== false)
    );
  }
}

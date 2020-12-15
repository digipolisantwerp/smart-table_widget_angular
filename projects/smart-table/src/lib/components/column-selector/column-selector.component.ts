import {Component, Input, OnInit} from '@angular/core';
import {combineLatest, merge, Observable} from 'rxjs';
import {SmartTableConfig} from '../../smart-table/smart-table.types';
import {Store} from '@ngrx/store';
import {IAppState} from '../../store';
import {selectColumns, selectConfiguration} from '../../store/smart-table.selectors';
import {map} from 'rxjs/operators';
import {TableColumn} from '@acpaas-ui/ngx-table';
import {PersistColumns, ToggleColumnVisibility} from '../../store/smart-table.actions';

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

    this.selectableColumns$ = merge(
      combineLatest(
        this.columns$,
        this.configuration$,
      ).pipe(
        map(([allColumns, configuration]) => {
          return (allColumns as TableColumn[]).filter(column => {
            const config = configuration.columns.find(c => c.key === column.value);
            return config.canHide !== false;
          });
        }),
      )
    );
  }

  toggleSelectedColumn(key: string): void {
    this.store.dispatch(new ToggleColumnVisibility(key, this.uniqueIdentifier));
    this.store.dispatch(new PersistColumns(this.uniqueIdentifier));
  }

}

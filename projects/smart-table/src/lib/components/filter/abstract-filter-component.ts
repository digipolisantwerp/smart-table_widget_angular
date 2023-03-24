import { EventEmitter, Injectable, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { UpdateFilterArgs } from '../../smart-table.types';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import { SmartTableFilter } from './smart-table.filter';

@Injectable()
export abstract class AbstractFilterComponent implements OnDestroy, OnChanges {
  @Input() filter: SmartTableFilter;
  @Input() optional = false;
  @Output() update = new EventEmitter<UpdateFilterArgs>();

  public id: string;
  public value: string;

  public formControl: FormControl = new FormControl();
  public destroy$ = new Subject();

  constructor() {
    this.id = `filter-${_.uniqueId()}`;
    this.formControl.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(200),
      tap((newValue: string) => this.onFilter(newValue)),
    ).subscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!!changes.filter.currentValue) {
      this.update.pipe(
        takeUntil(this.destroy$),
        tap(value => (this.filter.valueChanges$ as Subject<UpdateFilterArgs>).next(value)),
      ).subscribe();
    }
  }

  public onFilter(value) {
    if (this.filter) {
      this.filter.value = value;
    }
    this.update.emit({ filter: this.filter, value });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}

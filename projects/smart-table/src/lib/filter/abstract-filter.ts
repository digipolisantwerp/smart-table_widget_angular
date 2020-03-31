import {EventEmitter, Input, OnDestroy, Output} from '@angular/core';

import {SmartTableFilter, UpdateFilterArgs} from '../smart-table/smart-table.types';
import {FormControl} from '@angular/forms';
import {Subject} from 'rxjs';

export abstract class AbstractFilter implements OnDestroy {
  @Input() filter: SmartTableFilter;
  @Input() optional = false;
  @Output() update = new EventEmitter<UpdateFilterArgs>();

  public id: string;
  public value: string;

  public formControl: FormControl = new FormControl();
  public destroy$ = new Subject();

  public onFilter(value) {
    this.filter.value = value;
    this.update.emit({filter: this.filter, value});
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

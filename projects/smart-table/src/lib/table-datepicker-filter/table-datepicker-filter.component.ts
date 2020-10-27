import {Component, OnInit} from '@angular/core';
import _ from 'lodash';
import {AbstractFilterComponent} from '../filter/abstract-filter-component';

@Component({
  selector: 'aui-table-datepicker-filter',
  templateUrl: 'table-datepicker-filter.component.html',
  styleUrls: ['../filter/filter.component.scss']
})
export class TableDatepickerFilterComponent extends AbstractFilterComponent implements OnInit {
  ngOnInit() {
    if (this.filter && _.isString(this.filter.value)) {
      this.formControl.setValue(this.filter.value);
    }
  }
}

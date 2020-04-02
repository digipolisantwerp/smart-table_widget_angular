import {Component, OnInit} from '@angular/core';
import _ from 'lodash';
import {AbstractFilter} from '../filter/abstract-filter';

@Component({
  selector: 'aui-table-datepicker-filter',
  templateUrl: 'table-datepicker-filter.component.html',
  styleUrls: ['../filter/filter.component.scss']
})
export class TableDatepickerFilterComponent extends AbstractFilter implements OnInit {
  ngOnInit() {
    if (this.filter && _.isString(this.filter.value)) {
      this.formControl.setValue(this.filter.value);
    }
  }
}

import {FilterComponent} from '@acpaas-ui/ngx-utils';
import {Component, OnInit} from '@angular/core';
import _ from 'lodash';
import {AbstractFilterComponent} from '../filter/abstract-filter-component';

@Component({
  selector: 'aui-table-input-filter',
  templateUrl: './table-input-filter.component.html',
  styleUrls: ['../filter/filter.component.scss'],
})
export class TableInputFilterComponent extends AbstractFilterComponent implements OnInit, FilterComponent {
  public ngOnInit() {
    if ((this.filter) && (_.isString(this.filter.value))) {
      this.formControl.setValue(this.filter.value);
    }
  }
}

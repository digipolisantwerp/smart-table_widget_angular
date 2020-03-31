import {FilterComponent} from '@acpaas-ui/ngx-components/utils';
import {Component, OnInit} from '@angular/core';
import _ from 'lodash';

import {AbstractFilter} from '../filter/abstract-filter';
import {SmartTableFilter} from '../filter/filter.decorator';

@Component({
  selector: 'aui-table-input-filter',
  templateUrl: './table-input-filter.component.html',
  styles: [':host {flex-grow: 1}']
})
@SmartTableFilter()
export class TableInputFilterComponent extends AbstractFilter implements OnInit, FilterComponent {
  public ngOnInit() {
    if ((this.filter) && (_.isString(this.filter.value))) {
      this.formControl.setValue(this.filter.value);
    }
  }
}

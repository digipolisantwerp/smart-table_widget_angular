import {Component, OnInit} from '@angular/core';
import _ from 'lodash';
import {AbstractFilter} from '../filter/abstract-filter';
import { SearchFilterChoice } from '@acpaas-ui/ngx-forms';

@Component({
  selector: 'aui-table-search-filter',
  templateUrl: 'table-search-filter.component.html',
  styleUrls: ['../filter/filter.component.scss']
})
export class TableSearchFilterComponent extends AbstractFilter implements OnInit {

  ngOnInit() {

    // if (this.filter && _.isString(this.filter.value)) {
    //   this.formControl.setValue(this.filter.value);
    // }
  }
}

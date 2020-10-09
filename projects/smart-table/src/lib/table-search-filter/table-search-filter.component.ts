import {Component, OnInit} from '@angular/core';
import {AbstractFilter} from '../filter/abstract-filter';

@Component({
  selector: 'aui-table-search-filter',
  templateUrl: 'table-search-filter.component.html',
  styleUrls: ['../filter/filter.component.scss']
})
export class TableSearchFilterComponent extends AbstractFilter implements OnInit {

  ngOnInit() {
    if (this.filter && Array.isArray(this.filter.value) && this.filter.value.length) {
      this.formControl.setValue(this.filter.value);
    }
  }
}

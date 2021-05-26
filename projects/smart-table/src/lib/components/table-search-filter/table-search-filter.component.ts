import {Component, OnInit} from '@angular/core';
import {AbstractFilterComponent} from '../filter/abstract-filter-component';

@Component({
  selector: 'aui-table-search-filter',
  templateUrl: 'table-search-filter.component.html',
  styleUrls: ['../filter/filter.component.scss'],
})
export class TableSearchFilterComponent extends AbstractFilterComponent implements OnInit {

  ngOnInit() {
    if (this.filter && Array.isArray(this.filter.value) && this.filter.value.length) {
      this.formControl.setValue(this.filter.value);
    }
  }
}

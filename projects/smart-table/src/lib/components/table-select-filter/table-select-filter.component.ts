import { FilterComponent } from '@acpaas-ui/ngx-utils';
import { Component, OnInit } from '@angular/core';
import { AbstractFilterComponent } from '../filter/abstract-filter-component';

@Component({
  selector: 'aui-table-select-filter',
  templateUrl: './table-select-filter.component.html',
  styleUrls: ['../filter/filter.component.scss']
})
export class TableSelectFilterComponent extends AbstractFilterComponent implements OnInit, FilterComponent {

  public ngOnInit() {
    try {
      if (this.filter && (typeof this.filter.value === 'string')) {
        const foundOption = this.filter.options.find(option => option.id.toLowerCase() === (this.filter.value as string).toLowerCase());
        if (foundOption) {
          this.formControl.setValue(foundOption.id);
        }
      }
    } catch (err) {
      console.error(err);
      console.warn('Warning: could not set select filter value.');
    }

  }
}

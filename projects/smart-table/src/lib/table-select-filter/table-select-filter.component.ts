import {FilterComponent} from '@acpaas-ui/ngx-components/utils';
import {Component, OnInit} from '@angular/core';
import {AbstractFilter} from '../filter/abstract-filter';
import {SmartTableFilter} from '../filter/filter.decorator';

@Component({
  selector: 'aui-table-select-filter',
  templateUrl: './table-select-filter.component.html',
  styles: [':host {flex-grow: 1}']
})
@SmartTableFilter()
export class TableSelectFilterComponent extends AbstractFilter implements OnInit, FilterComponent {

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

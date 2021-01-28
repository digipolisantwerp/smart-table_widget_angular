import {Filter} from '@acpaas-ui/ngx-utils';
import {SmartTableFilterConfig, SmartTableFilterOperator, SmartTableFilterType, UpdateFilterArgs} from '../../smart-table.types';
import {Observable, Subject} from 'rxjs';

export class SmartTableFilter extends Filter {
  type: SmartTableFilterType;
  fields: string[];
  operator?: SmartTableFilterOperator;
  label: string;
  selectedItems: any[];
  placeholder?: string;
  disabled: boolean;
  valueChanges$: Observable<UpdateFilterArgs> = new Subject<UpdateFilterArgs>();

  constructor(_config: SmartTableFilterConfig) {
    super();
    console.log(_config);
    this.id = _config.id;
    this.type = _config.type;
    this.fields = _config.fields ? [..._config.fields] : [_config.field];
    this.operator = _config.operator;
    this.label = _config.label;
    this.placeholder = _config.placeholder;
    this.options = _config.options;
    this.selectedItems = _config.selectedItems;
    this.value = _config.value;
  }
}

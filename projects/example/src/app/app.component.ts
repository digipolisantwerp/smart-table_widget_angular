import {Component} from '@angular/core';
import {AppRatingComponent} from './rating.component';
import {SmartTableColumnCustomType, SmartTableConfig} from '@acpaas-ui-widgets/smart-table';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'example';

  moviesCustomColumns: SmartTableColumnCustomType[] = [{
    name: 'rating',
    component: {
      instance: AppRatingComponent,
      metadata: {ratingType: 'stars'}
    }
  }];

  customConfiguration: SmartTableConfig = {
    options: {
      defaultSortOrder: {
        key: 'title_year',
        order: 'desc'
      },
      persistTableConfig: true,
      storageIdentifier: 'test-smart-table',
      translations: {
        moreFilters: 'Extra filters',
        export: 'Exporteer',
        apply: 'Toepassen',
      }
    }
  };

  onRowClicked(row) {
    console.log('clicked row', row);
  }

  filterChanged(event) {
    console.log('Filter changed:', event);
  }

  logConfig(config: SmartTableConfig) {
    console.log('Configuration:', config);
  }
}

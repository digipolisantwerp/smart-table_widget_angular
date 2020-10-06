import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {SmartTableModule} from 'projects/smart-table/src/public-api';
import {AppRatingComponent} from './rating.component';

@NgModule({
  declarations: [
    AppComponent,
    AppRatingComponent
  ],
  imports: [
    BrowserModule,
    SmartTableModule
      .withLabels({
        itemCounterLabel: {
          singular: '%{currentFrom} - %{currentTo} van %{totalAmount} film',
          plural: '%{currentFrom} - %{currentTo} van %{totalAmount} films',
        },
        itemsPerPageLabel: {
          singular: 'film per pagina',
          plural: 'films per pagina',
        }
      })
      .forRoot({
        identifier: 'aui-smarttable-ngx',
        storageType: 'sessionStorage'
      })
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [AppRatingComponent]
})
export class AppModule {
}

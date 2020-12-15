import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {SmartTableModule} from 'projects/smart-table/src/public-api';
import {AppRatingComponent} from './rating.component';
import {StoreModule} from '@ngrx/store';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {EffectsModule} from '@ngrx/effects';

@NgModule({
  declarations: [
    AppComponent,
    AppRatingComponent
  ],
  imports: [
    BrowserModule,
    SmartTableModule
      .forRoot({
        identifier: 'aui-smarttable-ngx',
        storageType: 'sessionStorage',
        labels: {
          itemCounterLabel: {
            singular: '%{currentFrom} - %{currentTo} van %{totalAmount} film',
            plural: '%{currentFrom} - %{currentTo} van %{totalAmount} films',
          },
          itemsPerPageLabel: {
            singular: 'film per pagina',
            plural: 'films per pagina',
          }
        }
      }),
    StoreModule.forRoot({}),
    StoreDevtoolsModule.instrument(),
    EffectsModule.forRoot([])
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [AppRatingComponent]
})
export class AppModule {
}

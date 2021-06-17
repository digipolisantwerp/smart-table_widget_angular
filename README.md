# Smart Table Widget (Angular)

This is the Angular 6+ UI for a Smart Widget implementing a table whose configuration is provided by the backend. When the corresponding API is implemented in the BFF, it provides automatic support for column types, filtering, pagination and sorting without additional client-side coding.

![screenshot](example.png)

Check the latest changes in the [changelog](CHANGELOG.md).

## Run the example app

A showcase app for the smart table component:

```sh
> npm install
> npm start
```

Browse to [localhost:4200](http://localhost:4200)

## How to use

### Installing

```sh
> npm install @acpaas-ui-widgets/ngx-smart-table
```

### Using

Prerequisite: set up [Antwerp UI](https://github.com/digipolisantwerp/antwerp-ui_angular/) for your application.

Import the component in your module:

```ts
import { SmartTableModule } from '@acpaas-ui-widgets/ngx-smart-table';

@NgModule({
  imports: [
    ...,
    SmartTableModule
  ],
  ...
})
```

### In your template:

```html
<aui-smart-table
  apiUrl="/api/your-table-bff"
  (rowClicked)="onRowClicked($event)">
</aui-smart-table>
```

#### Importing Using Custom Labels
```ts
SmartTableModule.withLabels
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
       },
       columnOrdering: {   // Optional
         orderBefore: 'Verplaats kolom naar voor',
         orderAfter: 'Verplaats kolomn naar achter'
       }
    },
    options: {
      useLowerCaseQueryParams: true,    // Some APIs require all lower case query params
      noConfigApiCall: false,    // Skip the /config call and provide all config in the frontend
      noExport: false // If true hides the export button
      exportWithFilters: false // If true filters and sorting will be respected in export. pagination will still be removed.
    }
  })
```

The `apiUrl` points to the corresponding back-end service (see below).

In the component code:

```ts
class YourComponent {

    onRowClicked(row) {
      // do something...
    }
}
```

Every value in the backing list must have a unique id.

### Module configuration
- **options.useLowerCaseQueryParams**: (default false) If true, will parse query params to all lower case vaules (if any). Some api's cannot handle camelcase or uppercase parameters, thus this option enables flexibility.
- **options.noConfigApiCall**: (default false). By default the Smart Table will query `/config` to get default setup configuration. Setting this option to true will enable the component to
parse frontend-only configuration by setting the *configuration* attribute on the component, without making backend config calls.
  - **options.noExport**: If true, hides the export button
  - **options.exportWithFilters**: If False, export will respect the set filters & order

### Supported attributes

- **apiUrl**: the URL of the back-end service feeding this widget
- **httpHeaders**: custom headers to provide to the server with every request
- **columnTypes**: custom column types, with special formatting or their own renderer component
- **configuration**: custom configuration that will be merged with the BFF configuration. These attributes overwrite BFF configuration.

Check the example application for how these are used.

### Events

- **rowClicked**: triggers when the user clicks on a row
- **filter**: Emits the array of filters active on the table (with their current value)

### Back-end protocol

The smart table loads its configuration and data from a back-end service provided by the `apiUrl` input.

Look at `projects/example-api/api.js` for the example API.

This back-end service must implement the following protocol:

- POST `/path/to/endpoint?page=1&pageSize=20`
  - Fetch the rows of a given page, with the specified filtering and sorting.
  - `page` starts from 1, `pageSize` is the number of rows per page.
- POST `/path/to/endpoint/all`
  - Fetch all rows (with filtering and sorting) for excel export.
- GET `/path/to/endpoint/config`
  - Fetch the smart table configuration.
  - See `SmartTableConfig` in [projects/smart-table/src/lib/smart-table/smart-table.types.ts](projects/smart-table/src/lib/smart-table.types.ts).

The `POST` endpoints accept the following JSON body:

```js
{
  "filters": [{
    "fields": string[], /* field id's */
    "operator": string, /* '=' or 'ILIKE' */
    "value": string|{ id: string }
  }, ...],
  "sort": {
    "path": string /* field id */,
    "ascending": boolean
  }
}
```

And they return the following response:

```js
{
  "_embedded": {
    "resourceList": [{
      "field_id": "value"
    }]
  },
  "_page": {
    "size": number /* nr of rows per page */,
    "totalElements": number /* nr of rows across all pages */,
    "totalPages": number /* nr of pages */,
    "number": number /* current page, starts from 1 */,
  }
}
```

## Features

### Column state persistence

By default the column visibility is automatically saved in `localStorage` under the `aui-smart-table` prefix.
This may cause conflicts with other apps running on the same URL, especially on localhost.
To configure column visibility to use a different storage prefix for your app, include the module in this way:

```ts
SmartTableModule.forRoot({
  identifier: 'your-unique-identifier', // default = aui-smart-table
  storageType: 'localStorage' // localStorage (default) / sessionStorage / memory
})
```

Use an identifier unique for your application.

On each table the persistence is adjusted with the configuration fields:
- `options.persistTableConfig` (boolean): whether the column settings are persisted locally
- `options.storageIdentifier` (string): the identifier to store settings in for this table (should be unique per table)

The column settings will be persisted to the storage configured in SmartTableModule using the settings provided in the table options.

### Configuration

The smart table determines its functionality from the provided configuration.

This is provided in two ways:
- `GET .../config`, a call to the server to fetch the configuration
- `customConfiguration`, a local override for the values obtained from the server

The complete configuration object can be found in `src/lib/smart-table/smart-table.types.ts` as `SmartTableConfig`.

An explanation of the properties of the configuration object:
- `columns`: array, the columns configuration  of the table
  - `type`: string, `text`/`number`/`date`/`dateTime`
  - `key`: string, field key in the row data object, also used for state persistence
  - `label`: string, text to show in column header
  - `visible`: boolean, column should be visible by default
  - `classList`: string[], list of custom css classes to apply to the column cells
  - `sortPath`: string, key to sort on (passed to server in data query)
  - `canHide`: boolean, whether the column can be hidden by the user
    (tip: to include columns that are always hidden, put them only in the data object, not in the columns config)
- `filters`: array, the possible filters configuration of the table
  - `id`: string, unique id for the filter
  - `type`: string, how to present the filter: `select`, `input` (text), `datepicker`
  - `display`: string, how to show the filter in the UI
    - `generic`: a google-like search textbox to search across multiple fields, always shown
    - `visible`: field-specific filter control, always shown
    - `optional`: field-specific filter control, hidden behind 'Extra filters' button
  - `label`: string, label to show next to filter control
  - `field`: string, key of the field (column) to filter on
  - `fields`: string[], keys of the fields to filter on, for filter type `generic`
  - `operator`: string, operator to compare the value with, `=` / `ILIKE`
  - `options`: {id: string, label: string}[], content of dropdown list for filter type `select`
  - `placeholder`: string
  - `value`: string | {id: string, label: string}[]
- `baseFilters`: array, a set of fixed and hidden filters to always apply to data requests
  - `fields`: string[], keys of the fields to filter on
  - `operator`: string, operator to compare the value with, `=` / `ILIKE`
  - `value`: string | {id: string, label: string}[]
- `options`: object, other configuration for the table
  - `defaultSortOrder`: { key: string, order: 'asc'|'desc' }, initial sort order
  - `loadDataMessage`: string, shown while loading
  - `noDataMessage`: string, shown when empty
  - `errorMessage`: string, shown when loading failed
  - `pageSize`: number, initial page size (in rows)
  - `pageSizeOptions`: number[], choices presented for page size in the UI
  - `resetSortOrderOnFilter`: boolean, return to default sort order when changing filters
  - `columnDateTimeFormat`: string, default format for date/time columns, see https://angular.io/api/common/DatePipe
  - `columnDateFormat`: string, default format for date columns, see https://angular.io/api/common/DatePipe
  - `storageIdentifier`: string, unique key for persisting column state
  - `persistTableConfig`: boolean, true to persist column state
  - `translations`: object, translation strings to replace default (Dutch) text in UI (see `smart-table.types.ts`)

### Custom Columns

The default column types are text, number, date and dateTime. Sometimes a special column type is needed.

In the showcase example there is a custom column for the star rating.

To implement a custom column:
- Implement a component that subclasses `Cell` from ngx-table. Use `rating.component.ts` as an example.
- Include this custom column component in the smart table attributes as a custom column type:
  ```html
  <aui-smart-table
      [columnTypes]="myCustomColumns"
  ```
  ```js
  myCustomColumns = [{
    name: 'mycustom',
    component: MyCustomColumnComponent
  }];
  ```
- Specify this custom type as the column type in the configuration:
  ```js
  columns: [{
    key: 'myfield',
    label: 'Custom column',
    type: 'mycustom'
  }]
  ```

## Contributing

We welcome your bug reports and pull requests.

Please see our [contribution guide](CONTRIBUTING.md).

## Support

Joeri Sebrechts (<joeri.sebrechts@digipolis.be>)

## License

This project is published under the [MIT license](LICENSE).

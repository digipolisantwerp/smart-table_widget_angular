# Changelog

All notable changes to this project will be documented in this file.

## [3.0.0] - 2022-06-23

### Changed

- Angular, Node & Core branding update

## [2.0.2] - 2022-02-04

### Fixed

- Fixed localstorage deep imports
- Added names for external modules

## [2.0.1] - 2021-07-30

### Fixed

- Fix datepicker filter so it only sends valid values to the server (fixes #34)

## [2.0.0] - 2021-06-17

### Changed

- [BREAKING] Upgraded the component to work with Angular 8
- [BREAKING] Replaced FontAwesome icons with all new Streamline icons
- [BREAKING] Upgraded to core branding v5

## [1.13.1] - 2021-05-26

### Fixed

- Fixed a bug introduced while testing the new filter export feature

## [1.13.0] - 2021-05-26

### Added

- Added option to export with filters

## [1.12.1] - 2021-04-29

### Fixed

- Fixed layout of column selector layout when there's a large amount of columns

## [1.12.0] - 2021-03-12

### Added

- Added date-check when formatting date(Time) columns

### Fixed

- Added styling to handle very long column names

## [1.11.5] - 2021-02-26

### Fixed

- `options.columnDateFormat` and `options.columnDateTimeFormat` were ignored
- `options.storageIdentifier` was ignored if provided from server config

## [1.11.4] - 2021-02-22

### Fixed

- Fixed an issue where a filter was visually reset while it was still active
- Fixed an issue where a filter was only visually working

## [1.11.3] - 2021-02-05

### Fixed

- Fixed `@acpaas-ui` dependency graph

## [1.11.2] - 2021-02-05

### Fixed

- Fixed an issue with setting a default value for a datepicker filter

## [1.11.1] - 2021-02-02

### Fixed

- Select filter - Don't set the defaultSelection to the placeholder when a value is set

## [1.11.0] - 2021-01-25

### Added

- `noExport` option in the module configuration, which can hide the export button

## [1.10.0] - 2021-01-19

### Added

- `useLowerCaseQueryParams` option in the module configuration. When set to true, all calls will use all
  lower case query parameters. This is required for some APIs.
- `noConfigApiCall`: option in the module configuration. When set to true, the smart table
  won't make any /config calls, so that configuration and setup may be provided entirely in the frontend.

## [1.9.1] - 2021-01-15

### Fixed

- Fixed broken filters when there is no generic filter
- Fixed missing dependency @angular/cdk in package.json
- Fixed infinite loop issue when `resetSortOrderOnFilter` option is set to true in config

## [1.9.0] - 2021-01-13

### Added

- 'configurationChanged' output that emits the latest configuration. This is a read only property.

## [1.8.1] - 2021-01-06

### Changed

- Removed the 'apply' button when hiding/ordering columns. Changes are immediately reflected.

## [1.8.0] - 2021-01-04

### Added

- Option to change order of the columns in the table, choices can be persisted.

### Changed

- Configuration is stored and updated in the configuration.service
- Configuration can be set manually

## [1.7.1] - 2020-11-16

### Fixed

- Cannot sort the table until a filter is applied

## [1.7.0] - 2020-10-27

### Fixed

- AOT build errors due to incorrect use of static builder methods when importing the module
- Unpredictable rxjs skip() operators for filters

### Added

- (filter) output that emits the active filters of the smart table

## [1.6.0] - 2020-10-15

### Added

- Upgraded @acpaas-ui/ngx-table version to 4.5, adding metadata functionality to custom cells
- Added ption in forRoot() module method to configure custom filters
- Added search filter component as optional filter (type: 'search-filter')

### Fixed

- When applying a filter, the pagination will go back to page 1
- Fixed display time for DateTime type columns

## [1.5.7] - 2020-08-21

### Fixed

- Fixed issue with baseFilters not being loaded from initial configuration

## [1.5.6] - 2020-07-06

### Fixed

- Fixed error where rows would never be loaded if no custom config was set

## [1.5.5] - 2020-06-18

### Fixed

- Fixed an issue where the table's sort order wasn't persisted correctly in local storage

## [1.5.4] - 2020-06-10

### Fixed

- Fixed an issue where the table's sort order wasn't persisted in local storage

## [1.5.3] - 2020-06-09

### Fixed

- Fixed an issue where a select's placeholder would not get selected in Chrome

## [1.5.2] - 2020-05-29

### Fixed

- Fixed an Angular compiling issue

## [1.5.1] - 2020-05-29

### Fixed

- A select filter can now be reset
- Console error when storage identifier is not passed through when importing the module using forRoot()

## [1.5.0] - 2020-04-21

### Changed

- Upgraded to ACPaaS UI v4
- Use Observable sequences for data synchronizing

### Fixed

- Persist hide/show columns in storage of choice
- Fixed translations not coming from configuration
- Fixed order in which component configuration overrides api configuration

## [1.4.2] - 2020-04-06

### Fixed

- Overflow visibility issue with extra filters

## [1.4.1] - 2020-04-02

### Fixed

- Filter class build error due to decorators

## [1.4.0] - 2020-04-02

### Changed

- Table filters are now based on Reactive Forms
- Flexible grid for extra filters, better mobile support

### Added

- Decorator support for smart table filters

## [1.3.0] - 2020-03-11

### Added

- Made the smart table widget WCAG 2.1 AA compliant.

## [1.2.1] - 2020-02-14

### Fixed

- Fixed responsive behaviour
- Made the table more accessible

## [1.2.0] - 2020-01-06

### Added

- Added the possibility to prevent columns from hiding

## [1.1.4] - 2019-11-14

### Fixed

- "this.configuration is undefined" error when initializing
- "cannot convert undefined or null to object" error when initializing

## [1.1.2] - 2019-11-05

### Fixed

- Cosmetic issues with filters
- Don't show persisted columns that are not in the config
- Fix broken path for `all` endpoint

## [1.1.0] - 2019-11-05

### Added

- Excel export
- Remember column visibility in localstorage

## [1.0.0] - 2019-07-19

- Initial release.

[Unreleased]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v2.0.2...HEAD
[2.0.2]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.13.1...v2.0.0
[1.13.1]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.13.0...v1.13.1
[1.13.0]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.12.1...v1.13.0
[1.12.1]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.12.0...v1.12.1
[1.12.0]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.11.5...v1.12.0
[1.11.5]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.11.4...v1.11.5
[1.11.4]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.11.3...v1.11.4
[1.11.3]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.11.2...v1.11.3
[1.11.2]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.11.1...v1.11.2
[1.11.1]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.11.0...v1.11.1
[1.11.0]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.10.1...v1.11.0
[1.10.0]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.9.1...v1.10.0
[1.9.1]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.9.0...v1.9.1
[1.9.0]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.8.1...v1.9.0
[1.8.1]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.8.0...v1.8.1
[1.8.0]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.7.1...v1.8.0
[1.7.1]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.7.0...v1.7.1
[1.7.0]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.5.7...v1.6.0
[1.5.7]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.5.6...v1.5.7
[1.5.6]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.5.5...v1.5.6
[1.5.5]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.5.4...v1.5.5
[1.5.4]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.5.3...v1.5.4
[1.5.3]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.5.2...v1.5.3
[1.5.2]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.5.1...v1.5.2
[1.5.1]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.4.2...v1.5.0
[1.4.2]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.4.1...v1.4.2
[1.4.1]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.2.1...v1.3.0
[1.2.1]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.1.4...v1.2.0
[1.1.4]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.1.2...v1.1.4
[1.1.2]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.1.0...v1.1.2
[1.1.0]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v0.0.1...v1.0.0

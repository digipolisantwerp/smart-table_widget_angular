# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]
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


[Unreleased]: https://github.com/digipolisantwerp/smart-table_widget_angular/compare/v1.8.1...HEAD
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

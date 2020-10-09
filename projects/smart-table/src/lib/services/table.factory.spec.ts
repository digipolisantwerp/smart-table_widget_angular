import {TestBed} from '@angular/core/testing';
import {TableFactory} from './table.factory';
import {DatePipe} from '@angular/common';
import {SmartTableColumnType} from '../smart-table/smart-table.types';

describe('Table Factory Test', () => {
  let datePipe: DatePipe;
  let factory: TableFactory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TableFactory,
        DatePipe
      ]
    });
    datePipe = TestBed.get(DatePipe);
    factory = TestBed.get(TableFactory);
  });

  describe('Creating Columns', () => {
    it('should create a date column in date format, default component', () => {
      const column = factory.createTableColumnFromConfig({
        visible: true,
        label: 'test-column',
        key: 'test-key',
        type: SmartTableColumnType.Date,
        sortPath: 'none'
      }, []);
      // Now let's format a date
      const d = new Date(2019, 8, 10, 6, 23);
      expect(column.format(d as any)).toBe('10/09/2019');
    });
    it('should create a date column in datetime format, default component', () => {
      const column = factory.createTableColumnFromConfig({
        visible: true,
        label: 'test-column',
        key: 'test-key',
        type: SmartTableColumnType.DateTime,
        sortPath: 'none'
      }, []);
      // Now let's format a date
      const d = new Date(2019, 8, 10, 6, 23);
      expect(column.format(d as any)).toBe('10/09/2019 - 06:23');
    });
  });
});

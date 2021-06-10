import { TestBed } from '@angular/core/testing';
import { TableFactory } from './table.factory';
import { DatePipe } from '@angular/common';
import { SmartTableColumnType } from '../smart-table.types';

describe('Table Factory Test', () => {
  let datePipe: DatePipe;
  let factory: TableFactory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TableFactory,
        DatePipe,
      ],
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
        sortPath: 'none',
      }, []);
      // Now let's format a date
      const d = new Date(2019, 8, 10, 6, 23);
      expect(column.format(d as any)).toBe('10/09/2019');
    });
    it('should create a date column in date format for date string, default component', () => {
      const column = factory.createTableColumnFromConfig({
        visible: true,
        label: 'test-column',
        key: 'test-key',
        type: SmartTableColumnType.Date,
        sortPath: 'none',
      }, []);
      // Now let's format a date
      const d = '2020-08-10';
      expect(column.format(d as any)).toBe('10/08/2020');
    });
    it('should create a date column with empty value for invalid date string, default component', () => {
      const column = factory.createTableColumnFromConfig({
        visible: true,
        label: 'test-column',
        key: 'test-key',
        type: SmartTableColumnType.Date,
        sortPath: 'none',
      }, []);
      // Now let's format a date
      const d = 'ABC';
      expect(column.format(d as any)).toBe('');
    });
    it('should create a date column in datetime format, default component', () => {
      const column = factory.createTableColumnFromConfig({
        visible: true,
        label: 'test-column',
        key: 'test-key',
        type: SmartTableColumnType.DateTime,
        sortPath: 'none',
      }, []);
      // Now let's format a date
      const d = new Date(2019, 8, 10, 6, 23);
      expect(column.format(d as any)).toBe('10/09/2019 - 06:23');
    });
    it('should create a dateTime column in datetime format for datetime string, default component', () => {
      const column = factory.createTableColumnFromConfig({
        visible: true,
        label: 'test-column',
        key: 'test-key',
        type: SmartTableColumnType.DateTime,
        sortPath: 'none',
      }, []);
      // Now let's format a date
      const d = '2020-08-10T08:13:13.584Z';
      const date = new Date('2020-08-10T08:13:13.584Z');
      expect(column.format(d as any)).toBe(`10/08/2020 - ${date.getHours().toString().padStart(2, '0')}:13`);
    });
    it('should create a dateTime column with empty value for invalid datetime string, default component', () => {
      const column = factory.createTableColumnFromConfig({
        visible: true,
        label: 'test-column',
        key: 'test-key',
        type: SmartTableColumnType.DateTime,
        sortPath: 'none',
      }, []);
      // Now let's format a date
      const d = 'ABC';
      expect(column.format(d as any)).toBe('');
    });
    it('should create a date column and take into account optinos, default component', () => {
      const column = factory.createTableColumnFromConfig({
        visible: true,
        label: 'test-column',
        key: 'test-key',
        type: SmartTableColumnType.Date,
        sortPath: 'none',
      }, [], { columnDateFormat: 'yyyy/MM' });
      // Now let's format a date
      const d = new Date(2019, 8, 10, 6, 23);
      expect(column.format(d as any)).toBe('2019/09');
    });
  });
});

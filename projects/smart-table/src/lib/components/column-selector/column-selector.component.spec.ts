import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TableColumnSelectorComponent} from './column-selector.component';
import {ConfigurationService} from '../../services/configuration.service';
import * as sinon from 'sinon';
import {SinonStub} from 'sinon';
import {FlyoutService} from '@acpaas-ui/ngx-flyout';
import {IOrderingLabels, SmartTableColumnConfig, SmartTableConfig} from '../../smart-table.types';
import {cold} from 'jasmine-marbles';
import {PROVIDE_SORT_LABELS} from '../../providers/sort-labels.provider';

describe('TableColumnSelectorComponent', () => {
  let component: TableColumnSelectorComponent;
  let fixture: ComponentFixture<TableColumnSelectorComponent>;
  let configurationService: ConfigurationService;
  let mockColumns: SmartTableColumnConfig[];
  let mockConfiguration: SmartTableConfig;
  let mockLabels: IOrderingLabels;

  beforeEach(async () => {
    mockLabels = {
      orderAfter: 'sort above',
      orderBefore: 'sort underneath'
    };
    await TestBed.configureTestingModule({
      declarations: [TableColumnSelectorComponent],
      providers: [
        {
          provide: ConfigurationService,
          useValue: sinon.createStubInstance(ConfigurationService)
        },
        {
          provide: FlyoutService,
          useValue: sinon.createStubInstance(FlyoutService)
        },
        {
          provide: PROVIDE_SORT_LABELS,
          useValue: mockLabels
        }
      ]
    }).compileComponents();

    mockColumns = [
      {key: 'a', orderIndex: 2},
      {key: 'b', orderIndex: 0},
      {key: 'c', orderIndex: 1}
    ] as any;
    configurationService = TestBed.get(ConfigurationService);
    mockConfiguration = {
      columns: mockColumns,
      filters: [],
      baseFilters: [],
      options: {
        storageIdentifier: 'id',
        persistTableConfig: false,
      }
    };
    fixture = TestBed.createComponent(TableColumnSelectorComponent);
    component = fixture.componentInstance;
  });

  describe('Pending Columns (operation)', () => {
    it('should start out with the columns from the configuration, sorted by index', () => {
      (configurationService.getConfiguration as SinonStub).returns(cold('----a', {
        a: {
          ...mockConfiguration
        }
      }));
      fixture.detectChanges();
      const result$ = component.pendingColumnOperation$;
      expect(result$).toBeObservable(cold('----a', {
        a: [
          {key: 'b', orderIndex: 0},
          {key: 'c', orderIndex: 1},
          {key: 'a', orderIndex: 2}
        ]
      }));
    });
    it('should toggle column visibility', () => {
      mockColumns[0].visible = false; // A
      mockColumns[2].visible = true; // C
      (configurationService.getConfiguration as SinonStub).returns(cold('----a', {
        a: {
          ...mockConfiguration,
          columns: [...mockColumns]
        }
      }));
      fixture.detectChanges();
      component.toggleColumnsVisibility$.next('a');
      component.toggleColumnsVisibility$.next('c');
      component.toggleColumnsVisibility$.next('b'); // All toggled, but all in different ways
      fixture.detectChanges();
      const result$ = component.pendingColumnOperation$;
      expect(result$).toBeObservable(cold('----(aa)', {
        a: [
          {key: 'b', orderIndex: 0, visible: false},
          {key: 'c', orderIndex: 1, visible: true},
          {key: 'a', orderIndex: 2, visible: false}
        ]
      }));
    });
    it('should move a column by sort index', () => {
      (configurationService.getConfiguration as SinonStub).returns(cold('---a', {a: {...mockConfiguration}}));
      fixture.detectChanges();
      component.updateSortIndexByKey$.next({oldIndex: 0, newIndex: 2});
      fixture.detectChanges();
      const result$ = component.pendingColumnOperation$;
      expect(result$).toBeObservable(cold('---(ab)', {
        a: [
          {key: 'c', orderIndex: 0},
          {key: 'a', orderIndex: 1},
          {key: 'b', orderIndex: 2}
        ],
        b: [
          {key: 'b', orderIndex: 0},
          {key: 'c', orderIndex: 1},
          {key: 'a', orderIndex: 2}
        ]
      }));
    });
  });
  describe('Labels', () => {
    it('should put correct labels', () => {
      (configurationService.getConfiguration as SinonStub).returns(cold('--a', {a: {}}));
      fixture.detectChanges();
      expect(component.labels).toEqual(mockLabels);
    });
  });
});

import {TableSelectFilterComponent} from './table-select-filter.component';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import * as sinon from 'sinon';

describe('Table Select Filter Test', () => {
  let component: TableSelectFilterComponent;
  let fixture: ComponentFixture<TableSelectFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TableSelectFilterComponent,
      ],
      imports: [
        ReactiveFormsModule,
        CommonModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TableSelectFilterComponent);
    component = fixture.componentInstance;
  });

  describe('Creation', () => {
    it('should create a component', () => {
      fixture.detectChanges();
      expect(fixture).toBeDefined();
      expect(component).toBeDefined();
    });
  });

  describe('Setting Value', () => {
    it('should set the initial value', () => {
      const options = [
        {
          id: '1',
          label: 'one',
        },
        {
          id: '2',
          label: 'two',
        },
        {
          id: '3',
          label: 'three',
        },
      ];
      component.filter = {
        options,
        value: '2',
      } as any;
      const spy = sinon.spy(component.formControl, 'setValue');
      fixture.detectChanges();
      expect(spy.withArgs('2').calledOnce).toBe(true);
    });
    it('should fail to set the value if option is not in select', () => {
      const options = [];
      const spy = sinon.spy(component.formControl, 'setValue');
      component.filter = {
        options,
        value: 'inexistent',
      } as any;
      fixture.detectChanges();
      expect(spy.called).toBe(false);
    });
  });
});

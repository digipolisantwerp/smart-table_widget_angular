import {TableInputFilterComponent} from './table-input-filter.component';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import * as sinon from 'sinon';
import {SinonSpy} from 'sinon';

describe('Table Input Filter', () => {
  let component: TableInputFilterComponent;
  let fixture: ComponentFixture<TableInputFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TableInputFilterComponent,
      ],
      imports: [
        ReactiveFormsModule,
        CommonModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TableInputFilterComponent);
    component = fixture.componentInstance;
  });

  describe('Creation', () => {
    it('should create a component', () => {
      fixture.detectChanges();
      expect(component).toBeDefined();
      expect(fixture).toBeDefined();
    });
  });

  describe('Setting Value', () => {
    it('should set the initial value', () => {
      const spy: SinonSpy = sinon.spy(component.formControl, 'setValue');
      component.filter = {
        value: 'hey there',
      } as any;
      fixture.detectChanges();
      expect(spy.withArgs('hey there').calledOnce).toBe(true);
    });
  });
});

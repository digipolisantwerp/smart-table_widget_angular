import { TestBed, async } from '@angular/core/testing';
import { SmartTableComponent } from './smart-table.component';

describe('SmartTableComponent', () => {
  beforeEach(async(() => {
    /*TestBed.configureTestingModule({
      declarations: [
        SmartTableComponent
      ],
    }).compileComponents();*/
  }));

  // TODO: add tests

  xit('should create the component', () => {
    const fixture = TestBed.createComponent(SmartTableComponent);
    const cmp = fixture.debugElement.componentInstance;
    expect(cmp).toBeTruthy();
  });

});

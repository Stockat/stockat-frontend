import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderAnalysisComponent } from './order-analysis.component';

describe('OrderAnalysisComponent', () => {
  let component: OrderAnalysisComponent;
  let fixture: ComponentFixture<OrderAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderAnalysisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

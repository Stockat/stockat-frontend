import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyerBidsComponent } from './buyer-bids.component';

describe('BuyerBidsComponent', () => {
  let component: BuyerBidsComponent;
  let fixture: ComponentFixture<BuyerBidsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuyerBidsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuyerBidsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

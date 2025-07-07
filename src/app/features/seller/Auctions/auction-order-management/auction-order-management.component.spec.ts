import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionOrderManagementComponent } from './auction-order-management.component';

describe('AuctionOrderManagementComponent', () => {
  let component: AuctionOrderManagementComponent;
  let fixture: ComponentFixture<AuctionOrderManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuctionOrderManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuctionOrderManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

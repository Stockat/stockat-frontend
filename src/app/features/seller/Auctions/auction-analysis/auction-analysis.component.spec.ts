import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionAnalysisComponent } from './auction-analysis.component';

describe('AuctionAnalysisComponent', () => {
  let component: AuctionAnalysisComponent;
  let fixture: ComponentFixture<AuctionAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuctionAnalysisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuctionAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

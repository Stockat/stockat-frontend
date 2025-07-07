import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionsViewComponent } from './auctions-view.component';

describe('AuctionsViewComponent', () => {
  let component: AuctionsViewComponent;
  let fixture: ComponentFixture<AuctionsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuctionsViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuctionsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

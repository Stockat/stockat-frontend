import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionsListComponent } from './auctions-list.component';

describe('AuctionsListComponent', () => {
  let component: AuctionsListComponent;
  let fixture: ComponentFixture<AuctionsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuctionsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuctionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionCreateDialogComponent } from './auction-create-dialog.component';

describe('AuctionCreateDialogComponent', () => {
  let component: AuctionCreateDialogComponent;
  let fixture: ComponentFixture<AuctionCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuctionCreateDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuctionCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

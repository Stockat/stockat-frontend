import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionEditDialogComponent } from './auction-edit-dialog.component';

describe('AuctionEditDialogComponent', () => {
  let component: AuctionEditDialogComponent;
  let fixture: ComponentFixture<AuctionEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuctionEditDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuctionEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

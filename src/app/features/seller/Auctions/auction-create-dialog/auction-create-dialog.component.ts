import { Component, EventEmitter, Input, OnInit, Output, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AuctionService } from '../../../../core/services/auction.service';
import { AuctionCreateDto } from '../../../../core/models/auction-models/auction-create-dto';
import { StockModel } from '../../../../../app/core/models/stock-models/stock';
import { ProductDetailsDto } from '../../../../core/models/product-models/ProductDetails';
import { UserService } from '../../../../core/services/user.service';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Calendar } from 'primeng/calendar';

@Component({
  selector: 'app-auction-create-dialog',
  imports:[
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    CalendarModule,
    ButtonModule
  ],
  templateUrl: './auction-create-dialog.component.html',
  styleUrls: ['./auction-create-dialog.component.css']
})
export class AuctionCreateDialogComponent implements OnInit, AfterViewInit {
  @Input() visible: boolean = false;
  @Input() stock: StockModel | null = null;
  @Input() product: ProductDetailsDto | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() auctionCreated = new EventEmitter<void>();

  @ViewChild('startCalendar') startCalendar: Calendar | undefined;
  @ViewChild('endCalendar') endCalendar: Calendar | undefined;

  auctionForm: FormGroup;
  creatingAuction = false;
  
  // Date constraints
  minStartDate = new Date();
  maxStartDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
  minEndDate = new Date();
  maxEndDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));

  constructor(
    private fb: FormBuilder,
    private auctionService: AuctionService,
    private userService: UserService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.auctionForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      startingPrice: [0.01, [Validators.required, Validators.min(0.01)]],
      incrementUnit: [1.00, [Validators.required, Validators.min(0.01)]],
      quantity: [{value: 1, disabled: true}, [Validators.required, Validators.min(1)]],
      startTime: [null, [Validators.required]],
      endTime: [null, [Validators.required]],
      productId: [0, Validators.required],
      stockId: [0, Validators.required],
      sellerId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.auctionForm.get('startTime')?.valueChanges.subscribe((startTime) => {
      if (startTime) {
        this.minEndDate = new Date(startTime);
        this.cdr.detectChanges();
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.startCalendar) this.startCalendar.overlayVisible = true;
      if (this.endCalendar) this.endCalendar.overlayVisible = true;
      this.cdr.detectChanges();
    }, 0);
  }

  ngOnChanges(): void {
    if (this.stock && this.product) {
      this.setupAuctionForm();
    }
  }

  setupAuctionForm(): void {
    this.userService.getCurrentUser().subscribe({
      next: (res) => {
        const sellerId = res.data.id;
        this.auctionForm.patchValue({
          productId: this.stock!.productId,
          stockId: this.stock!.id,
          sellerId: sellerId,
          quantity: this.stock!.quantity
        });
        this.auctionForm.get('quantity')?.disable();
      },
      error: (err) => {
        console.error("Failed to get current user", err);
      }
    });
    this.auctionForm.controls['quantity'].setValidators([
      Validators.required,
      Validators.min(1),
      Validators.max(this.stock!.quantity)
    ]);
    this.auctionForm.controls['quantity'].updateValueAndValidity();
    this.auctionForm.patchValue({ quantity: this.stock!.quantity });
    this.auctionForm.get('quantity')?.disable();
  }

  closeDialog(): void {
    this.close.emit();
  }

  createAuction(): void {
    if (this.auctionForm.invalid) return;
    this.creatingAuction = true;
    const auctionData: AuctionCreateDto = this.auctionForm.getRawValue();
    auctionData.startTime = new Date(auctionData.startTime).toISOString();
    auctionData.endTime = new Date(auctionData.endTime).toISOString();
    auctionData.quantity = this.stock?.quantity || 1;
    this.auctionService.createAuction(auctionData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Auction created successfully'
        });
        this.creatingAuction = false;
        this.auctionCreated.emit();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create auction: ' + (err.error?.message || 'Unknown error')
        });
        this.creatingAuction = false;
      }
    });
  }
}
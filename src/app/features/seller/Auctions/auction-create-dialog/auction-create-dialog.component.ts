import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
export class AuctionCreateDialogComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() stock: StockModel | null = null;
  @Input() product: ProductDetailsDto | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() auctionCreated = new EventEmitter<void>();

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
    private messageService: MessageService
  ) {
    this.auctionForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      startingPrice: [0.01, [Validators.required, Validators.min(0.01)]],
      incrementUnit: [1.00, [Validators.required, Validators.min(0.01)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      startTime: [null, [Validators.required]],
      endTime: [null, [Validators.required]],
      productId: [0, Validators.required],
      stockId: [0, Validators.required],
      sellerId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Update minEndDate when startTime changes
    this.auctionForm.get('startTime')?.valueChanges.subscribe((startTime) => {
      if (startTime) {
        this.minEndDate = new Date(startTime);
      }
    });
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
          quantity: 1
        });
      },
      error: (err) => {
        console.error("Failed to get current user", err);
      }
    });
    
    // Set max quantity validator
    this.auctionForm.controls['quantity'].setValidators([
      Validators.required,
      Validators.min(1),
      Validators.max(this.stock!.quantity)
    ]);
    this.auctionForm.controls['quantity'].updateValueAndValidity();
  }

  closeDialog(): void {
    this.close.emit();
  }

  createAuction(): void {
    if (this.auctionForm.invalid) return;
    
    this.creatingAuction = true;
    const auctionData: AuctionCreateDto = this.auctionForm.value;
    
    // Convert dates to UTC
    auctionData.startTime = new Date(auctionData.startTime).toISOString();
    auctionData.endTime = new Date(auctionData.endTime).toISOString();

    
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
import { ChangeDetectorRef, Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { AuctionDetailsDto } from '../../../../../app/core/models/auction-models/auction-details-dto';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { Calendar, CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { AuctionUpdateDto } from '../../../../core/models/auction-models/auction-update-dto';



@Component({
  selector: 'app-auction-edit-dialog',
  imports: [
    TableModule,
    DialogModule,
    DynamicDialogModule,
    ConfirmDialogModule,
    DropdownModule,
    CalendarModule,
    InputNumberModule,
    ButtonModule,
    RippleModule,
    ReactiveFormsModule,
    CommonModule,
    DropdownModule,
    InputTextModule
  ],  
  templateUrl: './auction-edit-dialog.component.html',
  styleUrls: ['./auction-edit-dialog.component.css'],
  providers: [DatePipe]
})
export class AuctionEditDialogComponent implements OnInit, AfterViewInit {
  @ViewChild('startCalendar') startCalendar: Calendar | undefined;
  @ViewChild('endCalendar') endCalendar: Calendar | undefined;
  
  editForm!: FormGroup;
  auction: AuctionDetailsDto;
  editableFields: string[];
  minDate: Date;
  minEndDate: Date | null = null;
  calendarAutoZIndex = true;
  calendarBaseZIndex = 10000;

  constructor(
    private fb: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef,
  ) {
    this.auction = this.config.data.auction;
    this.editableFields = this.config.data.editableFields;
    this.minDate = new Date(); // Today as minimum for any future date
  }

// auction-edit-dialog.component.ts
ngOnInit() {
  this.auction = this.config.data?.auction;
  this.editableFields = this.config.data?.editableFields ?? [];
  
  console.log('Dialog auction:', this.auction);
  console.log('Dialog editableFields:', this.editableFields);
  
  this.createForm();
  
  // Always show all fields, but conditionally enable/disable
}

createForm() {
  // Always create all form controls
  this.editForm = this.fb.group({
    name: [
      this.auction.name,
      this.getValidators('name')
    ],
    description: [
      this.auction.description,
      this.getValidators('description')
    ],
    startTime: [
      new Date(this.auction.startTime),
      this.getValidators('startTime')
    ],
    endTime: [
      new Date(this.auction.endTime),
      this.getValidators('endTime')
    ],
    startingPrice: [
      this.auction.startingPrice,
      this.getValidators('startingPrice')
    ],
    quantity: [
      this.auction.quantity,
      this.getValidators('quantity')
    ],
    productId: [this.auction.productId],
    stockId: [this.auction.stockId],
  });

  // Conditionally disable fields
  this.disableNonEditableFields();
  this.setupDateValidators();
}

private disableNonEditableFields() {
  if (!this.editableFields.includes('name')) {
    this.editForm.get('name')?.disable();
  }
  if (!this.editableFields.includes('description')) {
    this.editForm.get('description')?.disable();
  }
  if (!this.editableFields.includes('startTime')) {
    this.editForm.get('startTime')?.disable();
  }
  if (!this.editableFields.includes('endTime')) {
    this.editForm.get('endTime')?.disable();
  }
  if (!this.editableFields.includes('startingPrice')) {
    this.editForm.get('startingPrice')?.disable();
  }
  if (!this.editableFields.includes('quantity')) {
    this.editForm.get('quantity')?.disable();
  }
}

  // auction-edit-dialog.component.ts
isNameDisabled(): boolean {
  return this.editForm?.get('name')?.disabled || false;
}

isDescriptionDisabled(): boolean {
  return this.editForm?.get('description')?.disabled || false;
}

isStartTimeDisabled(): boolean {
  return this.editForm?.get('startTime')?.disabled || false;
}

isEndTimeDisabled(): boolean {
  return this.editForm?.get('endTime')?.disabled || false;
}

isStartingPriceDisabled(): boolean {
  return this.editForm?.get('startingPrice')?.disabled || false;
}

isQuantityDisabled(): boolean {
  return this.editForm?.get('quantity')?.disabled || false;
}
  
  
  
  // Add new validator
  dateBeforeValidator(maxDate: Date): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const selectedDate = new Date(control.value);
      return selectedDate <= maxDate ? null : { 'dateAfter': true };
    };
  }

  ngAfterViewInit() {
    // Workaround for calendar focus issue
    setTimeout(() => {
      if (this.startCalendar) this.startCalendar.overlayVisible = true;
      if (this.endCalendar) this.endCalendar.overlayVisible = true;
      this.cdr.detectChanges();
    }, 0);
  }

 // auction-edit-dialog.component.ts
// auction-edit-dialog.component.ts
// createForm() {
//   // Create all form controls as enabled
//   this.editForm = this.fb.group({
//     name: [
//       this.auction.name,
//       this.getValidators('name')
//     ],
//     description: [
//       this.auction.description,
//       this.getValidators('description')
//     ],
//     startTime: [
//       new Date(this.auction.startTime),
//       this.getValidators('startTime')
//     ],
//     endTime: [
//       new Date(this.auction.endTime),
//       this.getValidators('endTime')
//     ],
//     startingPrice: [
//       this.auction.startingPrice,
//       this.getValidators('startingPrice')
//     ],
//     quantity: [
//       this.auction.quantity,
//       this.getValidators('quantity')
//     ]
//   });

//   // Conditionally disable fields after form creation
//   if (!this.editableFields.includes('name')) {
//     this.editForm.get('name')?.disable();
//   }
//   if (!this.editableFields.includes('description')) {
//     this.editForm.get('description')?.disable();
//   }
//   if (!this.editableFields.includes('startTime')) {
//     this.editForm.get('startTime')?.disable();
//   }
//   if (!this.editableFields.includes('endTime')) {
//     this.editForm.get('endTime')?.disable();
//   }
//   if (!this.editableFields.includes('startingPrice')) {
//     this.editForm.get('startingPrice')?.disable();
//   }
//   if (!this.editableFields.includes('quantity')) {
//     this.editForm.get('quantity')?.disable();
//   }
// }

isControlDisabled(controlName: string): boolean {
  const control = this.editForm.get(controlName);
  return control ? control.disabled : true;
}

private getValidators(field: string) {
  const validators = [];
  
  // Only add validators if the field is editable
  if (this.editableFields.includes(field)) {
    switch(field) {
      case 'name':
        validators.push(Validators.required, Validators.maxLength(100));
        break;
      case 'description':
        validators.push(Validators.maxLength(500));
        break;
      case 'startTime':
        validators.push(Validators.required, this.futureDateValidator());
        break;
      case 'endTime':
        validators.push(Validators.required, this.futureDateValidator());
        break;
      case 'startingPrice':
        validators.push(Validators.required, Validators.min(0.01));
        break;
      case 'quantity':
        validators.push(Validators.required, Validators.min(1));
        break;
    }
  }
  
  return validators;
}
  

  setupDateValidators() {
    // Set initial minEndDate based on auction start time
    if (this.editableFields.includes('startTime')) {
      const startDate = new Date(this.auction.startTime);
      if (startDate) {
        const minEnd = new Date(startDate);
        minEnd.setHours(minEnd.getHours() + 1);
        this.minEndDate = minEnd;
      }
    }

    // Update end date validation when start date changes
    if (this.editableFields.includes('startTime') && this.editableFields.includes('endTime')) {
      this.editForm.get('startTime')?.valueChanges.subscribe((startDate: Date) => {
        if (startDate) {
          // End date must be at least 1 hour after start
          const minEnd = new Date(startDate);
          minEnd.setHours(minEnd.getHours() + 1);
          this.minEndDate = minEnd;
          
          // Update end time validator
          this.editForm.get('endTime')?.setValidators([
            Validators.required,
            this.futureDateValidator(),
            this.dateAfterValidator(minEnd)
          ]);
          this.editForm.get('endTime')?.updateValueAndValidity();
        }
      });
    }
  }

  // Custom validator for future dates
  futureDateValidator() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const selectedDate = new Date(control.value);
      return selectedDate >= new Date() ? null : { 'pastDate': true };
    };
  }

  // Custom validator for date after another date
  dateAfterValidator(minDate: Date) {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const selectedDate = new Date(control.value);
      return selectedDate >= minDate ? null : { 'dateBefore': true };
    };
  }

  save() {
    if (this.editForm.invalid) return;
    if (!this.auction.productId) {
      console.error('productId is missing or null!');
    }
    
    // Recalculate auction status using ORIGINAL dates
    const now = new Date();
    const originalStart = new Date(this.auction.startTime);
    const originalEnd = new Date(this.auction.endTime);
    
    let currentStatus = 'Upcoming';
    if (now >= originalStart && now <= originalEnd) currentStatus = 'Active';
    if (now > originalEnd) currentStatus = 'Closed';
  
    // Get editable fields based on current status
    const editableFields = this.getEditableFieldsByStatus(currentStatus);

    const payload: any = { 
      id: this.auction.id,
      // Always include the productId from the original auction
      productId: this.auction.productId,
      stockId: this.auction.stockId
    };
    
    const updatedData = this.editForm.getRawValue();
  
    // Only include fields that are actually enabled and have changed values
    editableFields.forEach(field => {
      const control = this.editForm.get(field);
      if (control && control.enabled && control.value !== undefined) {
        const originalValue = this.auction[field as keyof AuctionDetailsDto];
        let currentValue = control.value;
    
        // Check if field is a date field
        if (field.endsWith('Time')) {
          const isDateLike = (val: any): val is string | number | Date =>
            typeof val === 'string' || typeof val === 'number' || val instanceof Date;
    
          const transformedCurrent = isDateLike(currentValue)
            ? this.datePipe.transform(currentValue, 'yyyy-MM-ddTHH:mm:ss')
            : null;
    
          const transformedOriginal = isDateLike(originalValue)
            ? this.datePipe.transform(originalValue, 'yyyy-MM-ddTHH:mm:ss')
            : null;
    
          if (transformedCurrent !== transformedOriginal) {
            payload[field] = transformedCurrent;
          }
        } else {
          if (currentValue !== originalValue) {
            payload[field] = currentValue;
          }
        }
      }
    });
    console.log('Saving auction with payload:', payload);
    this.ref.close(payload);
  }    
  
  
  private getEditableFieldsByStatus(status: string): string[] {
    if (status === 'Upcoming') return ['name', 'description', 'startTime', 'endTime', 'startingPrice', 'quantity'];
    if (status === 'Active') return ['name', 'description', 'endTime'];
    return ['name', 'description'];
  }

  

  close() {
    this.ref.close();
  }
}
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StockService } from '../../../../core/services/stock.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { environment } from '../../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    TableModule,
    TagModule,
    ButtonModule,
    PopoverModule,
    ChipModule,
    TooltipModule,
    ToastModule,
    ConfirmDialogModule
  ]
})
export class ProductDetailsComponent implements OnInit {
  productId = 5; // For now, hardcoded. Replace with route param if needed.
  product: any = null;
  stocks: any[] = [];
  loading = false;

  constructor(
    private http: HttpClient,
    private stockService: StockService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.fetchProductDetails();
  }

  fetchProductDetails() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/api/Product/admin/product-with-stocks/${this.productId}`)
      .subscribe({
        next: (res) => {
          this.product = res.data;
          this.stocks = res.data.stocks || [];
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load product details' });
        }
      });
  }

  confirmDeleteStock(stockId: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this stock?',
      accept: () => this.deleteStock(stockId)
    });
  }

  deleteStock(stockId: number) {
    this.loading = true;
    this.stockService.deleteStock(stockId).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Stock deleted successfully' });
        this.stocks = this.stocks.filter(s => s.id !== stockId);
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete stock' });
        this.loading = false;
      }
    });
  }
}

import { Component } from '@angular/core';
import { StockModel } from '../../../../core/models/stock-models/stock';
import { StockService } from '../../../../core/services/stock.service';
import { GenericRequestModel } from '../../../../core/models/generic-request-Dto';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { IconField, IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog'; 
import { ToastModule } from 'primeng/toast'; 
import { PopoverModule } from 'primeng/popover'; 
import { ChipModule } from 'primeng/chip'; 
import { CommonModule, NgClass } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { ProductDetailsDto } from '../../../../core/models/product-models/ProductDetails';
import { ProductService } from '../../../../core/services/product.service';
import { AuctionCreateDialogComponent } from '../../Auctions/auction-create-dialog/auction-create-dialog.component';

@Component({
  selector: 'app-all-stocks',
  imports: [NgClass, ChipModule,ButtonModule,TableModule,IconFieldModule,InputIconModule,CardModule,DividerModule, ConfirmDialogModule, ToastModule, PopoverModule, DropdownModule, FormsModule, AuctionCreateDialogComponent, CommonModule],
  templateUrl: './all-stocks.component.html',
  styleUrl: './all-stocks.component.css',
  providers: [MessageService, ConfirmationService]
})
export class AllStocksComponent {
  stockList: StockModel[] = [];

  loading: boolean = true;
  searchValue: string | undefined;
  stockStatusFilter: string = '';

   // Auction dialog
   showAuctionDialog = false;
   selectedStock: StockModel | null = null;
   selectedProduct: ProductDetailsDto | null = null;


  constructor(private stockService: StockService, private router: Router, private messageService: MessageService, private confirmationService: ConfirmationService, private productService: ProductService) {
    this.router = router;
  }

  navigateToUpdateStock(id: string) {
    this.router.navigate(['/seller/stocks/update', id]);
  }

  // Delete Stock By Its ID
  deleteStock(id: number) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to delete this stock?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.stockService.deleteStock(id).subscribe({
          next: (response: GenericRequestModel<any>) => {
            if (response.status === 200) {
              this.stockList = this.stockList.filter((stock) => stock.id !== id);
              this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Stock deleted successfully' });
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message || 'Failed to delete stock' });
            }
          },
          error: (error) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete stock' });
          }
        });
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Rejected', detail: 'You have rejected' });
      }
    });
  }


  ngOnInit(): void {
    // Initial Load For All Stocks
    this.stockService.getAllStocks().subscribe((response: GenericRequestModel<any>) => {
      if (response.status === 200) {
        this.stockList = response.data;
        this.loading = false;
      }
    });
  }

  clear(table: Table) {
        table.clear();
        this.searchValue = ''
    }


    //reload after auction added 
    loadStocks(): void {
      this.stockService.getAllStocks().subscribe({
        next: (stocks) => {
          this.stockList = stocks.data;
          this.loading = false;
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load stocks'
          });
          this.loading = false;
        }
      });
    }

    showAddAuctionDialog(): void {
      this.selectedStock = null;
      this.selectedProduct = null;
      this.showAuctionDialog = true;
    }

    openAuctionDialog(stock: StockModel): void {
      this.selectedStock = stock;
      
      // Load product details
      this.productService.getProductsDetails(stock.productId).subscribe({
        next: (product) => {
          this.selectedProduct = product.data;
          this.showAuctionDialog = true;
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load product details'
          });
        }
      });
    }
  
    closeAuctionDialog(): void {
      this.showAuctionDialog = false;
      this.selectedStock = null;
      this.selectedProduct = null;
    }
  
    handleAuctionCreated(): void {
      this.closeAuctionDialog();
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Auction created successfully'
      });
      this.loadStocks();
    }
  

}

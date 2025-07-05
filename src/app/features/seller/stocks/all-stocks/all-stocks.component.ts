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
import { NgClass } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-all-stocks',
  imports: [NgClass, ChipModule,ButtonModule,TableModule,IconFieldModule,InputIconModule,CardModule,DividerModule, ConfirmDialogModule, ToastModule, PopoverModule, DropdownModule, FormsModule],
  templateUrl: './all-stocks.component.html',
  styleUrl: './all-stocks.component.css',
  providers: [MessageService, ConfirmationService]
})
export class AllStocksComponent {
  stockList: StockModel[] = [];

  loading: boolean = true;
  searchValue: string | undefined;
  stockStatusFilter: string = '';


  constructor(private stockService: StockService, private router: Router, private messageService: MessageService, private confirmationService: ConfirmationService) {
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

}

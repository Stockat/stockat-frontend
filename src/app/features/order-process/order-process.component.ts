import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { OrderRequest } from '../../core/models/order-request.model';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { OrderStateService } from '../../core/services/order-state.service';
import { ProductDetailsDto } from '../../core/models/product-models/ProductDetails';
import { StockModel } from '../../core/models/stock-models/stock';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-order-process',
  standalone: true,
  imports: [CardModule, BadgeModule, ButtonModule, ToastModule, DividerModule, CurrencyPipe, CommonModule],
  templateUrl: './order-process.component.html',
  styleUrl: './order-process.component.css',
  providers: [MessageService]
})
export class OrderProcessComponent implements OnInit {
  order: OrderRequest | null = null;
  product: ProductDetailsDto | null = null;
  stock: StockModel | null = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private messageService: MessageService,
    private orderStateService: OrderStateService
  ) {}

  ngOnInit(): void {
    this.order = this.orderStateService.getOrder();
    this.product = this.orderStateService.getProduct();
    this.stock = this.orderStateService.getStock();
    if (!this.order || !this.product || !this.stock) {
      this.router.navigate(['/']);
    }
  }

  placeOrder() {
    console.log('Placing order:Entered ');
    if (!this.order) return;
    this.loading = true;
    this.orderService.placeOrder(this.order).subscribe({
      next: (res) => {
        console.log('Order placed successfully:', res);
        this.messageService.add({ severity: 'success', summary: 'Order Placed', detail: 'Your order has been placed successfully.' });
        this.loading = false;
        window.location.href=res.redirectUrl
        //setTimeout(() => this.router.navigate(['/']), 2000);
      },
      error: (e) => {
        console.error('Error placing order:', e);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to place order.' });
        this.loading = false;
      }
    });
  }
}
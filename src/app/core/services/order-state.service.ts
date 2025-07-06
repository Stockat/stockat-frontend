import { Injectable } from '@angular/core';
import { OrderRequest } from '../models/order-request.model';
import { ProductDetailsDto } from '../models/product-models/ProductDetails';
import { StockModel } from '../models/stock-models/stock';

@Injectable({ providedIn: 'root' })
export class OrderStateService {
  private order: OrderRequest | null = null;
  private product: ProductDetailsDto | null = null;
  private stock: StockModel | null = null;

  setOrder(order: OrderRequest, product: ProductDetailsDto, stock: StockModel) {
    this.order = order;
    this.product = product;
    this.stock = stock;
  }

  getOrder(): OrderRequest | null {
    return this.order;
  }

  getProduct(): ProductDetailsDto | null {
    return this.product;
  }

  getStock(): StockModel | null {
    return this.stock;
  }

  clear() {
    this.order = null;
    this.product = null;
    this.stock = null;
  }
} 
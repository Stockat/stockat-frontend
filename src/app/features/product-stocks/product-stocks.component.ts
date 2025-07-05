import { Component } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { ProductDetailsDto } from '../../core/models/product-models/ProductDetails';
import { ActivatedRoute } from '@angular/router';
import { StockModel } from '../../core/models/stock-models/stock';
import { StockService } from '../../core/services/stock.service';
import { CardModule } from 'primeng/card';
import { GalleriaModule } from 'primeng/galleria';
import { DividerModule } from 'primeng/divider';
import { DataView, DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-product-stocks',
  imports: [CardModule, GalleriaModule, DividerModule, DataView, DataViewModule, ButtonModule],
  templateUrl: './product-stocks.component.html',
  styleUrl: './product-stocks.component.css'
})
export class ProductStocksComponent {

  images: string[] = [];
  product: ProductDetailsDto | null = null;
  selectedProductId: string | null = '';
  productStocks: StockModel[] = [];

  constructor(
    private productServ: ProductService,
    private stockService: StockService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.selectedProductId = params.get('id');
    });
    this.getProductDetails();
    this.getProductStocks();
  }

  getProductDetails() {
    let selectedId = +(this.selectedProductId || 0); // Convert to number, default to 0 if null
    this.productServ.getProductsDetails(selectedId).subscribe({
      next: (response) => {
        this.product = response.data; // Assuming 'data' contains the product details
        this.images = this.product!.imagesArr;
        console.log('Product details fetched successfully:', response);
      },
      error: (error) => {
        console.error('Error fetching product details:', error);
      },
    });
  }

  getProductStocks() {
    let selectedId = +(this.selectedProductId || 0); // Convert to number, default to 0 if null
    this.stockService.getProductStocks(selectedId).subscribe({
      next: (response) => {
        this.productStocks = response.data; // Assuming 'data' contains the product details
        console.log('Product details fetched successfully:', this.productStocks);
      },
      error: (error) => {
        console.error('Error fetching product details:', error);
      },
    });
  }

  onImageError(event: any) {
    // Set a default image when the original image fails to load
    event.target.src = '../../../../assets/1.jpg';
  }

  buyStock(stock: StockModel) {
    console.log('Buy stock clicked:', stock);
    // Here you would implement the actual buy functionality
    // For example, navigate to a checkout page or add to cart
    alert(`Added ${stock.productName} with selected features to cart!`);
  }

  //! End Of Component

}

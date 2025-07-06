import { Component } from '@angular/core';
import { GalleriaModule } from 'primeng/galleria';
import {
  ProductDto,
  ProductStatus,
} from '../../../../../src/app/core/models/product-models/productDto';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ProductService } from '../../../core/services/product.service';
import { ProductDetailsDto } from '../../../core/models/product-models/ProductDetails';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-product-details',
  imports: [GalleriaModule, CardModule, ButtonModule, FloatLabelModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent {
  images: string[] = [];
  product: ProductDetailsDto | null = null;
  selectedProductId: string | null = '';

  constructor(
    private productServ: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.selectedProductId = params.get('id');
    });
    this.getProductDetails();
    // Initialize images with an empty array if product is null
    // console.log(items)
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

  //! View Stocks
  viewStocks() {
    // Navigate to the product-stocks component with the product ID
    this.router.navigate(['/product-stocks', this.product?.id]);
  }

  onImageError(event: any) {
    // Set a default image when the original image fails to load
    event.target.src = '../../../../assets/1.jpg';
  }

  //! End Of Component
}

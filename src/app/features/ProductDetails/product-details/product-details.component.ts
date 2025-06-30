import { Component } from '@angular/core';
import { GalleriaModule } from 'primeng/galleria';
import { ProductDto,ProductStatus } from '../../../../../src/app/core/models/product-models/productDto';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ProductService } from '../../../core/services/product.service';
import { ProductDetailsDto } from '../../../core/models/product-models/ProductDetails';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-product-details',
  imports: [GalleriaModule,CardModule,ButtonModule,FloatLabelModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent {

  images: string[] = [];
  product: ProductDetailsDto | null = null;
  selectedProductId: string|null="";

  constructor(private productServ:ProductService,private route: ActivatedRoute) { }

  ngOnInit() {
    this.images = ["../../../../assets/1.png",
      "../../../../assets/2.png",
      "../../../../assets/3.png",
      "../../../../assets/4.png",
      "../../../../assets/5.png",
    ];
    this.route.paramMap.subscribe(params => {
      this.selectedProductId = params.get('id');
    });
    this.getProductDetails();

    // console.log(items)
  }

  getProductDetails(){
    let selectedId=+(this.selectedProductId || 0); // Convert to number, default to 0 if null
    this.productServ.getProductsDetails(selectedId).subscribe({
      next: (response) => {
        this.product = response.data; // Assuming 'data' contains the product details
        console.log('Product details fetched successfully:', response);
      },
      error: (error) => {
        console.error('Error fetching product details:', error);
      },
    })
  }

  //! End Of Component
}

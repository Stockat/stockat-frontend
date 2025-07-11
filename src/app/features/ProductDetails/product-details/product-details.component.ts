import { Component } from '@angular/core';
import { GalleriaModule } from 'primeng/galleria';
import {
  ProductDto,
  ProductStatus,
} from '../../../../../src/app/core/models/product-models/productDto';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ProductService } from '../../../core/services/product.service';
import { ProductDetailsDto } from '../../../core/models/product-models/ProductDetails';
import { ActivatedRoute, Router } from '@angular/router';
import { ReviewSectionComponent } from '../../shared/review-section/review-section.component';
import { OrderService } from '../../../core/services/order.service';
import { ReviewService } from '../../../core/services/review.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-details',
  imports: [GalleriaModule, CardModule, ButtonModule, FloatLabelModule, RouterModule, ReviewSectionComponent, FormsModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent {
  images: string[] = [];
  product: ProductDetailsDto | null = null;
  selectedProductId: string | null = '';
  isLoading: boolean = true;
  deliveredOrderId: number | undefined = undefined;
  deliveredOrderLoading: boolean = false;
  eligibleDeliveredOrders: any[] = [];
  selectedDeliveredOrderId: number | undefined = undefined;

  constructor(
    private productServ: ProductService,
    private orderService: OrderService,
    private reviewService: ReviewService,
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
    this.isLoading = true;
    let selectedId = +(this.selectedProductId || 0); // Convert to number, default to 0 if null
    this.productServ.getProductsDetails(selectedId).subscribe({
      next: (response) => {
        this.product = response.data; // Assuming 'data' contains the product details
        this.images = this.product!.imagesArr;
        this.isLoading = false;
        console.log('Product details fetched successfully:', response);
        this.findDeliveredOrderForReview();
      },
      error: (error) => {
        console.error('Error fetching product details:', error);
        this.isLoading = false;
      },
    });
  }

  findDeliveredOrderForReview() {
    if (!this.product) return;
    this.deliveredOrderLoading = true;

    Promise.all([
      this.orderService.getBuyerOrders().toPromise(),
      this.orderService.getBuyerRequestOrders().toPromise()
    ]).then((results: any[]) => {
      const ordersRes = results[0] || { data: [] };
      const requestOrdersRes = results[1] || { data: [] };
      const allOrders = [
        ...(ordersRes.data || []),
        ...(requestOrdersRes.data || [])
      ];
      const deliveredOrders = allOrders.filter(
        (order: any) => order.productId === this.product!.id && order.status === 'Delivered'
      );
      this.eligibleDeliveredOrders = [];
      if (deliveredOrders.length === 0) {
        this.deliveredOrderId = undefined;
        this.selectedDeliveredOrderId = undefined;
        this.deliveredOrderLoading = false;
        return;
      }
      const reviewChecks = deliveredOrders.map((order: any) =>
        this.reviewService.hasReviewedProduct(order.id).toPromise().then((res: any) => ({
          order,
          hasReviewed: res?.data === true
        }))
      );
      Promise.all(reviewChecks).then((results: any[]) => {
        this.eligibleDeliveredOrders = results.filter((r: any) => !r.hasReviewed).map((r: any) => r.order);
        this.selectedDeliveredOrderId = this.eligibleDeliveredOrders.length > 0 ? this.eligibleDeliveredOrders[0].id : undefined;
        this.deliveredOrderId = this.selectedDeliveredOrderId;
        this.deliveredOrderLoading = false;
      }).catch(() => {
        this.eligibleDeliveredOrders = [];
        this.selectedDeliveredOrderId = undefined;
        this.deliveredOrderId = undefined;
        this.deliveredOrderLoading = false;
      });
    }).catch(() => {
      this.eligibleDeliveredOrders = [];
      this.selectedDeliveredOrderId = undefined;
      this.deliveredOrderId = undefined;
      this.deliveredOrderLoading = false;
    });
  }

  onDeliveredOrderChange(orderId: number | undefined) {
    this.selectedDeliveredOrderId = orderId;
    this.deliveredOrderId = orderId;
  }

  //! View Stocks
  viewStocks() {
    // Navigate to the product-stocks component with the product ID
    this.router.navigate(['/product-stocks', this.product?.id]);
  }

  //! Routing To Home
  gotohome() {
    this.router.navigate(['/home']);
  }

  onImageError(event: any) {
    // Set a default image when the original image fails to load
    event.target.src = '../../../../assets/1.jpg';
  }

  makeRequest() {
    if (this.product) {
      this.router.navigate(['/request', this.product.id]);
    }
  }

  onReviewSubmitted() {
    // Optionally reload product details or reviews if needed
  }

  //! End Of Component
}

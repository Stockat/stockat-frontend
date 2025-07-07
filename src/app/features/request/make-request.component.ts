import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { ProductWithFeatures, FeatureValue } from '../../core/models/product-models/product-with-features';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { GalleriaModule } from 'primeng/galleria';
import { DividerModule } from 'primeng/divider';
import { Select, SelectItem } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { InputNumber } from 'primeng/inputnumber';
import { InputTextarea } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-make-request',
  standalone: true,
  imports: [CardModule, GalleriaModule, DividerModule, Select, FloatLabel, InputNumber, ButtonModule, FormsModule, ToastModule, ConfirmDialogModule, InputTextarea],
  templateUrl: './make-request.component.html',
  styleUrl: './make-request.component.css',
  providers: [MessageService, ConfirmationService]
})
export class MakeRequestComponent implements OnInit {
  product?: ProductWithFeatures;
  selectedFeatures: { [key: number]: FeatureValue } = {};
  quantity: number = 1;
  description: string = '';
  loading = false;
  images: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private orderService: OrderService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const productId = params['productId'];
      this.productService.getProductWithFeatures(productId).subscribe((res) => {
        this.product = res.data;
        this.updateGalleriaImages();
      });
    });
  }

  onFeatureChange(featureId: number, value: FeatureValue): void {
    this.selectedFeatures[featureId] = value;
  }

  updateGalleriaImages(): void {
    if (this.product && this.product.images && this.product.images.length > 0) {
      this.images = this.product.images.map(imageSrc => ({
        itemImageSrc: imageSrc,
        thumbnailImageSrc: imageSrc,
        alt: this.product?.name || 'Product Image',
        title: this.product?.name || 'Product Image'
      }));
    } else {
      this.images = [{
        itemImageSrc: 'https://tse3.mm.bing.net/th/id/OIP.jpLd-_FFm5nktmj6TtNtHAHaFj?rs=1&pid=ImgDetMain&o=7&rm=3',
        thumbnailImageSrc: 'https://tse3.mm.bing.net/th/id/OIP.jpLd-_FFm5nktmj6TtNtHAHaFj?rs=1&pid=ImgDetMain&o=7&rm=3',
        alt: 'Default Image',
        title: 'Default Image'
      }];
    }
  }

  areAllFeaturesSelected(): boolean {
    if (!this.product) return false;
    return this.product.features.every(feat => this.selectedFeatures[feat.id]);
  }

  get minQuantity(): number {
    return this.product?.minQuantity || 1;
  }

  submitRequest(): void {
    if (!this.product || !this.areAllFeaturesSelected() || !this.quantity || this.quantity < this.minQuantity) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Please fill all required fields. Quantity must be at least ${this.minQuantity}.` });
      return;
    }
    this.confirmationService.confirm({
      message: 'Are you sure you want to submit this request?',
      header: 'Confirm Request',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.doSubmitRequest()
    });
  }

  private doSubmitRequest() {
    if (!this.product || this.quantity < this.minQuantity) return;
    const buyerId = this.authService.getCurrentUserId();
    if (!buyerId) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'You must be logged in.' });
      return;
    }
    const stockDetails = Object.entries(this.selectedFeatures).map(([featureId, value]) => ({
      featureId: +featureId,
      featureValueId: value.id
    }));
    const requestBody = {
      quantity: this.quantity,
      price: this.product.price,
      orderType: 'Request',
      status: 'PendingSeller',
      productId: this.product.id,
      stockId: 0,
      sellerId: this.product.sellerId,
      buyerId: buyerId,
      paymentId: '',
      paymentStatus: '',
      description: this.description,
      stock: {
        productId: this.product.id,
        quantity: this.quantity,
        stockStatus: 'ForSale',
        stockDetails
      }
    };
    this.loading = true;
    this.orderService.placeRequestOrder(requestBody).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Request submitted successfully.' });
        this.loading = false;
        setTimeout(() => this.router.navigate(['/']), 2000);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to submit request.' });
        this.loading = false;
      }
    });
  }
} 
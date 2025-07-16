import { Component, SimpleChanges } from '@angular/core';
import { ProductService } from '../../../../core/services/product.service';
import { FeatureValue, ProductWithFeatures } from '../../../../core/models/product-models/product-with-features';
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { GalleriaModule } from 'primeng/galleria';
import { DividerModule } from 'primeng/divider';
import { Select, SelectItem } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { InputNumber } from 'primeng/inputnumber';
import { AddStock } from '../../../../core/models/stock-models/add-stock';
import { StockService } from '../../../../core/services/stock.service';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

interface GalleryImage {
  itemImageSrc: string;
  thumbnailImageSrc: string;
  alt: string;
  title: string;
}

@Component({
  selector: 'app-add-stock',
  imports: [CardModule, GalleriaModule, DividerModule, Select, FloatLabel, InputNumber,
    ButtonModule, FormsModule, ToastModule, RouterLink, RouterModule],
  templateUrl: './add-stock.component.html',
  styleUrl: './add-stock.component.css',
  providers: [MessageService]
})
export class AddStockComponent {

  product?: ProductWithFeatures;
  stockData: AddStock = {
    productId: 0,
    quantity: 1,
    stockDetails: []
  };
  selectedFeatures: {[key: number]: FeatureValue} = {};

  images: GalleryImage[] = [];

  loading = false;

  constructor(
    private productService: ProductService,
    private stockService: StockService,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const productId = params['id'];
      this.stockData.productId = productId;
      this.productService.getProductWithFeatures(productId).subscribe((res) => {
        this.product = res.data;
        this.updateGalleriaImages();
      });
    });
  }

  onFeatureChange(featureId: number, value: FeatureValue): void {
    this.selectedFeatures[featureId] = value;
    this.updateStockDetails();
  }

  onQuantityChange(quantity: number): void {
    this.stockData.quantity = quantity;
  }

  private updateStockDetails(): void {
    this.stockData.stockDetails = Object.entries(this.selectedFeatures)
      .map(([featureId, value]) => ({
        featureId: +featureId,
        featureValueId: value.id
      }));
  }

  submitStock(): void {
    if (!this.areAllFeaturesSelected()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please select all features before submitting'
      });
      return;
    }

    this.loading = true;
    this.stockService.addStock(this.stockData).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Stock added successfully'
        });
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to add stock'
        });
        this.loading = false;
      }
    });
  }

  private updateGalleriaImages(): void {
    if (this.product && this.product.images && this.product.images.length > 0) {
      this.images = this.product.images.map(imageSrc => ({
        itemImageSrc: imageSrc,
        thumbnailImageSrc: imageSrc,
        alt: this.product?.name || 'Product Image',
        title: this.product?.name || 'Product Image'
      }));
    } else {
      // Default image if no product images are available
      this.images = [{
        itemImageSrc: "https://tse3.mm.bing.net/th/id/OIP.jpLd-_FFm5nktmj6TtNtHAHaFj?rs=1&pid=ImgDetMain&o=7&rm=3",
        thumbnailImageSrc: "https://tse3.mm.bing.net/th/id/OIP.jpLd-_FFm5nktmj6TtNtHAHaFj?rs=1&pid=ImgDetMain&o=7&rm=3",
        alt: 'Default Image',
        title: 'Default Image'
      }];
    }
  }

  private areAllFeaturesSelected(): boolean {
    if (!this.product) return false;
    return this.product.features.every(feat => this.selectedFeatures[feat.id]);
  }

  // Returns the IDs of selected features as numbers
  get selectedFeatureIds(): number[] {
    return Object.keys(this.selectedFeatures).map(id => +id);
  }


}

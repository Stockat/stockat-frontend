import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { GalleriaModule } from 'primeng/galleria';
import { DividerModule } from 'primeng/divider';
import { Select } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { InputNumber } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProductService } from '../../../../core/services/product.service';
import { StockService } from '../../../../core/services/stock.service';
import { ProductWithFeatures, FeatureValue } from '../../../../core/models/product-models/product-with-features';
import { AddStock } from '../../../../core/models/stock-models/add-stock';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-update-stock',
  imports: [CardModule, GalleriaModule, DividerModule, Select, FloatLabel, InputNumber, ButtonModule, FormsModule, ToastModule, SkeletonModule],
  templateUrl: './update-stock.component.html',
  styleUrl: './update-stock.component.css',
  providers: [MessageService]
})
export class UpdateStockComponent implements OnInit {
  product?: ProductWithFeatures;
  stockData: AddStock = {
    productId: 0,
    quantity: 1,
    stockDetails: []
  };
  selectedFeatures: {[key: number]: FeatureValue} = {};
  images: any[] = [];
  loading: boolean = false;
  dataLoaded: boolean = false; // Add this property

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private stockService: StockService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const stockId = params['id'];
      this.stockService.getStockById(stockId).subscribe((stockResponse) => {
        if (stockResponse.status === 200) {
          const stockData = stockResponse.data;
          this.stockData.quantity = stockData.quantity;
          this.stockData.productId = stockData.productId;

          console.log(this.stockData.productId)
          console.log(stockData.productId)

          // Load product details and features
          this.productService.getProductWithFeatures(stockData.productId).subscribe((productResponse) => {
            this.product = productResponse.data;
            this.updateGalleriaImages();

            // Pre-select features based on existing stock data
            stockData.stockFeatures.forEach(feature => {
              const productFeature = this.product?.features.find(f => f.name === feature.name);
              if (productFeature) {
                const featureValue = productFeature.values.find(v => v.value.toLowerCase() === feature.value.toLowerCase());
                if (featureValue) {
                  this.selectedFeatures[productFeature.id] = featureValue;
                }
              }
            });
            this.updateStockDetails();
            this.dataLoaded = true; // Set to true after all data is loaded
          });
        }
      });
    });
  }

  updateGalleriaImages(): void {
    if (this.product) {
      this.images = this.product.images.map(image => ({
        itemImageSrc: image,
        alt: this.product?.name,
        title: this.product?.name
      }));
    }
  }

  onFeatureChange(featureId: number, value: FeatureValue): void {
    this.selectedFeatures[featureId] = value;
    this.updateStockDetails();
  }

  private updateStockDetails(): void {
    this.stockData.stockDetails = Object.entries(this.selectedFeatures)
      .map(([featureId, value]) => ({
        featureId: +featureId,
        featureValueId: value.id
      }));
  }

  areAllFeaturesSelected(): boolean {
    if (!this.product) return false;
    return this.product.features.every(feature => this.selectedFeatures[feature.id]);
  }

  updateStock(): void {
    if (!this.areAllFeaturesSelected()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please select all features before updating stock'
      });
      return;
    }

    this.loading = true;
    this.route.params.subscribe((params) => {
      const stockId = params['id'];
      this.stockService.updateStock(stockId, this.stockData).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Stock updated successfully'
          });
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update stock'
          });
          this.loading = false;
        }
      });
    });
  }
}

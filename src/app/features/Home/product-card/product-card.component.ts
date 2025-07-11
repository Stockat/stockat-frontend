//* PrimeNg Imports
import { Component, Input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
//* Angular Imports
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

//* Services & DTOs
import { ProductService } from '../../../core/services/product.service';
import { ProductFilters } from '../../../core/models/product-models/product-filters';
import { ProductDto } from '../../../core/models/product-models/productDto';
import { RouterOutlet } from '@angular/router';
import { SharedService } from '../../../shared/utils/shared.service';
import { CategoryService } from '../../../core/services/category.service';
import { TagService } from '../../../core/services/tag.service';

interface City {
  name: string;
  code: string;
}

// Extended ProductDto with image loading states
interface ProductWithImageState extends ProductDto {
  imageError?: boolean;
}

@Component({
  selector: 'app-product-card',
  imports: [
    CardModule,
    ButtonModule,
    SelectModule,
    FormsModule,
    MultiSelectModule,
    InputNumberModule,
    PaginatorModule,
    CurrencyPipe,
    RouterModule,
  ],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  products: ProductWithImageState[] | undefined;
  isLoading: boolean = false;

  //* Filters Holders
  categories: any = [];
  tags: any = [];
  cities: any = [];

  first: number = 0;
  totalRecords: number = 0;

  SelectedPrice: number = 1;
  SelectedMinQty: number = 1;
  selectedCity: string = '';
  selectedCategory: string = '';
  selectedTags: string[] = [];

  filters: ProductFilters = {
    location: '',
    category: '',
    tags: [],
    minQuantity: 1,
    minPrice: 1,
    page: 0,
    size: 8,
    sortBy: null,
    filterDirection: 'asc', // Default sorting direction
  };

  constructor(
    private productService: ProductService,
    private sharedServ: SharedService,
    private categoryServ: CategoryService,
    private tagServ: TagService
  ) {}

  ngOnInit() {
    this.cities = this.sharedServ.governorates;
    this.getProducts();

    this.categoryServ.getAllCategories().subscribe({
      next: (response) => {
        console.log('Categories fetched successfully:', response.data);
        this.categories = response.data;
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
      },
    });

    this.tagServ.getAllTags().subscribe({
      next: (response) => {
        console.log('Tags fetched successfully:', response.data);
        this.tags = response.data;
      },
      error: (error) => {
        console.error('Error fetching tags:', error);
      },
    });
  }

  onPageChange(event: PaginatorState) {
    console.log('Paginator Event:', event);
    this.first = event.first ?? 0; // event.first is the index of the first record
    this.filters.page = event.page ?? 0; // event.page is the page number (zero-based)
    this.setFilters(false); // pass false to avoid incrementing page again
  }

  getProducts() {
    this.isLoading = true;
    console.log('Filters before setting:', this.filters);
    this.productService.getAllProductsPaginated(this.filters).subscribe({
      next: (res) => {
        console.log(res);
        this.products = res.data.paginatedData;

        // Initialize image loading states for each product
        if (this.products) {
          this.products.forEach((product) => {
            product.imageError = false;
          });
        }

        this.first = res.data.page * this.filters.size; // set to record index
        this.totalRecords = res.data.count;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching products:', err);
        this.isLoading = false;
      },
    });
  }

  setFilters(updatePage: boolean = true) {
    console.log('Location', this.selectedCity);
    console.log('category', this.selectedCategory);
    console.log('Tags', this.selectedTags);
    console.log('page', this.filters.page);
    console.log('first', this.first);

    this.filters.location = this.selectedCity;
    this.filters.category = this.selectedCategory;
    this.filters.tags = this.selectedTags;
    this.filters.minQuantity = this.SelectedMinQty;
    this.filters.minPrice = this.SelectedPrice;
    if (updatePage) {
      this.filters.page = Math.floor(this.first / this.filters.size); // calculate page from first
    }
    this.filters.size = 8;

    console.log('-*****-', this.filters);

    this.getProducts();

    console.log(this.filters);
  }

  resetFilters() {
    this.selectedCity = '';
    this.selectedCategory = '';
    this.selectedTags = [];
    this.SelectedMinQty = 1;
    this.SelectedPrice = 1;

    this.filters.location = '';
    this.filters.category = '';
    this.filters.tags = [];
    this.filters.minQuantity = 1;
    this.filters.minPrice = 1;

    this.getProducts();
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.selectedCity) count++;
    if (this.selectedCategory) count++;
    if (this.selectedTags && this.selectedTags.length > 0) count++;
    if (this.SelectedPrice > 1) count++;
    if (this.SelectedMinQty > 1) count++;
    return count;
  }

  onImageError(product: ProductWithImageState) {
    // Mark the product as having an image error
    product.imageError = true;
  }

  onImageLoad(product: ProductWithImageState) {
    // Mark the product as having loaded the image successfully
    product.imageError = false;
  }

  //! End Product Card Component
}

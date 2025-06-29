//* PrimeNg Imports
import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

//* Angular Imports
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';

//* Services & DTOs
import { ProductService } from '../../../core/services/product.service';
import { ProductFilters } from '../../../core/models/product-models/product-filters';
import { ProductDto } from '../../../core/models/product-models/productDto';

interface City {
  name: string;
  code: string;
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
  ],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {

  products:[ProductDto] | undefined ;

  first: number = 0;
  rows: number = 4;
  totalRecords: number = 0;
  cities: City[] | undefined;

  SelectedPrice: number = 1;
  SelectedMinQty: number = 1;
  selectedCity: string ="";
  selectedCategory: string = "";
  selectedTags: string[] = [];

  filters:ProductFilters = {
    location: '',
    category: '',
    tags: [],
    minQuantity: 1,
    minPrice: 1,
  }


  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.cities = [
      { name: 'New York', code: 'NY' },
      { name: 'Rome', code: 'RM' },
      { name: 'London', code: 'LDN' },
      { name: 'Istanbul', code: 'IST' },
      { name: 'Paris', code: 'PRS' },
    ];
    this.getProducts();
  }



  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
  }

  getProducts(){
    this.productService.getAllProductsPaginated(this.filters).subscribe({
      next: (res) => {
        console.log(res);
        this.products = res.data.paginatedData;
        this.first=res.data.page;
        this.totalRecords=res.data.count;
      },
      error: (err) => {
        console.error('Error fetching products:', err);
      }
    });
  }

  setFilters(){
    this.filters.location = this.selectedCity ;
    this.filters.category = this.selectedCategory;
    this.filters.tags = this.selectedTags;
    this.filters.minQuantity = this.SelectedMinQty;
    this.filters.minPrice = this.SelectedPrice;

    this.getProducts();

console.log(this.filters);
  }

  resetFilters(){
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


  //! End Product Card Component
}

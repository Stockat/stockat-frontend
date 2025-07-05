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
    RouterModule
  ],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {

  products:[ProductDto] | undefined ;

  //* Filters Holders
  categories:any = [];
  tags:any = [];
  cities:any = [];


  first: number = 0;
  totalRecords: number = 0;

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
    page: 0,
    size: 8,
    sortBy:null,
    filterDirection: 'asc' // Default sorting direction
  }


  constructor(private productService: ProductService,private sharedServ:SharedService,
    private categoryServ:CategoryService,private tagServ:TagService) {

    }

  ngOnInit() {
    this.cities = this.sharedServ.governorates;
    this.getProducts();

    this.categoryServ.getAllCategories().subscribe({
      next: (response) => {
        console.log("Categories fetched successfully:", response.data);
        this.categories = response.data;
      },
      error: (error) => {
        console.error("Error fetching categories:", error);
      }
    })

    this.tagServ.getAllTags().subscribe({
      next: (response) => {
        console.log("Tags fetched successfully:", response.data);
        this.tags = response.data;
      },
      error: (error) => {
        console.error("Error fetching tags:", error);
      }
    })

  }

  onPageChange(event: PaginatorState) {
    console.log("Paginator Event:", event);
    this.first = event.page ?? 0;
    console.log("PageNum", this.first);
    this.setFilters()
  }

  getProducts(){

    console.log("Filters before setting:", this.filters);
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

    console.log("Location", this.selectedCity);
    console.log("category", this.selectedCategory);
    console.log("Tags", this.selectedTags);
    console.log("page", this.filters.page);
    console.log("first", this.first);

    this.filters.location = this.selectedCity ;
    this.filters.category = this.selectedCategory;
    this.filters.tags = this.selectedTags;
    this.filters.minQuantity = this.SelectedMinQty;
    this.filters.minPrice = this.SelectedPrice;
    this.filters.page = this.first;
    this.filters.size = 8;

    console.log("-*****-",this.filters);

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

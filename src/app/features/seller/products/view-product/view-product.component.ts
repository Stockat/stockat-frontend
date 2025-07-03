import { Component, OnInit } from '@angular/core';
//* PrimeNg Modules
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ToggleSwitch } from 'primeng/toggleswitch';
//* Services
import { CategoryService } from '../../../../core/services/category.service';
import { TagService } from '../../../../core/services/tag.service';
import { SharedService } from '../../../../shared/utils/shared.service';
import { viewSellerProductDto } from '../../../../core/models/product-models/viewSellerProductDto';
import { ProductService } from '../../../../core/services/product.service';

//* DTOs
import { ProductFilters } from '../../../../core/models/product-models/product-filters';

@Component({
  selector: 'app-view-product',
  imports: [TableModule, TagModule, CommonModule, ButtonModule, CardModule, SelectModule,
    FormsModule, MultiSelectModule, InputNumberModule, PaginatorModule, RatingModule,ToggleSwitch
  ],
  templateUrl: './view-product.component.html',
  styleUrl: './view-product.component.css'
})
export class ViewProductComponent {

  //! Testing
  checked: boolean = false;
  //! end testing
  //* Filters Holders
  categories: any = [];
  tags: any = [];
  cities: any = [];
  //* Parameters
  products!: viewSellerProductDto[];
  filters: ProductFilters = {
    location: '',
    category: '',
    tags: [],
    minQuantity: 1,
    minPrice: 1,
  }

  //* Pagination Params
  first: number = 0;
  rows: number = 5;
  totalRecords: number = 0;

  //* Filters Params
  SelectedPrice: number = 1;
  SelectedMinQty: number = 1;
  selectedCity: string = "";
  selectedCategory: string = "";
  selectedTags: string[] = [];



  constructor(private productServ: ProductService, private categoryServ: CategoryService,
    private tagServ: TagService, private sharedServ: SharedService) {
  }

  ngOnInit(): void {
    this.cities = this.sharedServ.governorates;
    this.getCategories()
    this.getTags()
    this.getProducts()


  }

  //* Status Style
  getSeverity(status: string) {
    switch (status) {
      case 'Activated':
        return 'success'; // Green for Activated
      case 'Deactivated':
        return 'danger'; // Red for Deactivated
      case 'Approved':
        return 'success'; // Green for Approved
      case 'Rejected':
        return 'danger'; // Red for Rejected
      case 'Pending':
        return 'warn'; // Red for Rejected
      default:
        return 'danger'; // Fallback
    }
  }


//* Data For Filter Bar
getCategories(){
  this.categoryServ.getAllCategories().subscribe({
    next: (response) => {
      console.log("Categories fetched successfully:", response.data);
      this.categories = response.data;
    },
    error: (error) => {
      console.error("Error fetching categories:", error);
    }
  })

}
getTags(){
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

//* Getting Products
getProducts(){
  this.productServ.getAllSellerProducts(this.filters).subscribe({
    next: (res) => {
      this.products = res.data.paginatedData;
      this.first = res.data.page;
      this.totalRecords = res.data.count;
      console.log('Products fetched successfully:', res.data);
    },
    error: (error) => {
      console.error('Error fetching products:', error);
    }
  });
}

//* Filters Action
setFilters(){

  console.log("Location", this.selectedCity);
  console.log("category", this.selectedCategory);
  console.log("Tags", this.selectedTags);

  this.filters.location = this.selectedCity;
  this.filters.category = this.selectedCategory;
  this.filters.tags = this.selectedTags;
  this.filters.minQuantity = this.SelectedMinQty;
  this.filters.minPrice = this.SelectedPrice;

  console.log("-*****-", this.filters);

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

//* Pagination Method
onPageChange(event: PaginatorState) {
  this.first = event.first ?? 0;
  this.rows = event.rows ?? 10;
}

}

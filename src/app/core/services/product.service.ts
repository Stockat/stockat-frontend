import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductFilters } from '../models/product-models/product-filters';
import { ProductDto } from '../models/product-models/productDto';
import { Router } from '@angular/router';
import { PaginationDto } from '../models/pagination-Dto';
import { GenericRequestModel } from '../models/generic-request-Dto';
@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:5250/api/Product';
  constructor(private http: HttpClient, private router: Router) {}

  // getAllProductsPAginated(filters: ProductFilters): Observable<ProductDto> {

  //     this.http.get<GenericRequestModel<ProductDto>>(`${this.apiUrl}?${filters}`).subscribe({
  //       next: (res) => {
  //         console.log(res);
  //       },
  //       error: (err) => observer.error(err),
  //     });
  //   };
  // }

  getAllProductsPaginated(filters: ProductFilters): Observable<GenericRequestModel<PaginationDto<ProductDto>>> {
    // Example of setting up filters
    filters.location = '';
    filters.category = '';
    filters.minQuantity = 1;
    filters.minPrice = 1;
    // filters.tags=['one','two','three'];
    const params = new HttpParams({ fromObject: filters as any });

    return this.http.get<GenericRequestModel<PaginationDto<ProductDto>>>(this.apiUrl, { params });
  }


//! End Of Service
}
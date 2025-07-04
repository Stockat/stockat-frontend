import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ProductFilters } from '../models/product-models/product-filters';
import { ProductDto } from '../models/product-models/productDto';
import { Router } from '@angular/router';
import { PaginationDto } from '../models/pagination-Dto';
import { GenericRequestModel } from '../models/generic-request-Dto';
import { ProductDetailsDto } from '../models/product-models/ProductDetails';
import { ProductWithFeatures } from '../models/product-models/product-with-features';



@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:5250/api/Product';
  constructor(private http: HttpClient, private router: Router) {}

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

  getProductsDetails(productId: number): Observable<GenericRequestModel<ProductDetailsDto>> {

    // const params = new HttpParams({ fromObject: productId as any });

    return this.http.get<GenericRequestModel<ProductDetailsDto>>(`${this.apiUrl}/${productId}`);
  }

  getProductWithFeatures(id: number): Observable<GenericRequestModel<ProductWithFeatures>> {
    return this.http.get<GenericRequestModel<ProductWithFeatures>>(`${this.apiUrl}/with-features/${id}`);
  }



//! End Of Service
}
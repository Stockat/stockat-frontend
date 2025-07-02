import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ProductFilters } from '../models/product-models/product-filters';
import { ProductDto } from '../models/product-models/productDto';
import { Router } from '@angular/router';
import { PaginationDto } from '../models/pagination-Dto';
import { GenericRequestModel } from '../models/generic-request-Dto';
import { ProductDetailsDto } from '../models/product-models/ProductDetails';
import { imageUploadDto } from '../models/product-models/ImageUploadDto';
import { AddProductDto } from '../models/product-models/addProductDto';
@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:5250/api/Product';
  constructor(private http: HttpClient, private router: Router) {}

  getAllProductsPaginated(filters: ProductFilters): Observable<GenericRequestModel<PaginationDto<ProductDto>>> {

    const params = new HttpParams({ fromObject: filters as any });

    return this.http.get<GenericRequestModel<PaginationDto<ProductDto>>>(this.apiUrl, { params });
  }

  getProductsDetails(productId: number): Observable<GenericRequestModel<ProductDetailsDto>> {

    // const params = new HttpParams({ fromObject: productId as any });
    return this.http.get<GenericRequestModel<ProductDetailsDto>>(`${this.apiUrl}/${productId}`);
  }

  uploadImgages(Images: File[]): Observable<GenericRequestModel<imageUploadDto[]>> {
    const formData = new FormData();
    Images.forEach((image) => {
      formData.append('files', image, image.name);
        });
    return this.http.post<GenericRequestModel<imageUploadDto[]>>(`${this.apiUrl}/upload`, formData);
  }

  addProduct(data: FormData): Observable<GenericRequestModel<AddProductDto>> {

    return this.http.post<GenericRequestModel<AddProductDto>>(`${this.apiUrl}`,data);
  }


//! End Of Service
}
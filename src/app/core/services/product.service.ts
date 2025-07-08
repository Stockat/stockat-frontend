import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ProductFilters } from '../models/product-models/product-filters';
import { ProductDto, ProductStatus } from '../models/product-models/productDto';
import { Router } from '@angular/router';
import { PaginationDto } from '../models/pagination-Dto';
import { GenericRequestModel } from '../models/generic-request-Dto';
import { ProductDetailsDto } from '../models/product-models/ProductDetails';
import { imageUploadDto } from '../models/product-models/ImageUploadDto';
import { AddProductDto } from '../models/product-models/addProductDto';
import { UpdateProductDto } from '../models/product-models/updateProductDto';
import { viewSellerProductDto } from '../models/product-models/viewSellerProductDto';
import { ProductWithFeatures } from '../models/product-models/product-with-features';



@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:5250/api/Product';
  constructor(private http: HttpClient, private router: Router) {}


  //* Home Page (Anonymous User) Services
  getAllProductsPaginated(filters: ProductFilters): Observable<GenericRequestModel<PaginationDto<ProductDto>>> {

    const params = new HttpParams({ fromObject: filters as any });
    console.log("params",params.toString());

    return this.http.get<GenericRequestModel<PaginationDto<ProductDto>>>(this.apiUrl, { params });
  }

  //* Peoduct Details  Page (Anonymous User) Services
  getProductsDetails(productId: number): Observable<GenericRequestModel<ProductDetailsDto>> {

    // const params = new HttpParams({ fromObject: productId as any });
    return this.http.get<GenericRequestModel<ProductDetailsDto>>(`${this.apiUrl}/${productId}`);
  }

  // uploadImgages(Images: File[]): Observable<GenericRequestModel<imageUploadDto[]>> {
  //   const formData = new FormData();
  //   Images.forEach((image) => {
  //     formData.append('files', image, image.name);
  //       });
  //   return this.http.post<GenericRequestModel<imageUploadDto[]>>(`${this.apiUrl}/upload`, formData);
  // }


  //* Seller Services

  //* Adding New Product
  addProduct(data: FormData): Observable<GenericRequestModel<AddProductDto>> {

    return this.http.post<GenericRequestModel<AddProductDto>>(`${this.apiUrl}`,data);
  }

  //* Get Selected Product For Update
  getProductForUpdate(productId: number): Observable<GenericRequestModel<UpdateProductDto>> {
    return this.http.get<GenericRequestModel<UpdateProductDto>>(`${this.apiUrl}/seller/${productId}`);
  }

  //* Update Product
  updateProduct(id: number, data: FormData): Observable<GenericRequestModel<UpdateProductDto>> {
    return this.http.put<GenericRequestModel<UpdateProductDto>>(`${this.apiUrl}/${id}`, data);
  }

  //* View Seller Products
  getAllSellerProducts(filters: ProductFilters): Observable<GenericRequestModel<PaginationDto<viewSellerProductDto>>> {

    const params = new HttpParams({ fromObject: filters as any });
    return this.http.get<GenericRequestModel<PaginationDto<viewSellerProductDto>>>(this.apiUrl+"/seller", { params });
  }

  //* Change product Status
  changeProductStatus(id: number, chosenStatus: ProductStatus): Observable<GenericRequestModel<string>> {

    const body = { id, chosenStatus };
    return this.http.post<GenericRequestModel<string>>(`${this.apiUrl}/${id}`, body);
  }

  //* Delete Product
  removeProduct(id: number): Observable<GenericRequestModel<string>> {

    return this.http.post<GenericRequestModel<string>>(`${this.apiUrl}/seller/delete`,id);
  }
  //* Change can be requsted Column
  changeProductCanBeRequsted(id: number): Observable<GenericRequestModel<string>> {

    return this.http.post<GenericRequestModel<string>>(`${this.apiUrl}/seller/edit-canBeRequested`,id);
  }  getProductWithFeatures(id: number): Observable<GenericRequestModel<ProductWithFeatures>> {
    return this.http.get<GenericRequestModel<ProductWithFeatures>>(`${this.apiUrl}/with-features/${id}`);
  }

  //* Admin Services
  getAllProductsPaginatedForAdmin(filters: ProductFilters): Observable<GenericRequestModel<PaginationDto<ProductDto>>> {

    const params = new HttpParams({ fromObject: filters as any });
    console.log("params",params.toString());

    return this.http.get<GenericRequestModel<PaginationDto<ProductDto>>>(this.apiUrl+'/admin', { params });
  }


//! End Of Service
}

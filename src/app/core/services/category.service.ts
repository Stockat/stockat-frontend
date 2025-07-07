import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CategoryDto } from '../models/category-models/categoryDto';
import { GenericRequestModel } from '../models/generic-request-Dto';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private apiUrl = 'http://localhost:5250/api/Category';
  constructor(private http: HttpClient) {}


  getAllCategories() {
    return this.http.get<GenericRequestModel<CategoryDto[]>>(`${this.apiUrl}`);
  }

}

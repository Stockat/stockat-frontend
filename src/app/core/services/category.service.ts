import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CategoryDto } from '../models/category-models/categoryDto';
import { GenericRequestModel } from '../models/generic-request-Dto';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/api/Category`;
  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<GenericRequestModel<CategoryDto[]>> {
    return this.http.get<GenericRequestModel<CategoryDto[]>>(`${this.apiUrl}`);
  }
  getAllCategoriesforAdmin(): Observable<GenericRequestModel<CategoryDto[]>> {
    return this.http.get<GenericRequestModel<CategoryDto[]>>(`${this.apiUrl}/admin`);
  }

  addCategory(
    categoryName: string
  ): Observable<GenericRequestModel<CategoryDto>> {
    return this.http.post<GenericRequestModel<CategoryDto>>(
      `${this.apiUrl}/add`,
      JSON.stringify(categoryName),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  editCategory(
    id: number,
    categoryDto: CategoryDto
  ): Observable<GenericRequestModel<CategoryDto>> {
    return this.http.post<GenericRequestModel<CategoryDto>>(
      `${this.apiUrl}/edit/${id}`,
      categoryDto
    );
  }

  deleteCategory(id: number): Observable<GenericRequestModel<boolean>> {
    return this.http.post<GenericRequestModel<boolean>>(
      `${this.apiUrl}/delete/${id}`,
      {}
    );
  }
}

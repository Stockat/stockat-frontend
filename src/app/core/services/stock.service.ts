import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AddStock } from '../models/stock-models/add-stock';
import { Observable } from 'rxjs';
import { GenericRequestModel } from '../models/generic-request-Dto';
import { StockModel } from '../models/stock-models/stock';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private apiUrl = 'http://localhost:5250/api/Stock';
  
  constructor(private http: HttpClient) { }

  // Add New Stock To Product
  addStock(stockData: AddStock): Observable<GenericRequestModel<any>> {
    return this.http.post<GenericRequestModel<any>>(this.apiUrl, stockData);
  }

  // Get Stock By Its ID
  getStockById(id: number): Observable<GenericRequestModel<StockModel>> {
    return this.http.get<GenericRequestModel<StockModel>>(this.apiUrl+'/'+id);
  }

  // Get All Stocks
  getAllStocks(): Observable<GenericRequestModel<any>> {
    return this.http.get<GenericRequestModel<any>>(this.apiUrl+'/all');
  }

  // Update Stock By Its ID
  updateStock(id: number, stockData: AddStock): Observable<GenericRequestModel<any>> {
    return this.http.put<GenericRequestModel<any>>(`${this.apiUrl}/${id}`, stockData);
  }

  // Delete Stock By Its ID
  deleteStock(id: number): Observable<GenericRequestModel<any>> {
    return this.http.delete<GenericRequestModel<any>>(`${this.apiUrl}/${id}`);
  }
}

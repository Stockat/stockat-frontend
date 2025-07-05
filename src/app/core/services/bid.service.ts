import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuctionBidRequestCreateDto } from '../models/auction-models/bid-request-auction-dto';

@Injectable({
  providedIn: 'root'
})
export class BidService {
  private baseUrl = 'http://localhost:5250/api/AuctionBidRequest'; // replace with actual API base

  constructor(private http: HttpClient) {}

  submitBid(bid: AuctionBidRequestCreateDto): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}`, bid);
  }

  
}

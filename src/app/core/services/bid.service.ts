import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuctionBidRequestCreateDto } from '../models/auction-models/bid-request-auction-dto';

@Injectable({
  providedIn: 'root'
})
export class BidService {
  private baseUrl = 'http://localhost:5250/api/AuctionBidRequest'; 

  constructor(private http: HttpClient) {}

  submitBid(bid: AuctionBidRequestCreateDto): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}`, bid);
  }

  GetBidsForAuction(auctionID: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/auction/${auctionID}`);
  }
  
  GetBidsForUser(userID: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/user/${userID}`);
  }
  
}

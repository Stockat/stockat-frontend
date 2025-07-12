import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuctionBidRequestCreateDto } from '../models/auction-models/bid-request-auction-dto';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BidService {
  private baseUrl = `${environment.apiUrl}/api/AuctionBidRequest`;

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

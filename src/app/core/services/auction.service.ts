import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuctionDetailsDto } from '../models/auction-models/auction-details-dto';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuctionService {

  constructor(private http: HttpClient) { }

  private baseUrl = 'http://localhost:5250/api/auctions'; 

  getAllAuctions(): Observable<AuctionDetailsDto[]> {
    return this.http.get<AuctionDetailsDto[]>(this.baseUrl+'/GetAllAuctionsBasic');
  }

  getAuctionById(id:number): Observable<AuctionDetailsDto> {
    return this.http.get<AuctionDetailsDto>(this.baseUrl+`/${id}`);
  }

}

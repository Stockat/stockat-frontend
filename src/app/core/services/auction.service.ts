import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuctionDetailsDto } from '../models/auction-models/auction-details-dto';
import { PagedResponse } from '../models/auction-models/paged-response';
import { Observable, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { AuctionUpdateDto } from '../models/auction-models/auction-update-dto';
import { UserService } from './user.service';
import { AuctionCreateDto } from '../models/auction-models/auction-create-dto';


@Injectable({
  providedIn: 'root'
})
export class AuctionService {

  constructor(private http: HttpClient, private authService: AuthService,
    private userService: UserService
  ) { }

  private baseUrl = 'http://localhost:5250/api/auctions'; 

  getAllAuctions(): Observable<AuctionDetailsDto[]> {
    return this.http.get<AuctionDetailsDto[]>(this.baseUrl+'/GetAllAuctionsBasic');
  }

  getAuctionById(id:number): Observable<AuctionDetailsDto> {
    return this.http.get<AuctionDetailsDto>(this.baseUrl+`/${id}`);
  }

  getSellerAuctions(page: number, pageSize: number, status: string, search: string): Observable<PagedResponse<AuctionDetailsDto>> {
    return this.userService.getCurrentUser().pipe(
      switchMap(user => {
        const params = {
          pageNumber: page.toString(),
          pageSize: pageSize.toString(),
          status: status || '',
          sellerId: user.data.id, //
          search: search || ''
        };
  
        return this.http.get<PagedResponse<AuctionDetailsDto>>(this.baseUrl + '/GetAllAuctions', { params });
      })
    );
  }
    

 // auction.service.ts
updateAuction(auctionId: number, updateData: AuctionUpdateDto): Observable<any> {
  return this.http.put(`${this.baseUrl}/${auctionId}`, updateData);
}

deleteAuction(auctionId: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/${auctionId}`);
}

createAuction(auctionData: AuctionCreateDto): Observable<any> {
  return this.http.post(`${this.baseUrl}`, auctionData);
}

  // auction.service.ts
// updateAuction(auctionId: number, updateData: any): Observable<any> {
//   // Filter out non-editable fields based on auction status
//   const editableFields = this.getEditableFields(updateData);
//   const filteredData: any = {};
  
//   editableFields.forEach(field => {
//     if (updateData[field] !== undefined) {
//       filteredData[field] = updateData[field];
//     }
//   });
  
//   return this.http.put(`${this.baseUrl}/${auctionId}`, filteredData);
// }

// private getEditableFields(auction: any): string[] {
//   const now = new Date();
//   const start = new Date(auction.startTime);
//   const end = new Date(auction.endTime);
  
//   if (now < start) {
//     return ['name', 'description', 'startTime', 'endTime', 'startingPrice', 'quantity'];
//   } else if (now >= start && now <= end) {
//     return ['name', 'description', 'endTime'];
//   }
//   return ['name', 'description'];
// } 

}

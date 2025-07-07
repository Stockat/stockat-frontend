import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GenericRequestModel } from '../models/generic-request-Dto';
import { tagdto } from '../models/tag-models/tagDto';

@Injectable({
  providedIn: 'root'
})
export class TagService {


  private apiUrl = 'http://localhost:5250/api/Tag';
  constructor(private http: HttpClient) {}


  getAllTags() {
    return this.http.get<GenericRequestModel<tagdto[]>>(`${this.apiUrl}`);
  }
}

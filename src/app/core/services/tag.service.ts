import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { GenericRequestModel } from '../models/generic-request-Dto';
import { tagdto } from '../models/tag-models/tagDto';
import { TagStatus } from '../models/tag-models/tag-status.enum';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private apiUrl = `${environment.apiUrl}/api/Tag`;

  constructor(private http: HttpClient) {}

  // Get all tags for admin
  getAllTagsForAdmin() {
    return this.http.get<GenericRequestModel<tagdto[]>>(`${this.apiUrl}/admin`);
  }

  // Get all tags (regular endpoint)
  getAllTags() {
    return this.http.get<GenericRequestModel<tagdto[]>>(`${this.apiUrl}`);
  }

  // Add new tag
  addTag(tagName: string) {
    return this.http.post<GenericRequestModel<tagdto>>(
      `${this.apiUrl}/add`,
      JSON.stringify(tagName),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Edit tag
  editTag(id: number, updateTagDto: any) {
    return this.http.post<GenericRequestModel<tagdto>>(
      `${this.apiUrl}/edit/${id}`,
      updateTagDto
    );
  }

  // Change tag status
  changeTagStatus(id: number, status: TagStatus) {
    return this.http.post<GenericRequestModel<tagdto>>(
      `${this.apiUrl}/changeStatus/${id}?status=${status}`,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}

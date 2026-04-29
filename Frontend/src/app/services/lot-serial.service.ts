import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LotSerial {
  id?: number;
  identifier: string;
  productId: number;
  product?: any;
  expirationDate?: string;
  createdAt?: string;
  isExpired?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LotSerialService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5162/api/LotSerials';

  getAll(): Observable<LotSerial[]> {
    return this.http.get<LotSerial[]>(this.apiUrl);
  }

  getByProduct(productId: number): Observable<LotSerial[]> {
    return this.http.get<LotSerial[]>(`${this.apiUrl}/product/${productId}`);
  }

  create(data: LotSerial): Observable<LotSerial> {
    return this.http.post<LotSerial>(this.apiUrl, data);
  }

  update(id: number, data: LotSerial): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

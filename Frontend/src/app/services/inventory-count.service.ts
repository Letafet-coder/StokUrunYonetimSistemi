import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InventoryCount, ProductForCount } from '../models/inventory-count.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryCountService {
  private apiUrl = 'http://localhost:5162/api/inventorycounts';
  private http = inject(HttpClient);

  getCounts(): Observable<InventoryCount[]> {
    return this.http.get<InventoryCount[]>(this.apiUrl);
  }

  getCount(id: number): Observable<InventoryCount> {
    return this.http.get<InventoryCount>(`${this.apiUrl}/${id}`);
  }

  getProductsForCount(): Observable<ProductForCount[]> {
    return this.http.get<ProductForCount[]>(`${this.apiUrl}/products`);
  }

  createCount(count: InventoryCount): Observable<InventoryCount> {
    return this.http.post<InventoryCount>(this.apiUrl, count);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Warehouse, StorageLocation } from '../models/warehouse.model';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5162/api';

  // Warehouses
  getWarehouses(): Observable<Warehouse[]> {
    return this.http.get<Warehouse[]>(`${this.apiUrl}/warehouses`);
  }

  getWarehouse(id: number): Observable<Warehouse> {
    return this.http.get<Warehouse>(`${this.apiUrl}/warehouses/${id}`);
  }

  createWarehouse(warehouse: Warehouse): Observable<Warehouse> {
    return this.http.post<Warehouse>(`${this.apiUrl}/warehouses`, warehouse);
  }

  updateWarehouse(id: number, warehouse: Warehouse): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/warehouses/${id}`, warehouse);
  }

  deleteWarehouse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/warehouses/${id}`);
  }

  // Locations
  getLocations(): Observable<StorageLocation[]> {
    return this.http.get<StorageLocation[]>(`${this.apiUrl}/locations`);
  }

  getLocationsByWarehouse(warehouseId: number): Observable<StorageLocation[]> {
    return this.http.get<StorageLocation[]>(`${this.apiUrl}/locations?warehouseId=${warehouseId}`);
  }

  createLocation(location: StorageLocation): Observable<StorageLocation> {
    return this.http.post<StorageLocation>(`${this.apiUrl}/locations`, location);
  }

  updateLocation(id: number, location: StorageLocation): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/locations/${id}`, location);
  }

  deleteLocation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/locations/${id}`);
  }
}

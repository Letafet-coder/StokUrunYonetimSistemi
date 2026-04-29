import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category.model';
import { Product } from '../models/product.model';
import { StockMovement } from '../models/stock-movement.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:5162/api'; // Matched with actual running server port

  constructor(private http: HttpClient) { }

  // Categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }
  getWarehouses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/warehouses`);
  }
  postCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, category);
  }
  putCategory(id: number, category: Category): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/categories/${id}`, category);
  }
  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`);
  }

  // Products
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`);
  }
  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }
  postProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, product);
  }
  putProduct(id: number, product: Product): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/products/${id}`, product);
  }
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`);
  }

  // Stock Movements
  getMovements(): Observable<StockMovement[]> {
    return this.http.get<StockMovement[]>(`${this.apiUrl}/stockmovements`);
  }
  postMovement(movement: any): Observable<StockMovement> {
    return this.http.post<StockMovement>(`${this.apiUrl}/stockmovements`, movement);
  }
  deleteMovement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/stockmovements/${id}`);
  }

  // Dashboard
  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard/stats`);
  }
  getLowStock(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/dashboard/low-stock`);
  }

  // Inventory Counts
  getInventoryCounts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inventorycounts`);
  }
  getMovementsSummary(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/StockMovements/summary`);
  }
  getInventoryCount(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/inventorycounts/${id}`);
  }
  getProductsForCount(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inventorycounts/products`);
  }
  postInventoryCount(count: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/inventorycounts`, count);
  }

  // Reports (Admin Only)
  getReportSummary(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reports/summary`);
  }
  getReportAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reports/analytics`);
  }
  getLowStockReport(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reports/low-stock-report`);
  }

  // Lot / Serials
  getLotSerials(productId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/lotserials/product/${productId}`);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5162/api/reports';

  getSummary() {
    return this.http.get<any>(`${this.apiUrl}/summary`);
  }

  getAnalytics() {
    return this.http.get<any>(`${this.apiUrl}/analytics`);
  }

  getLowStockReport() {
    return this.http.get<any[]>(`${this.apiUrl}/low-stock-report`);
  }

  exportProducts() {
    return this.http.get(`${this.apiUrl}/export-products`, {
      responseType: 'blob'
    });
  }

  exportCsv() {
    return this.http.get(`${this.apiUrl}/export-csv`, {
      responseType: 'blob'
    });
  }

  exportPdf() {
    return this.http.get(`${this.apiUrl}/export-pdf`, {
      responseType: 'blob'
    });
  }
}

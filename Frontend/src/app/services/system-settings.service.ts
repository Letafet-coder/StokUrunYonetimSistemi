import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SystemSetting {
  key: string;
  value: string;
  description: string;
  group: string;
  lastUpdated: string;
}

@Injectable({
  providedIn: 'root'
})
export class SystemSettingsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5162/api/systemsettings';

  getSettings(): Observable<SystemSetting[]> {
    return this.http.get<SystemSetting[]>(this.apiUrl);
  }

  updateSetting(key: string, value: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${key}`, `"${value}"`, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  bulkUpdate(settings: { [key: string]: string }): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/bulk-update`, settings);
  }
}

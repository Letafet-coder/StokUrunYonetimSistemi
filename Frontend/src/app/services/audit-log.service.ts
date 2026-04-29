import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuditLog {
  id: number;
  userId: number;
  user?: { fullName: string; username: string };
  action: string;
  entityName: string;
  entityId: string;
  oldValues: string;
  newValues: string;
  timestamp: string;
  ipAddress: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5162/api/auditlogs';

  getLogs(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(this.apiUrl);
  }

  getUserLogs(userId: number): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.apiUrl}/user/${userId}`);
  }
}

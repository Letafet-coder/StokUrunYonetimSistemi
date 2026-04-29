import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../models/product.model';
import { AuthService } from './auth.service';

export interface Notification {
  id: string;
  titleKey: string;
  detailParams: any;
  type: 'info' | 'warn' | 'error';
  date: Date;
  read: boolean;
  link?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:5162/api/dashboard/low-stock';

  notifications = signal<Notification[]>([]);
  unreadCount = signal<number>(0);

  constructor() {
    // Initial fetch if user is logged in
    if (this.authService.isAuthenticated()) {
      this.refreshNotifications();
    }
  }

  refreshNotifications() {
    this.http.get<Product[]>(this.apiUrl).subscribe({
      next: (products) => {
        const dismissedStr = localStorage.getItem('dismissed_notifications') || '[]';
        const readStr = localStorage.getItem('read_notifications') || '[]';
        let dismissedIds: string[] = JSON.parse(dismissedStr);
        let readIds: string[] = JSON.parse(readStr);

        let newNotifications: Notification[] = [];
        
        products.forEach(p => {
          // Generate a unique ID that changes if stock changes
          const notifId = `low-stock-${p.id}-${p.stockQuantity}`;
          
          if (!dismissedIds.includes(notifId)) {
            newNotifications.push({
              id: notifId,
              titleKey: 'header.low_stock_warning',
              detailParams: { name: p.name, stock: p.stockQuantity, unit: p.unit },
              type: 'warn',
              date: new Date(),
              read: readIds.includes(notifId),
              link: '/products'
            });
          }
        });

        // Clean up localStorage to remove old IDs that are no longer relevant
        const currentNotifIds = products.map(p => `low-stock-${p.id}-${p.stockQuantity}`);
        dismissedIds = dismissedIds.filter(id => currentNotifIds.includes(id));
        readIds = readIds.filter(id => currentNotifIds.includes(id));
        localStorage.setItem('dismissed_notifications', JSON.stringify(dismissedIds));
        localStorage.setItem('read_notifications', JSON.stringify(readIds));

        this.notifications.set(newNotifications);
        this.updateUnreadCount();
      },
      error: (err) => console.error('Failed to fetch notifications', err)
    });
  }

  markAsRead(id: string) {
    const readStr = localStorage.getItem('read_notifications') || '[]';
    let readIds: string[] = JSON.parse(readStr);
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem('read_notifications', JSON.stringify(readIds));
    }

    const updated = this.notifications().map(n => n.id === id ? { ...n, read: true } : n);
    this.notifications.set(updated);
    this.updateUnreadCount();
  }

  markAllAsRead() {
    const readIds = this.notifications().map(n => n.id);
    localStorage.setItem('read_notifications', JSON.stringify(readIds));

    const updated = this.notifications().map(n => ({ ...n, read: true }));
    this.notifications.set(updated);
    this.unreadCount.set(0);
  }

  removeNotification(id: string) {
    const dismissedStr = localStorage.getItem('dismissed_notifications') || '[]';
    let dismissedIds: string[] = JSON.parse(dismissedStr);
    if (!dismissedIds.includes(id)) {
      dismissedIds.push(id);
      localStorage.setItem('dismissed_notifications', JSON.stringify(dismissedIds));
    }

    const updated = this.notifications().filter(n => n.id !== id);
    this.notifications.set(updated);
    this.updateUnreadCount();
  }

  clearAll() {
    const dismissedStr = localStorage.getItem('dismissed_notifications') || '[]';
    let dismissedIds: string[] = JSON.parse(dismissedStr);
    
    // Add all current notifications to dismissed
    this.notifications().forEach(n => {
      if (!dismissedIds.includes(n.id)) {
        dismissedIds.push(n.id);
      }
    });
    
    localStorage.setItem('dismissed_notifications', JSON.stringify(dismissedIds));
    this.notifications.set([]);
    this.unreadCount.set(0);
  }

  private updateUnreadCount() {
    this.unreadCount.set(this.notifications().filter(n => !n.read).length);
  }
}

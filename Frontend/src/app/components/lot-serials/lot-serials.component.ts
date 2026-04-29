import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { LotSerialService, LotSerial } from '../../services/lot-serial.service';
import { ApiService } from '../../services/api.service';
import { Product, TrackingType } from '../../models/product.model';

@Component({
  selector: 'app-lot-serials',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, DialogModule, InputTextModule, DatePickerModule, SelectModule, FormsModule, ToastModule, ConfirmDialogModule, TagModule, TranslatePipe],
  providers: [MessageService, ConfirmationService],
  templateUrl: './lot-serials.component.html'
})
export class LotSerialsComponent implements OnInit {
  items: LotSerial[] = [];
  products: Product[] = [];
  displayDialog: boolean = false;
  item: LotSerial = { identifier: '', productId: 0 };
  
  langService = inject(LanguageService);
  private lotService = inject(LotSerialService);
  private apiService = inject(ApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadItems();
    this.loadProducts();
  }

  loadItems() {
    this.lotService.getAll().subscribe({
      next: (data: LotSerial[]) => {
        this.items = data;
        this.cdr.detectChanges();
        console.log('Loaded lot serials:', data);
      },
      error: (err) => {
        console.error('Failed to load lot serials:', err);
        this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Veriler yüklenemedi!' });
      }
    });
  }

  loadProducts() {
    this.apiService.getProducts().subscribe((data: Product[]) => {
      // Only show products with tracking enabled
      this.products = data.filter(p => p.tracking && p.tracking !== (TrackingType.None as any));
      this.cdr.detectChanges();
    });
  }

  showDialogToAdd() {
    this.item = { identifier: '', productId: 0 };
    this.displayDialog = true;
  }

  editItem(item: LotSerial) {
    this.item = { ...item };
    if (this.item.expirationDate) {
      this.item.expirationDate = new Date(this.item.expirationDate) as any;
    }
    this.displayDialog = true;
  }

  save() {
    if (!this.item.identifier || !this.item.productId) {
      this.messageService.add({ severity: 'warn', summary: 'Eksik Bilgi', detail: 'Tanımlayıcı ve Ürün zorunludur' });
      return;
    }

    const data = { ...this.item };
    // Remove nested product object to avoid EF tracking errors
    delete data.product;

    if (data.id) {
      this.lotService.update(data.id, data).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'Güncellendi' });
          this.displayDialog = false;
          this.loadItems();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Hata', detail: err.error || 'Güncelleme başarısız' });
        }
      });
    } else {
      this.lotService.create(data).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'Kaydedildi' });
          this.displayDialog = false;
          this.loadItems();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Hata', detail: err.error || 'İşlem başarısız' });
        }
      });
    }
  }

  deleteItem(item: LotSerial) {
    this.confirmationService.confirm({
      header: 'Silme Onayı',
      message: `${item.identifier} silinecek. Emin misiniz?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.lotService.delete(item.id!).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'Silindi' });
            this.loadItems();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Hata', detail: err.error || 'Silinemez: Bu lotun aktif stok kayıtları olabilir.' });
          }
        });
      }
    });
  }

  getExpirationSeverity(item: LotSerial): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
    if (!item.expirationDate) return 'info';
    const exp = new Date(item.expirationDate);
    const now = new Date();
    if (exp < now) return 'danger';
    
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 30) return 'warn';
    
    return 'success';
  }
}

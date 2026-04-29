import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Category } from '../../models/category.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { LanguageService } from '../../services/language.service';

import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, DialogModule, InputTextModule, TextareaModule, FormsModule, ToastModule, TooltipModule, TranslatePipe],
  providers: [MessageService],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  displayDialog: boolean = false;
  category: Category = { name: '', description: '' };
  isEdit: boolean = false;
  loading: boolean = false;
  authService = inject(AuthService);
  langService = inject(LanguageService);
  confirmationService = inject(ConfirmationService);
  
  constructor(private apiService: ApiService, private messageService: MessageService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories() {
    this.apiService.getCategories().subscribe({
      next: (data) => {
        this.categories = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Kategoriler yüklenemedi:', err);
        this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Kategoriler yüklenemedi.' });
      }
    });
  }

  showDialogToAdd() {
    this.isEdit = false;
    this.category = { name: '', description: '' };
    this.displayDialog = true;
  }

  editCategory(cat: Category) {
    this.isEdit = true;
    this.category = { ...cat };
    this.displayDialog = true;
  }

  deleteCategory(cat: Category) {
    this.confirmationService.confirm({
      message: this.langService.translate('common.confirm_delete_msg'),
      header: this.langService.translate('common.confirm_delete_title'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.langService.translate('common.yes'),
      rejectLabel: this.langService.translate('common.no'),
      accept: () => {
        this.apiService.deleteCategory(cat.id!).subscribe({
          next: () => {
            this.categories = this.categories.filter(c => c.id !== cat.id);
            this.messageService.add({ severity: 'success', summary: this.langService.translate('common.success'), detail: this.langService.translate('common.saved') });
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: this.langService.translate('common.error'), detail: err.error || 'Err' });
          }
        });
      }
    });
  }

  save() {
    if (!this.category.name || this.category.name.trim() === '') {
      this.messageService.add({ severity: 'warn', summary: 'Eksik Bilgi', detail: 'Lütfen kategori adını giriniz' });
      return;
    }

    // Duplicate Check for NEW categories
    if (!this.isEdit && this.categories.some(c => c.name.toLowerCase() === this.category.name.toLowerCase())) {
      this.messageService.add({ severity: 'error', summary: 'Mükerrer Kayıt', detail: 'Bu isimde bir kategori zaten mevcut!' });
      return;
    }

    this.loading = true;

    if (this.isEdit) {
      this.apiService.putCategory(this.category.id!, this.category).subscribe({
        next: () => {
          // Optimistic update: yerel listedeki kaydı güncelle
          this.categories = this.categories.map(c =>
            c.id === this.category.id ? { ...this.category } : c
          );
          this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'Kategori güncellendi' });
          this.displayDialog = false;
          this.loading = false;
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Kategori güncellenemedi: ' + (err.error || 'Bilinmeyen hata') });
          this.loading = false;
        }
      });
    } else {
      const newCategory = { name: this.category.name.trim(), description: this.category.description?.trim() || '' };

      this.apiService.postCategory(newCategory as Category).subscribe({
        next: (created) => {
          // API'den dönen kaydı (ID dahil) listeye ekle — yenilemeye gerek yok
          this.categories = [...this.categories, created];
          this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'Kategori oluşturuldu' });
          this.displayDialog = false;
          this.loading = false;
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Kategori oluşturulamadı: ' + (err.error || 'Yetkiniz olmayabilir veya sunucu hatası') });
          this.loading = false;
        }
      });
    }
  }
}

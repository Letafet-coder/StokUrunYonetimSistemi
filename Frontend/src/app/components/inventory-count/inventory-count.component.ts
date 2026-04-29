import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { InventoryCountService } from '../../services/inventory-count.service';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';
import { AuthService } from '../../services/auth.service';
import { InventoryCount, InventoryCountItem, ProductForCount } from '../../models/inventory-count.model';
import { Category } from '../../models/category.model';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-inventory-count',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    TableModule, 
    ButtonModule, 
    InputTextModule, 
    InputNumberModule, 
    TagModule, 
    ToastModule, 
    SelectButtonModule, 
    TextareaModule, 
    SelectModule,
    TooltipModule,
    ConfirmDialogModule,
    TranslatePipe
  ],
  providers: [MessageService],
  templateUrl: './inventory-count.component.html',
  styleUrl: './inventory-count.component.css'
})
export class InventoryCountComponent implements OnInit {
  // View state
  viewMode: 'history' | 'new' = 'history';
  viewOptions = [
    { label: '', value: 'history', icon: 'pi pi-history', langKey: 'audit.history' },
    { label: '', value: 'new', icon: 'pi pi-plus', langKey: 'audit.start_new' }
  ];

  // Data
  history: InventoryCount[] = [];
  products: ProductForCount[] = [];
  categories: Category[] = [];
  
  // New Audit State
  description: string = '';
  selectedCategoryId: number | null = null;
  loading: boolean = false;

  // Services
  private auditService = inject(InventoryCountService);
  private apiService = inject(ApiService);
  private messageService = inject(MessageService);
  private confirmService = inject(ConfirmationService);
  langService = inject(LanguageService);
  authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.updateViewOptions();
    this.loadHistory();
    this.loadCategories();
  }

  updateViewOptions() {
    this.viewOptions = this.viewOptions.map(opt => ({
      ...opt,
      label: this.langService.translate(opt.langKey)
    }));
  }

  loadHistory() {
    this.loading = true;
    this.auditService.getCounts().subscribe({
      next: (data) => {
        this.history = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load history' });
        this.loading = false;
      }
    });
  }

  loadCategories() {
    this.apiService.getCategories().subscribe(data => this.categories = data);
  }

  startNewAudit() {
    this.loading = true;
    this.auditService.getProductsForCount().subscribe({
      next: (data) => {
        this.products = data.map(p => ({
          ...p,
          countedQuantity: p.stockQuantity // Default to system stock as starting point
        }));
        this.viewMode = 'new';
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load products' });
        this.loading = false;
      }
    });
  }

  get filteredProducts() {
    if (!this.selectedCategoryId) return this.products;
    const catName = this.categories.find(c => c.id === this.selectedCategoryId)?.name;
    return this.products.filter(p => p.categoryName === catName);
  }

  getDifference(product: ProductForCount): number {
    return (product.countedQuantity || 0) - product.stockQuantity;
  }

  getDiffSeverity(diff: number) {
    if (diff === 0) return 'success';
    if (diff > 0) return 'info';
    return 'danger';
  }

  getDiffLabel(diff: number) {
    if (diff === 0) return this.langService.translate('audit.status_match');
    if (diff > 0) return this.langService.translate('audit.status_gain');
    return this.langService.translate('audit.status_loss');
  }

  finalizeAudit() {
    const changes = this.products.filter(p => p.countedQuantity !== p.stockQuantity);
    
    this.confirmService.confirm({
      header: this.langService.translate('audit.finalize'),
      message: this.langService.translate('audit.confirm_msg'), 
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.langService.translate('common.save'),
      rejectLabel: this.langService.translate('common.cancel'),
      acceptIcon: 'pi pi-check',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => {
        this.submitAudit();
      }
    });
  }

  submitAudit() {
    const audit: InventoryCount = {
      date: new Date(),
      description: this.description,
      status: 'Completed',
      createdByUserId: 0, // Set by backend but TS needs it
      items: this.products.map(p => ({
        productId: p.id,
        theoreticalQuantity: p.stockQuantity,
        countedQuantity: p.countedQuantity || 0
      }))
    };

    this.auditService.createCount(audit).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: this.langService.translate('common.success'), detail: this.langService.translate('audit.success') });
        this.viewMode = 'history';
        this.description = '';
        this.loadHistory();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error || 'Submit failed' });
      }
    });
  }

  onViewChange() {
    if (this.viewMode === 'new' && this.products.length === 0) {
      this.startNewAudit();
    }
  }
}

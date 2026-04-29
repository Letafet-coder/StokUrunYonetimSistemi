import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { MovementType, StockMovement } from '../../models/stock-movement.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { LanguageService } from '../../services/language.service';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';

import { TranslatePipe } from '../../pipes/translate.pipe';
import { WarehouseService } from '../../services/warehouse.service';
import { StorageLocation } from '../../models/warehouse.model';
import { LotSerialService, LotSerial } from '../../services/lot-serial.service';
import { TrackingType } from '../../models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, DialogModule, InputTextModule, SelectModule, InputNumberModule, FormsModule, ToastModule, TagModule, SelectButtonModule, TextareaModule, TooltipModule, TranslatePipe],
  providers: [MessageService],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  displayDialog: boolean = false;
  product: Product = { name: '', categoryId: 0, price: 0, stockQuantity: 0, criticalLevel: 10, unit: 'Adet', tracking: TrackingType.None };
  isEdit: boolean = false;
  loading: boolean = false;
  saving: boolean = false;

  trackingTypeOptions = [
    { label: 'Takip Yok', value: TrackingType.None },
    { label: 'Parti (Lot) Takibi', value: TrackingType.Lot },
    { label: 'Seri No Takibi', value: TrackingType.Serial }
  ];

  // Stock Movement Transaction
  displayStockDialog: boolean = false;
  locations: StorageLocation[] = [];
  lotSerials: LotSerial[] = [];
  
  movementTypeOptions = [
    { label: 'Giriş (+)', value: MovementType.In, icon: 'pi pi-plus-circle' },
    { label: 'Çıkış (-)', value: MovementType.Out, icon: 'pi pi-minus-circle' },
    { label: 'Transfer', value: MovementType.Transfer, icon: 'pi pi-directions' }
  ];
  stockMovement: StockMovement = { productId: 0, quantity: 1, type: MovementType.In, date: '', toLocationId: 1 };
  selectedProduct: Product | null = null;

  authService = inject(AuthService);
  langService = inject(LanguageService);
  confirmationService = inject(ConfirmationService);
  private warehouseService = inject(WarehouseService);
  private lotService = inject(LotSerialService);

  constructor(private apiService: ApiService, private messageService: MessageService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    this.loadLocations();
  }

  loadProducts() {
    this.apiService.getProducts().subscribe({
      next: (data: Product[]) => {
        this.products = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Ürünler yüklenemedi:', err);
        this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Ürünler yüklenemedi.' });
      }
    });
  }

  loadCategories() {
    this.apiService.getCategories().subscribe({
      next: (data: Category[]) => { this.categories = [...data]; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  loadLocations() {
    this.warehouseService.getLocations().subscribe((data: StorageLocation[]) => {
      this.locations = data;
      this.cdr.detectChanges();
    });
  }

  showDialogToAdd() {
    this.isEdit = false;
    this.product = { name: '', categoryId: 0, price: 0, stockQuantity: 0, criticalLevel: 10, unit: 'Adet', sku: '', tracking: TrackingType.None };
    this.displayDialog = true;
  }

  editProduct(prod: Product) {
    this.isEdit = true;
    this.product = { ...prod };
    this.displayDialog = true;
  }

  deleteProduct(prod: Product) {
    this.confirmationService.confirm({
      message: this.langService.translate('common.confirm_delete_msg'),
      header: this.langService.translate('common.confirm_delete_title'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.langService.translate('common.yes'),
      rejectLabel: this.langService.translate('common.no'),
      accept: () => {
        this.apiService.deleteProduct(prod.id!).subscribe({
          next: () => {
            this.products = this.products.filter(p => p.id !== prod.id);
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
    // Validation
    if (!this.product.name || this.product.name.trim() === '') {
      this.messageService.add({ severity: 'warn', summary: 'Eksik Bilgi', detail: 'Lütfen ürün adını giriniz' });
      return;
    }
    if (!this.product.categoryId || this.product.categoryId === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Eksik Bilgi', detail: 'Lütfen geçerli bir kategori seçin' });
      return;
    }

    // Duplicate Check for NEW products (Name or SKU)
    if (!this.isEdit) {
      const isDuplicateName = this.products.some(p => p.name.toLowerCase() === this.product.name.toLowerCase());
      const isDuplicateSku = this.product.sku && this.products.some(p => p.sku?.toLowerCase() === this.product.sku?.toLowerCase());

      if (isDuplicateName) {
        this.messageService.add({ severity: 'error', summary: 'Mükerrer Ürün', detail: 'Bu isimde bir ürün zaten mevcut!' });
        return;
      }
      if (isDuplicateSku) {
        this.messageService.add({ severity: 'error', summary: 'Mükerrer SKU', detail: 'Bu SKU/Barkod zaten başka bir üründe kullanılıyor!' });
        return;
      }
    }

    this.saving = true;

    if (this.isEdit) {
      this.apiService.putProduct(this.product.id!, this.product).subscribe({
        next: () => {
          this.saving = false;
          const category = this.categories.find(c => c.id === this.product.categoryId);
          const updatedProduct = { ...this.product, category };
          this.products = this.products.map(p =>
            p.id === this.product.id ? updatedProduct : p
          );
          this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'Ürün güncellendi' });
          this.displayDialog = false;
        },
        error: (err) => {
          this.saving = false;
          this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Güncelleme başarısız: ' + (err.error || 'Sunucu hatası') });
        }
      });
    } else {
      this.apiService.postProduct(this.product).subscribe({
        next: (created) => {
          this.saving = false;
          const category = this.categories.find(c => c.id === created.categoryId);
          const newProduct = { ...created, category };
          this.products = [...this.products, newProduct];
          this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'Ürün oluşturuldu' });
          this.displayDialog = false;
        },
        error: (err) => {
          this.saving = false;
          this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Ürün oluşturulamadı: ' + (err.error || 'Eksik veri veya yetki hatası') });
        }
      });
    }
  }

  // Stock Transaction Methods
  openStockDialog(prod: Product) {
    this.selectedProduct = prod;
    this.lotSerials = [];
    this.stockMovement = {
      productId: prod.id!,
      quantity: 1,
      type: MovementType.In,
      date: new Date().toISOString(),
      description: '',
      supplierOrClient: '',
      toLocationId: this.locations[0]?.id || 1,
      lotSerialId: undefined
    };

    // If product is tracked, load existing lots/serials
    if (prod.tracking !== TrackingType.None) {
      this.lotService.getByProduct(prod.id!).subscribe((data: LotSerial[]) => {
        this.lotSerials = data;
        this.cdr.detectChanges();
      });
    }

    this.displayStockDialog = true;
  }

  saveStockMovement() {
    if (!this.stockMovement.quantity || this.stockMovement.quantity <= 0) {
      this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Miktar 0\'dan büyük olmalıdır' });
      return;
    }

    if (this.stockMovement.type === MovementType.Out && this.selectedProduct!.stockQuantity < this.stockMovement.quantity) {
      this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Yetersiz stok!' });
      return;
    }

    this.apiService.postMovement(this.stockMovement).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'Stok hareketi kaydedildi' });
        this.displayStockDialog = false;
        // Stok hareketi sonrası güncel miktarları almak için liste yenile
        this.loadProducts();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Bir hata oluştu: ' + (err.error || err.message) });
      }
    });
  }

  getStockSeverity(product: Product) {
    if (product.stockQuantity <= 0) return 'danger';
    if (product.stockQuantity <= product.criticalLevel) return 'warn';
    return 'success';
  }
}

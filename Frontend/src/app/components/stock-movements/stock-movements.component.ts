import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';
import { StockMovement, MovementType } from '../../models/stock-movement.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { WarehouseService } from '../../services/warehouse.service';
import { StorageLocation } from '../../models/warehouse.model';

@Component({
  selector: 'app-stock-movements',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, DialogModule, SelectModule, InputNumberModule, InputTextModule, FormsModule, ToastModule, TagModule, TranslatePipe, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './stock-movements.component.html',
  styleUrl: './stock-movements.component.css'
})
export class StockMovementsComponent implements OnInit {
  movements: StockMovement[] = [];
  summary: any = { stockIn: 0, stockOut: 0, adjustment: 0, transfer: 0 };
  products: Product[] = [];
  locations: StorageLocation[] = [];
  displayDialog: boolean = false;
  movement: StockMovement = { productId: 0, quantity: 1, type: MovementType.In, date: '', toLocationId: 1 };
  selectedProduct: Product | null = null;
  identifiers: any[] = [];
  loadingIdentifiers: boolean = false;
  availableStock: number | null = null;

  authService = inject(AuthService);
  langService = inject(LanguageService);
  private warehouseService = inject(WarehouseService);

  movementLevels = [
    { label: this.langService.translate('common.in'), value: MovementType.In },
    { label: this.langService.translate('common.out'), value: MovementType.Out },
    { label: this.langService.translate('enterprise.transfer'), value: MovementType.Transfer },
    { label: this.langService.translate('movements.adjustment_label'), value: MovementType.Adjustment }
  ];

  constructor(
    private apiService: ApiService, 
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData() {
    this.loadMovements();
    this.loadProducts();
    this.loadLocations();
    this.loadSummary();
  }

  loadMovements() {
    this.apiService.getMovements().subscribe({
      next: (data: StockMovement[]) => {
        this.movements = data;
      },
      error: (err) => {
        console.error('Movements load error:', err);
        this.messageService.add({ severity: 'error', summary: this.langService.translate('common.error'), detail: this.langService.translate('common.error') });
      }
    });
  }

  loadSummary() {
    this.apiService.getMovementsSummary().subscribe({
      next: (data) => this.summary = data,
      error: () => console.warn('Summary load error')
    });
  }

  loadProducts() {
    this.apiService.getProducts().subscribe({
      next: (data: Product[]) => this.products = data,
      error: (err) => {
        console.error('Products load error:', err);
        this.messageService.add({ severity: 'error', summary: this.langService.translate('common.error'), detail: this.langService.translate('common.error') });
      }
    });
  }

  loadLocations() {
    this.warehouseService.getLocations().subscribe({
      next: (data: StorageLocation[]) => this.locations = data,
      error: (err) => console.error('Locations load error:', err)
    });
  }

  onProductChange(event: any) {
    const productId = event.value;
    // Use loose equality or cast to number to avoid type mismatch
    this.selectedProduct = this.products.find(p => p.id == productId) || null;
    this.movement.lotSerialId = undefined;
    
    if (this.hasTracking(this.selectedProduct)) {
      this.loadIdentifiers(productId);
    } else {
      this.identifiers = [];
      this.updateAvailableStock();
    }
  }

  hasTracking(product: any): boolean {
    if (!product) return false;
    // Handle both camelCase/PascalCase and string/numeric enums
    const t = product.tracking ?? product['Tracking'];
    if (t === undefined || t === null) return false;
    if (t === 0 || t === 'None') return false;
    return true;
  }

  isLotTracking(product: any): boolean {
    if (!product) return false;
    const t = product.tracking ?? product['Tracking'];
    return t === 1 || t === 'Lot';
  }

  loadIdentifiers(productId: number) {
    this.loadingIdentifiers = true;
    this.apiService.getLotSerials(productId).subscribe({
      next: (data) => {
        this.identifiers = data;
        this.loadingIdentifiers = false;
        this.updateAvailableStock();
      },
      error: () => {
        this.identifiers = [];
        this.loadingIdentifiers = false;
        this.updateAvailableStock();
      }
    });
  }

  updateAvailableStock() {
    if (!this.selectedProduct || !this.movement.fromLocationId) {
      this.availableStock = null;
      return;
    }

    const stocks = (this.selectedProduct as any).productStocks || [];
    const stock = stocks.find((s: any) => 
      s.locationId == this.movement.fromLocationId && 
      (this.movement.lotSerialId ? s.lotSerialId == this.movement.lotSerialId : s.lotSerialId == null)
    );
    
    this.availableStock = stock ? stock.quantity : 0;
  }

  showDialog() {
    this.selectedProduct = null;
    this.identifiers = [];
    this.availableStock = null;
    this.movement = { 
        productId: 0, 
        quantity: 1, 
        type: MovementType.In, 
        date: new Date().toISOString(),
        description: '',
        supplierOrClient: '',
        documentNumber: '',
        toLocationId: this.locations[0]?.id || 1
    };
    this.displayDialog = true;
  }

  save() {
    if (!this.movement.productId || this.movement.productId === 0) {
        this.messageService.add({ severity: 'error', summary: this.langService.translate('common.error'), detail: this.langService.translate('products.select_product') });
        return;
    }

    if (this.hasTracking(this.selectedProduct) && !this.movement.lotSerialId) {
        this.messageService.add({ severity: 'error', summary: this.langService.translate('common.error'), detail: this.langService.translate('enterprise.select_identifier') });
        return;
    }

    if (this.movement.type === MovementType.Transfer) {
      if (!this.movement.fromLocationId || !this.movement.toLocationId) {
        this.messageService.add({ severity: 'warn', summary: this.langService.translate('common.error'), detail: this.langService.translate('enterprise.to_location') });
        return;
      }
      if (this.movement.fromLocationId === this.movement.toLocationId) {
        this.messageService.add({ severity: 'warn', summary: this.langService.translate('common.error'), detail: this.langService.translate('common.error') });
        return;
      }
    }

    this.apiService.postMovement(this.movement).subscribe({
        next: () => {
            this.messageService.add({ severity: 'success', summary: this.langService.translate('common.success'), detail: this.langService.translate('common.saved') });
            this.displayDialog = false;
            this.loadMovements();
            this.loadSummary();
        },
        error: (err) => {
            this.messageService.add({ severity: 'error', summary: this.langService.translate('common.error'), detail: err.error || this.langService.translate('common.error') });
        }
    });
  }

  deleteMovement(id: number) {
    if (!this.authService.isAdmin()) {
      this.messageService.add({ severity: 'error', summary: 'Yetki Hatası', detail: 'Sadece yöneticiler hareket silebilir.' });
      return;
    }

    this.confirmationService.confirm({
      message: 'Bu stok hareketini silmek istediğinizden emin misiniz? Stok miktarları otomatik olarak geri alınacaktır.',
      header: 'Silme Onayı',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.langService.translate('common.yes'),
      rejectLabel: this.langService.translate('common.no'),
      accept: () => {
        this.apiService.deleteMovement(id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'Hareket silindi ve stoklar güncellendi.' });
            this.refreshData();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'İşlem başarısız oldu.' })
        });
      }
    });
  }
}

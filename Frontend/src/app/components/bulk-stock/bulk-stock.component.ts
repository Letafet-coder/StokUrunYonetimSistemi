import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Product } from '../../models/product.model';
import { Warehouse, StorageLocation } from '../../models/warehouse.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { InputNumberModule } from 'primeng/inputnumber';

interface BulkItem {
  productId?: number;
  quantity: number;
  warehouseId?: number;
  locationId?: number;
}

@Component({
  selector: 'app-bulk-stock',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, SelectModule, InputTextModule, FormsModule, ToastModule, TranslatePipe, InputNumberModule],
  providers: [MessageService],
  template: `
    <div class="p-4">
      <div class="glass-card p-4 border-round-2xl">
        <div class="flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="text-3xl font-bold m-0 text-900 tracking-tight">{{ 'bulk_stock.title' | translate }}</h1>
            <p class="text-secondary m-0 opacity-70">{{ 'bulk_stock.subtitle' | translate }}</p>
          </div>
          <div class="flex gap-2">
            <p-button [label]="'bulk_stock.add_row' | translate" icon="pi pi-plus" (click)="addRow()" styleClass="p-button-outlined"></p-button>
            <p-button [label]="'bulk_stock.save_all' | translate" icon="pi pi-save" (click)="saveAll()" [loading]="loading" styleClass="p-button-raised bg-primary border-none shadow-premium"></p-button>
          </div>
        </div>

        <div class="mb-6 p-4 bg-50 border-round-xl border-1 border-soft flex align-items-center gap-4 shadow-sm">
            <div class="w-4rem h-4rem border-circle bg-primary-100 text-primary flex align-items-center justify-content-center">
                <i class="pi pi-building text-2xl"></i>
            </div>
            <div class="flex-1">
                <label class="block font-bold text-900 mb-2">{{ 'bulk_stock.warehouse' | translate }}</label>
                <p-select [options]="warehouses" [(ngModel)]="globalWarehouseId" optionLabel="name" optionValue="id" 
                         [placeholder]="'bulk_stock.warehouse' | translate" (onChange)="onGlobalWarehouseChange()" 
                         styleClass="w-full md:w-25rem modern-select">
                    <ng-template pTemplate="selectedItem" let-item>
                        {{item.name | translate}}
                    </ng-template>
                    <ng-template pTemplate="item" let-item>
                        {{item.name | translate}}
                    </ng-template>
                </p-select>
            </div>
            <div class="hidden md:block text-right opacity-60">
                <p class="m-0 text-sm font-bold">{{ 'bulk_stock.total_rows' | translate }}: {{items.length}}</p>
                <p class="m-0 text-xs">{{ 'bulk_stock.valid_rows' | translate }}: {{getValidCount()}}</p>
            </div>
        </div>

        <p-table [value]="items" responsiveLayout="scroll" styleClass="modern-table">
          <ng-template pTemplate="header">
            <tr>
              <th>{{ 'bulk_stock.product' | translate }}</th>
              <th>{{ 'bulk_stock.quantity' | translate }}</th>
              <th>{{ 'bulk_stock.location' | translate }}</th>
              <th style="width: 50px"></th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-item let-index="rowIndex">
            <tr>
              <td>
                <p-select [options]="products" [(ngModel)]="item.productId" optionLabel="name" optionValue="id" [filter]="true" filterBy="name" [placeholder]="'bulk_stock.product' | translate" styleClass="w-full"></p-select>
              </td>
              <td>
                <p-inputNumber [(ngModel)]="item.quantity" [min]="1" styleClass="w-full"></p-inputNumber>
              </td>
              <td>
                <p-select [options]="getLocations(globalWarehouseId)" [(ngModel)]="item.locationId" optionLabel="name" optionValue="id" [placeholder]="'bulk_stock.location' | translate" styleClass="w-full">
                    <ng-template pTemplate="selectedItem" let-item>
                        {{item.name | translate}}
                    </ng-template>
                    <ng-template pTemplate="item" let-item>
                        {{item.name | translate}}
                    </ng-template>
                </p-select>
              </td>
              <td>
                <p-button icon="pi pi-trash" (click)="removeRow(index)" styleClass="p-button-rounded p-button-text p-button-danger"></p-button>
              </td>
            </tr>
          </ng-template>
        </p-table>

        <div *ngIf="items.length === 0" class="text-center p-5 opacity-50">
            <i class="pi pi-info-circle text-4xl mb-3 block"></i>
            {{ 'bulk_stock.empty_msg' | translate }}
        </div>
      </div>
    </div>
    <p-toast></p-toast>
  `
})
export class BulkStockComponent implements OnInit {
  private http = inject(HttpClient);
  private messageService = inject(MessageService);
  
  products: Product[] = [];
  warehouses: Warehouse[] = [];
  locations: StorageLocation[] = [];
  items: BulkItem[] = [];
  globalWarehouseId?: number;
  loading = false;

  ngOnInit() {
    this.loadData();
    this.addRow(); // Start with one empty row
  }

  loadData() {
    this.http.get<Product[]>('http://localhost:5162/api/products').subscribe(data => this.products = data);
    this.http.get<Warehouse[]>('http://localhost:5162/api/warehouses').subscribe(data => this.warehouses = data);
    this.http.get<StorageLocation[]>('http://localhost:5162/api/locations').subscribe(data => this.locations = data);
  }

  addRow() {
    this.items.push({ quantity: 0 });
  }

  removeRow(index: number) {
    this.items.splice(index, 1);
  }

  onGlobalWarehouseChange() {
    this.items.forEach(i => i.locationId = undefined);
  }

  getValidCount(): number {
    return this.items.filter(i => i.productId && i.quantity > 0 && i.locationId).length;
  }

  getLocations(warehouseId?: number): StorageLocation[] {
    if (!warehouseId) return [];
    return this.locations.filter(l => l.warehouseId === warehouseId);
  }

  saveAll() {
    const validItems = this.items.filter(i => i.productId && i.quantity > 0 && i.locationId).map(i => ({
      ...i,
      warehouseId: this.globalWarehouseId
    }));
    if (validItems.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Uyarı', detail: 'Lütfen geçerli satırları doldurun.' });
      return;
    }

    this.loading = true;
    this.http.post('http://localhost:5162/api/bulkstock/upload', validItems).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'Toplu stok girişi tamamlandı.' });
        this.items = [];
        this.addRow();
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Stok girişi yapılamadı.' });
        this.loading = false;
      }
    });
  }
}

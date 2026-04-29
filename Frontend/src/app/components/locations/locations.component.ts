import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WarehouseService } from '../../services/warehouse.service';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { StorageLocation, Warehouse, LocationType } from '../../models/warehouse.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [
    CommonModule, 
    TableModule, 
    ButtonModule, 
    DialogModule, 
    InputTextModule, 
    SelectModule, 
    TagModule, 
    FormsModule, 
    ToastModule, 
    TooltipModule, 
    TranslatePipe
  ],
  providers: [MessageService],
  template: `
    <div class="page-container glass-panel fade-in shadow-4">
      <div class="flex justify-content-between align-items-center mb-5">
        <div>
          <h1 class="text-3xl font-bold text-900 m-0 tracking-tight">{{ 'enterprise.locations' | translate }}</h1>
          <p class="text-secondary m-0 mt-2 font-medium">{{ 'enterprise.storage' | translate }} - {{ 'enterprise.locations' | translate }}</p>
        </div>
        <button pButton pRipple 
                [label]="'common.add_new' | translate" 
                icon="pi pi-plus" 
                class="p-button-raised p-button-primary shadow-hover px-4 py-3" 
                (click)="showDialogToAdd()"
                *ngIf="authService.isAdmin()">
        </button>
      </div>

      <div class="table-card p-0 overflow-hidden shadow-soft border-round-xl">
        <p-table [value]="locations" [responsiveLayout]="'scroll'" [loading]="loading"
                 styleClass="p-datatable-gridlines p-datatable-striped"
                 [rows]="10" [paginator]="locations.length > 0">
          <ng-template pTemplate="header">
            <tr class="bg-faded py-3">
              <th class="px-4 py-3">{{ 'enterprise.warehouse_name' | translate }}</th>
              <th class="px-4 py-3">{{ 'enterprise.location_name' | translate }}</th>
              <th class="px-4 py-3">{{ 'enterprise.shelf_code' | translate }}</th>
              <th class="px-4 py-3">{{ 'enterprise.aisle' | translate }} / {{ 'enterprise.rack' | translate }} / {{ 'enterprise.level' | translate }}</th>
              <th class="px-4 py-3">{{ 'products.status' | translate }}</th>
              <th class="px-4 py-3 text-center" *ngIf="authService.isAdmin()" style="width: 150px;">{{ 'common.actions' | translate }}</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-loc>
            <tr class="hover-row transition-all duration-200">
              <td class="px-4 py-3">
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-building text-primary"></i>
                  <span class="font-bold text-900">{{ loc.warehouse?.name || 'Default' }}</span>
                </div>
              </td>
              <td class="px-4 py-3 font-semibold text-900">{{ loc.name }}</td>
              <td class="px-4 py-3">
                <code class="bg-primary-50 text-primary px-2 py-1 border-round font-mono font-bold">{{ loc.shelfCode || '-' }}</code>
              </td>
              <td class="px-4 py-3">
                <div class="flex align-items-center gap-3 text-secondary text-sm">
                  <span *ngIf="loc.aisle" [pTooltip]="'enterprise.aisle' | translate" class="flex align-items-center gap-1">
                    <i class="pi pi-directions text-xs"></i> {{loc.aisle}}
                  </span>
                  <span *ngIf="loc.rack" [pTooltip]="'enterprise.rack' | translate" class="flex align-items-center gap-1">
                    <i class="pi pi-server text-xs"></i> {{loc.rack}}
                  </span>
                  <span *ngIf="loc.level" [pTooltip]="'enterprise.level' | translate" class="flex align-items-center gap-1">
                    <i class="pi pi-sort text-xs"></i> {{loc.level}}
                  </span>
                  <span *ngIf="loc.position" [pTooltip]="'enterprise.position' | translate" class="flex align-items-center gap-1">
                    <i class="pi pi-map-marker text-xs"></i> {{loc.position}}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3">
                <p-tag [value]="getTypeLabel(loc.type)" [severity]="getTypeSeverity(loc.type)" [rounded]="true"></p-tag>
              </td>
              <td class="px-4 py-3 text-center" *ngIf="authService.isAdmin()">
                <div class="flex justify-content-center gap-2">
                  <button pButton pRipple icon="pi pi-pencil" 
                          class="p-button-rounded p-button-text p-button-info shadow-hover-soft" 
                          (click)="editLocation(loc)" [pTooltip]="'common.edit' | translate"></button>
                  <button pButton pRipple icon="pi pi-trash" 
                          class="p-button-rounded p-button-text p-button-danger shadow-hover-soft" 
                          (click)="deleteLocation(loc)" [pTooltip]="'common.delete' | translate"></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center py-8">
                <div class="flex flex-column align-items-center gap-3">
                  <i class="pi pi-map-marker text-3xl text-300"></i>
                  <p class="text-secondary m-0">{{ 'categories.not_found' | translate }}</p>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Add/Edit Dialog -->
    <p-dialog [(visible)]="displayDialog" 
              [header]="(isEdit ? 'common.edit' : 'common.add_new') | translate" 
              [modal]="true" 
              [style]="{width: '600px'}" 
              styleClass="glass-dialog p-fluid"
              [draggable]="false" [resizable]="false">
      <div class="flex flex-column gap-4 pt-4">
        <div class="grid">
          <div class="col-12 md:col-6 field">
            <label for="warehouse" class="font-bold block mb-2 text-900">{{ 'enterprise.warehouse_name' | translate }}</label>
            <p-select id="warehouse" [options]="warehouses" [(ngModel)]="location.warehouseId" 
                      optionLabel="name" optionValue="id" 
                      [placeholder]="'common.search' | translate" class="border-round-xl" appendTo="body"></p-select>
          </div>
          <div class="col-12 md:col-6 field">
            <label for="type" class="font-bold block mb-2 text-900">{{ 'products.status' | translate }}</label>
            <p-select id="type" [options]="typeOptions" [(ngModel)]="location.type" 
                      optionLabel="label" optionValue="value" 
                      class="border-round-xl" appendTo="body"></p-select>
          </div>
        </div>

        <div class="field">
          <label for="name" class="font-bold block mb-2 text-900">{{ 'enterprise.location_name' | translate }}</label>
          <input pInputText id="name" [(ngModel)]="location.name" 
                 [placeholder]="'Örn: Ana Depo Raf A'" class="p-inputtext-lg border-round-xl" />
        </div>

        <div class="surface-ground p-3 border-round-xl border-1 border-300">
           <p class="mt-0 mb-3 font-bold text-sm text-secondary uppercase tracking-wider">{{ 'enterprise.storage' | translate }} Detayları</p>
           <div class="grid">
             <div class="col-6 md:col-3 field">
               <label class="text-xs font-bold mb-1 block">{{ 'enterprise.aisle' | translate }}</label>
               <input pInputText [(ngModel)]="location.aisle" placeholder="A, B..." class="border-round-lg" (ngModelChange)="autoGenCode()" />
             </div>
             <div class="col-6 md:col-3 field">
               <label class="text-xs font-bold mb-1 block">{{ 'enterprise.rack' | translate }}</label>
               <input pInputText [(ngModel)]="location.rack" placeholder="1, 2..." class="border-round-lg" (ngModelChange)="autoGenCode()" />
             </div>
             <div class="col-6 md:col-3 field">
               <label class="text-xs font-bold mb-1 block">{{ 'enterprise.level' | translate }}</label>
               <input pInputText [(ngModel)]="location.level" placeholder="L1, L2..." class="border-round-lg" (ngModelChange)="autoGenCode()" />
             </div>
             <div class="col-6 md:col-3 field">
               <label class="text-xs font-bold mb-1 block">{{ 'enterprise.position' | translate }}</label>
               <input pInputText [(ngModel)]="location.position" placeholder="01, 02..." class="border-round-lg" (ngModelChange)="autoGenCode()" />
             </div>
           </div>
        </div>

        <div class="field">
          <label for="code" class="font-bold block mb-2 text-900">{{ 'enterprise.shelf_code' | translate }}</label>
          <div class="p-inputgroup">
            <span class="p-inputgroup-addon bg-primary-50"><i class="pi pi-key text-primary"></i></span>
            <input pInputText id="code" [(ngModel)]="location.shelfCode" 
                   [placeholder]="'A-01-L1-01'" class="p-inputtext-lg border-round-right-xl" />
          </div>
          <small class="text-secondary opacity-70 mt-1 block">Bu kod otomatik oluşturulur veya manuel düzenlenebilir.</small>
        </div>
      </div>
      <ng-template pTemplate="footer">
        <div class="flex justify-content-end gap-2 pb-2">
          <button pButton [label]="'common.cancel' | translate" 
                  icon="pi pi-times" class="p-button-text p-button-secondary border-round-lg" 
                  (click)="displayDialog = false"></button>
          <button pButton [label]="'common.save' | translate" 
                  icon="pi pi-check" class="p-button-primary shadow-soft border-round-lg px-4" 
                  (click)="save()" [loading]="loading"></button>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .glass-panel {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 1rem;
      padding: 2.5rem;
      transition: all 0.3s ease;
    }
    :host-context(.my-app-dark) .glass-panel {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
    }
    .table-card {
      background: rgba(255, 255, 255, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    :host-context(.my-app-dark) .table-card {
      background: rgba(30, 41, 59, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .hover-row:hover {
      background: rgba(var(--primary-color-rgb), 0.03) !important;
      transform: translateX(4px);
    }
    :host-context(.my-app-dark) .text-900 {
      color: #f8fafc !important;
    }
    :host-context(.my-app-dark) .text-secondary {
      color: #94a3b8 !important;
    }
    :host-context(.my-app-dark) .bg-surface-100 {
      background: rgba(255, 255, 255, 0.1) !important;
      color: #3b82f6 !important;
    }
  `]
})
export class LocationsComponent implements OnInit {
  locations: StorageLocation[] = [];
  warehouses: Warehouse[] = [];
  displayDialog: boolean = false;
  location: StorageLocation = { id: 0, name: '', warehouseId: 0, type: LocationType.Internal };
  isEdit: boolean = false;
  loading: boolean = false;

  typeOptions = [
    { label: 'Dahili (Internal)', value: LocationType.Internal },
    { label: 'Hurda (Scrap)', value: LocationType.Scrap },
    { label: 'Transit', value: LocationType.Transit }
  ];

  warehouseService = inject(WarehouseService);
  authService = inject(AuthService);
  langService = inject(LanguageService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);
  cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.warehouseService.getWarehouses().subscribe((whs: Warehouse[]) => this.warehouses = whs);
    this.warehouseService.getLocations().subscribe({
      next: (data: StorageLocation[]) => {
        this.locations = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load locations' });
        this.loading = false;
      }
    });
  }

  autoGenCode() {
    const parts = [
      this.location.aisle,
      this.location.rack,
      this.location.level,
      this.location.position
    ].filter(p => !!p);
    
    if (parts.length > 0) {
      this.location.shelfCode = parts.join('-');
    }
  }

  getTypeLabel(type: LocationType) {
    switch (type) {
      case LocationType.Internal: return 'Internal';
      case LocationType.Scrap: return 'Scrap';
      case LocationType.Transit: return 'Transit';
      default: return 'Other';
    }
  }

  getTypeSeverity(type: LocationType) {
    switch (type) {
      case LocationType.Internal: return 'success';
      case LocationType.Scrap: return 'danger';
      case LocationType.Transit: return 'warn';
      default: return 'info';
    }
  }

  showDialogToAdd() {
    this.isEdit = false;
    this.location = { id: 0, name: '', warehouseId: this.warehouses[0]?.id || 0, type: LocationType.Internal };
    this.displayDialog = true;
  }

  editLocation(loc: StorageLocation) {
    this.isEdit = true;
    this.location = { ...loc };
    this.displayDialog = true;
  }

  deleteLocation(loc: StorageLocation) {
    this.confirmationService.confirm({
      header: this.langService.translate('common.confirm_delete_title'),
      message: this.langService.translate('common.confirm_delete_msg'),
      accept: () => {
        this.warehouseService.deleteLocation(loc.id).subscribe({
          next: () => {
            this.locations = this.locations.filter(l => l.id !== loc.id);
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Location deleted' });
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error || 'Delete failed' });
          }
        });
      }
    });
  }

  save() {
    if (!this.location.name || !this.location.warehouseId) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please fill name and warehouse' });
      return;
    }

    this.loading = true;
    if (this.isEdit) {
      this.warehouseService.updateLocation(this.location.id, this.location).subscribe({
        next: () => {
          this.loadData();
          this.displayDialog = false;
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Location updated' });
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error || 'Update failed' });
          this.loading = false;
        }
      });
    } else {
      this.warehouseService.createLocation(this.location).subscribe({
        next: () => {
          this.loadData();
          this.displayDialog = false;
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Location created' });
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error || 'Create failed' });
          this.loading = false;
        }
      });
    }
  }
}

import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WarehouseService } from '../../services/warehouse.service';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { Warehouse } from '../../models/warehouse.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-warehouses',
  standalone: true,
  imports: [
    CommonModule, 
    TableModule, 
    ButtonModule, 
    DialogModule, 
    InputTextModule, 
    TextareaModule, 
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
          <h1 class="text-3xl font-bold text-900 m-0 tracking-tight">{{ 'enterprise.warehouses' | translate }}</h1>
          <p class="text-secondary m-0 mt-2 font-medium">{{ 'enterprise.storage' | translate }}</p>
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
        <p-table [value]="warehouses" [responsiveLayout]="'scroll'" [loading]="loading"
                 styleClass="p-datatable-gridlines p-datatable-striped"
                 [rows]="10" [paginator]="warehouses.length > 0">
          <ng-template pTemplate="header">
            <tr class="bg-faded py-3">
              <th class="px-4 py-3">{{ 'enterprise.warehouse_code' | translate }}</th>
              <th class="px-4 py-3">{{ 'enterprise.warehouse_name' | translate }}</th>
              <th class="px-4 py-3">{{ 'categories.description' | translate }}</th>
              <th class="px-4 py-3 text-center" *ngIf="authService.isAdmin()" style="width: 150px;">{{ 'common.actions' | translate }}</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-wh>
            <tr class="hover-row transition-all duration-200">
              <td class="px-4 py-3">
                <span class="font-bold text-primary">{{ wh.code }}</span>
              </td>
              <td class="px-4 py-3 font-semibold text-900">{{ wh.name }}</td>
              <td class="px-4 py-3 text-secondary italic">{{ wh.address || '-' }}</td>
              <td class="px-4 py-3 text-center" *ngIf="authService.isAdmin()">
                <div class="flex justify-content-center gap-2">
                  <button pButton pRipple icon="pi pi-pencil" 
                          class="p-button-rounded p-button-text p-button-info shadow-hover-soft" 
                          (click)="editWarehouse(wh)" [pTooltip]="'common.edit' | translate"></button>
                  <button pButton pRipple icon="pi pi-trash" 
                          class="p-button-rounded p-button-text p-button-danger shadow-hover-soft" 
                          (click)="deleteWarehouse(wh)" [pTooltip]="'common.delete' | translate"></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="4" class="text-center py-8">
                <div class="flex flex-column align-items-center gap-3">
                  <i class="pi pi-building text-3xl text-300"></i>
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
              [style]="{width: '500px'}" 
              styleClass="glass-dialog p-fluid"
              [draggable]="false" [resizable]="false">
      <div class="flex flex-column gap-4 pt-4">
        <div class="field">
          <label for="code" class="font-bold block mb-2 text-900">{{ 'enterprise.warehouse_code' | translate }}</label>
          <input pInputText id="code" [(ngModel)]="warehouse.code" 
                 [placeholder]="'WH-001'" class="p-inputtext-lg border-round-xl" />
        </div>
        <div class="field">
          <label for="name" class="font-bold block mb-2 text-900">{{ 'enterprise.warehouse_name' | translate }}</label>
          <input pInputText id="name" [(ngModel)]="warehouse.name" 
                 [placeholder]="langService.translate('enterprise.warehouse_name')" class="p-inputtext-lg border-round-xl" />
        </div>
        <div class="field">
          <label for="address" class="font-bold block mb-2 text-900">{{ 'categories.description' | translate }}</label>
          <textarea pTextarea id="address" [(ngModel)]="warehouse.address" rows="3" 
                    [placeholder]="langService.translate('categories.description')" class="border-round-xl"></textarea>
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
export class WarehousesComponent implements OnInit {
  warehouses: Warehouse[] = [];
  displayDialog: boolean = false;
  warehouse: Warehouse = { id: 0, name: '', code: '', address: '' };
  isEdit: boolean = false;
  loading: boolean = false;

  warehouseService = inject(WarehouseService);
  authService = inject(AuthService);
  langService = inject(LanguageService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);
  cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadWarehouses();
  }

  loadWarehouses() {
    this.loading = true;
    this.warehouseService.getWarehouses().subscribe({
      next: (data: Warehouse[]) => {
        this.warehouses = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load warehouses' });
        this.loading = false;
      }
    });
  }

  showDialogToAdd() {
    this.isEdit = false;
    this.warehouse = { id: 0, name: '', code: '', address: '' };
    this.displayDialog = true;
  }

  editWarehouse(wh: Warehouse) {
    this.isEdit = true;
    this.warehouse = { ...wh };
    this.displayDialog = true;
  }

  deleteWarehouse(wh: Warehouse) {
    this.confirmationService.confirm({
      header: this.langService.translate('common.confirm_delete_title'),
      message: this.langService.translate('common.confirm_delete_msg'),
      accept: () => {
        this.warehouseService.deleteWarehouse(wh.id).subscribe({
          next: () => {
            this.warehouses = this.warehouses.filter(w => w.id !== wh.id);
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Warehouse deleted' });
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error || 'Delete failed' });
          }
        });
      }
    });
  }

  save() {
    if (!this.warehouse.name || !this.warehouse.code) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please fill name and code' });
      return;
    }

    this.loading = true;
    if (this.isEdit) {
      this.warehouseService.updateWarehouse(this.warehouse.id, this.warehouse).subscribe({
        next: () => {
          this.loadWarehouses();
          this.displayDialog = false;
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Warehouse updated' });
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error || 'Update failed' });
          this.loading = false;
        }
      });
    } else {
      this.warehouseService.createWarehouse(this.warehouse).subscribe({
        next: () => {
          this.loadWarehouses();
          this.displayDialog = false;
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Warehouse created' });
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error || 'Create failed' });
          this.loading = false;
        }
      });
    }
  }
}

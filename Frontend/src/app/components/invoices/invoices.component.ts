import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Invoice, InvoiceType, InvoiceStatus } from '../../models/invoice.model';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, DialogModule, InputTextModule, SelectModule, TagModule, FormsModule, ToastModule, TranslatePipe],
  providers: [MessageService],
  template: `
    <div class="p-4">
      <div class="glass-card p-4 border-round-2xl">
        <div class="flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="text-3xl font-bold m-0 text-900 tracking-tight">{{ 'invoices.title' | translate }}</h1>
            <p class="text-secondary m-0 opacity-70">{{ 'invoices.subtitle' | translate }}</p>
          </div>
          <p-button [label]="'invoices.new_invoice' | translate" icon="pi pi-plus" (click)="showDialog()" styleClass="p-button-raised bg-primary border-none shadow-premium"></p-button>
        </div>

        <p-table [value]="invoices" [rows]="10" [paginator]="true" [responsiveLayout]="'scroll'" styleClass="p-datatable-gridlines">
          <ng-template pTemplate="header">
            <tr>
              <th>{{ 'invoices.no' | translate }}</th>
              <th>{{ 'invoices.client' | translate }}</th>
              <th>{{ 'invoices.date' | translate }}</th>
              <th>{{ 'invoices.type' | translate }}</th>
              <th>{{ 'invoices.status' | translate }}</th>
              <th>{{ 'invoices.total' | translate }}</th>
              <th>{{ 'common.actions' | translate }}</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-invoice>
            <tr>
              <td class="font-bold">{{invoice.invoiceNumber}}</td>
              <td>{{invoice.customerSupplierName}}</td>
              <td>{{invoice.date | date:'dd.MM.yyyy'}}</td>
              <td>
                <p-tag [value]="invoice.type === 'Purchase' ? ('invoices.purchase' | translate) : ('invoices.sale' | translate)" [severity]="invoice.type === 'Purchase' ? 'info' : 'success'"></p-tag>
              </td>
              <td>
                <p-tag [value]="getStatusText(invoice.status)" [severity]="getStatusSeverity(invoice.status)"></p-tag>
              </td>
              <td class="font-bold text-primary">{{invoice.totalAmount | currency:'TRY':'symbol':'1.2-2'}}</td>
              <td>
                <div class="flex gap-2">
                  <p-button icon="pi pi-eye" styleClass="p-button-rounded p-button-text"></p-button>
                  <p-button icon="pi pi-trash" styleClass="p-button-rounded p-button-text p-button-danger"></p-button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog [(visible)]="displayDialog" [header]="'invoices.create_title' | translate" [modal]="true" [style]="{width: '50vw'}" [draggable]="false" [resizable]="false">
      <div class="flex flex-column gap-3 mt-2">
        <div class="grid">
          <div class="col-6">
            <label class="block font-bold mb-2">{{ 'invoices.no' | translate }}</label>
            <input pInputText [(ngModel)]="newInvoice.invoiceNumber" class="w-full" placeholder="Örn: FAT2024001" />
          </div>
          <div class="col-6">
            <label class="block font-bold mb-2">{{ 'invoices.client' | translate }}</label>
            <input pInputText [(ngModel)]="newInvoice.customerSupplierName" class="w-full" placeholder="Müşteri veya Tedarikçi" />
          </div>
          <div class="col-6">
            <label class="block font-bold mb-2">{{ 'invoices.type' | translate }}</label>
            <p-select [options]="typeOptions" [(ngModel)]="newInvoice.type" optionLabel="label" optionValue="value" styleClass="w-full"></p-select>
          </div>
          <div class="col-6">
            <label class="block font-bold mb-2">{{ 'invoices.total' | translate }}</label>
            <input pInputText type="number" [(ngModel)]="newInvoice.totalAmount" class="w-full" />
          </div>
        </div>
      </div>
      <ng-template pTemplate="footer">
        <p-button [label]="'common.cancel' | translate" icon="pi pi-times" (click)="displayDialog=false" styleClass="p-button-text"></p-button>
        <p-button [label]="'common.save' | translate" icon="pi pi-check" (click)="saveInvoice()" styleClass="bg-primary border-none shadow-premium"></p-button>
      </ng-template>
    </p-dialog>
    <p-toast></p-toast>
  `,
  styles: [`
    :host ::ng-deep .p-datatable {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class InvoicesComponent implements OnInit {
  private http = inject(HttpClient);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);
  private apiUrl = 'http://localhost:5162/api/invoices';

  invoices: Invoice[] = [];
  displayDialog = false;
  loading = false;
  newInvoice: Partial<Invoice> = {
    type: InvoiceType.Purchase,
    status: InvoiceStatus.Draft,
    date: new Date()
  };

  typeOptions = [
    { label: 'Alış', value: InvoiceType.Purchase },
    { label: 'Satış', value: InvoiceType.Sale }
  ];

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.loading = true;
    console.log('Faturalar yükleniyor...');
    this.http.get<Invoice[]>(this.apiUrl).subscribe({
      next: (data) => {
        console.log('Faturalar geldi:', data);
        this.invoices = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Fatura yükleme hatası:', err);
        this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Faturalar yüklenemedi.' });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  showDialog() {
    this.newInvoice = {
      type: InvoiceType.Purchase,
      status: InvoiceStatus.Draft,
      date: new Date(),
      items: []
    };
    this.displayDialog = true;
  }

  saveInvoice() {
    if (!this.newInvoice.invoiceNumber || !this.newInvoice.customerSupplierName) {
      this.messageService.add({ severity: 'warn', summary: 'Uyarı', detail: 'Lütfen zorunlu alanları doldurun.' });
      return;
    }

    this.loading = true;
    this.http.post(this.apiUrl, this.newInvoice).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'Fatura başarıyla oluşturuldu.' });
        this.displayDialog = false;
        this.loadInvoices();
      },
      error: (err) => {
        console.error('Fatura kaydetme hatası:', err);
        this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Fatura oluşturulamadı.' });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStatusText(status: InvoiceStatus): string {
    switch(status) {
      case InvoiceStatus.Draft: return 'Taslak';
      case InvoiceStatus.Pending: return 'Beklemede';
      case InvoiceStatus.Paid: return 'Ödendi';
      case InvoiceStatus.Cancelled: return 'İptal';
      default: return status;
    }
  }

  getStatusSeverity(status: InvoiceStatus): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    switch(status) {
      case InvoiceStatus.Draft: return 'secondary';
      case InvoiceStatus.Pending: return 'warn';
      case InvoiceStatus.Paid: return 'success';
      case InvoiceStatus.Cancelled: return 'danger';
      default: return 'info';
    }
  }
}

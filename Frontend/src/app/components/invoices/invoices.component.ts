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
import { FileUploadModule } from 'primeng/fileupload';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, DialogModule, InputTextModule, SelectModule, TagModule, FormsModule, ToastModule, TranslatePipe, FileUploadModule, TooltipModule],
  providers: [MessageService, TranslatePipe],
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
              <th>{{ 'invoices.upload_doc' | translate }}</th>
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
                <div class="flex gap-2 align-items-center">
                  <p-button *ngIf="invoice.documentUrl" icon="pi pi-file-pdf" (click)="viewDocument(invoice.documentUrl)" 
                            [pTooltip]="'invoices.view_doc' | translate" styleClass="p-button-rounded p-button-text p-button-info"></p-button>
                  <p-fileUpload *ngIf="!invoice.documentUrl" mode="basic" name="file" [url]="apiUrl + '/' + invoice.id + '/upload'" 
                                accept="application/pdf,image/*" [maxFileSize]="5000000" 
                                (onUpload)="onUpload($event)" [auto]="true" 
                                [chooseLabel]="'invoices.upload_doc' | translate" styleClass="p-button-sm p-button-outlined"></p-fileUpload>
                </div>
              </td>
              <td>
                <div class="flex gap-2">
                  <p-button icon="pi pi-eye" styleClass="p-button-rounded p-button-text" (click)="viewDetails(invoice)" [pTooltip]="'common.view_all' | translate"></p-button>
                  <p-button icon="pi pi-pencil" styleClass="p-button-rounded p-button-text p-button-warn" (click)="editInvoice(invoice)" [pTooltip]="'common.edit' | translate"></p-button>
                  <p-button icon="pi pi-trash" styleClass="p-button-rounded p-button-text p-button-danger" [pTooltip]="'common.delete' | translate"></p-button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog [(visible)]="displayDialog" [header]="(isEditMode ? 'invoices.edit_title' : 'invoices.create_title') | translate" [modal]="true" [style]="{width: '50vw'}" [draggable]="false" [resizable]="false">
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
          <div class="col-6">
            <label class="block font-bold mb-2">{{ 'invoices.status' | translate }}</label>
            <p-select [options]="statusOptions" [(ngModel)]="newInvoice.status" optionLabel="label" optionValue="value" styleClass="w-full"></p-select>
          </div>
          <div class="col-12">
            <label class="block font-bold mb-2">{{ 'invoices.upload_doc' | translate }}</label>
            <p-fileUpload #fubauto mode="basic" name="file" accept="application/pdf,image/*" [maxFileSize]="5000000" 
                          (onSelect)="onFileSelect($event)" [chooseLabel]="'invoices.upload_doc' | translate" 
                          styleClass="p-button-outlined w-full"></p-fileUpload>
            <div *ngIf="selectedFile" class="mt-2 text-sm text-primary flex align-items-center gap-2">
              <i class="pi pi-file"></i> {{selectedFile.name}}
              <p-button icon="pi pi-times" styleClass="p-button-rounded p-button-text p-button-danger p-button-sm" (click)="selectedFile = null"></p-button>
            </div>
          </div>
        </div>
      </div>
      <ng-template pTemplate="footer">
        <p-button [label]="'common.cancel' | translate" icon="pi pi-times" (click)="displayDialog=false" styleClass="p-button-text"></p-button>
        <p-button [label]="'common.save' | translate" icon="pi pi-check" (click)="saveInvoice()" styleClass="bg-primary border-none shadow-premium"></p-button>
      </ng-template>
    </p-dialog>
    
    <p-dialog [(visible)]="displayDetailsDialog" [header]="'invoices.details_title' | translate" [modal]="true" [style]="{width: '40vw'}" [draggable]="false" [resizable]="false">
      <div *ngIf="selectedInvoice" class="flex flex-column gap-4 py-2">
        <div class="flex justify-content-between align-items-center pb-3 border-bottom-1 surface-border">
          <div>
            <span class="text-secondary text-sm block mb-1">{{ 'invoices.no' | translate }}</span>
            <span class="text-xl font-bold">{{selectedInvoice.invoiceNumber}}</span>
          </div>
          <p-tag [value]="getStatusText(selectedInvoice.status)" [severity]="getStatusSeverity(selectedInvoice.status)"></p-tag>
        </div>
        
        <div class="grid">
          <div class="col-6">
            <span class="text-secondary text-sm block mb-1">{{ 'invoices.client' | translate }}</span>
            <span class="font-semibold">{{selectedInvoice.customerSupplierName}}</span>
          </div>
          <div class="col-6">
            <span class="text-secondary text-sm block mb-1">{{ 'invoices.date' | translate }}</span>
            <span class="font-semibold">{{selectedInvoice.date | date:'dd MMMM yyyy'}}</span>
          </div>
          <div class="col-6">
            <span class="text-secondary text-sm block mb-1">{{ 'invoices.type' | translate }}</span>
            <span class="font-semibold">{{selectedInvoice.type === 'Purchase' ? ('invoices.purchase' | translate) : ('invoices.sale' | translate)}}</span>
          </div>
          <div class="col-6">
            <span class="text-secondary text-sm block mb-1">{{ 'invoices.total' | translate }}</span>
            <span class="text-xl font-bold text-primary">{{selectedInvoice.totalAmount | currency:'TRY':'symbol':'1.2-2'}}</span>
          </div>
        </div>

        <div *ngIf="selectedInvoice.documentUrl" class="surface-ground p-3 border-round-xl flex align-items-center justify-content-between">
          <div class="flex align-items-center gap-3">
            <i class="pi pi-file-pdf text-2xl text-red-500"></i>
            <div>
              <span class="block font-medium">{{ 'invoices.view_doc' | translate }}</span>
              <span class="text-xs text-secondary italic">invoice_document.pdf</span>
            </div>
          </div>
          <p-button icon="pi pi-external-link" (click)="viewDocument(selectedInvoice.documentUrl)" styleClass="p-button-rounded p-button-text"></p-button>
        </div>
      </div>
      <ng-template pTemplate="footer">
        <p-button [label]="'common.close' | translate" icon="pi pi-times" (click)="displayDetailsDialog=false" styleClass="p-button-text"></p-button>
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
  apiUrl = 'http://localhost:5162/api/invoices';

  invoices: Invoice[] = [];
  displayDialog = false;
  loading = false;
  newInvoice: Partial<Invoice> = {
    type: InvoiceType.Purchase,
    status: InvoiceStatus.Draft,
    date: new Date()
  };
  selectedFile: File | null = null;
  displayDetailsDialog = false;
  selectedInvoice: Invoice | null = null;
  isEditMode = false;

  typeOptions = [
    { label: 'Alış', value: InvoiceType.Purchase },
    { label: 'Satış', value: InvoiceType.Sale }
  ];

  statusOptions = [
    { label: 'Taslak', value: InvoiceStatus.Draft },
    { label: 'Faturalanmadı', value: InvoiceStatus.NotInvoiced },
    { label: 'Faturalandı', value: InvoiceStatus.Invoiced },
    { label: 'Ödendi', value: InvoiceStatus.Paid },
    { label: 'İptal', value: InvoiceStatus.Cancelled }
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
    this.isEditMode = false;
    this.newInvoice = {
      type: InvoiceType.Purchase,
      status: InvoiceStatus.Draft,
      date: new Date(),
      items: []
    };
    this.selectedFile = null;
    this.displayDialog = true;
  }

  editInvoice(invoice: Invoice) {
    this.isEditMode = true;
    this.newInvoice = { ...invoice, date: new Date(invoice.date) };
    this.selectedFile = null;
    this.displayDialog = true;
  }

  saveInvoice() {
    if (!this.newInvoice.invoiceNumber || !this.newInvoice.customerSupplierName) {
      this.messageService.add({ severity: 'warn', summary: 'Uyarı', detail: 'Lütfen zorunlu alanları doldurun.' });
      return;
    }

    this.loading = true;
    
    if (this.isEditMode && this.newInvoice.id) {
      this.http.put(`${this.apiUrl}/${this.newInvoice.id}`, this.newInvoice).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'Fatura başarıyla güncellendi.' });
          this.displayDialog = false;
          this.loadInvoices();
        },
        error: (err) => {
          console.error('Fatura güncelleme hatası:', err);
          this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Fatura güncellenemedi.' });
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.http.post<Invoice>(this.apiUrl, this.newInvoice).subscribe({
        next: (created) => {
          if (this.selectedFile) {
            this.uploadFileAfterCreate(created.id!, this.selectedFile);
          } else {
            this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'Fatura başarıyla oluşturuldu.' });
            this.displayDialog = false;
            this.loadInvoices();
          }
        },
        error: (err) => {
          console.error('Fatura kaydetme hatası:', err);
          this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Fatura oluşturulamadı.' });
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  onFileSelect(event: any) {
    this.selectedFile = event.files[0];
  }

  uploadFileAfterCreate(id: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    this.http.post(`${this.apiUrl}/${id}/upload`, formData).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'Fatura ve belge kaydedildi.' });
        this.displayDialog = false;
        this.loadInvoices();
      },
      error: () => {
        this.messageService.add({ severity: 'warn', summary: 'Kısmi Başarı', detail: 'Fatura oluşturuldu ancak belge yüklenemedi.' });
        this.displayDialog = false;
        this.loadInvoices();
      }
    });
  }

  getStatusText(status: InvoiceStatus): string {
    const key = `invoices.status_${status.toLowerCase()}`;
    return this.translatePipe.transform(key);
  }

  getStatusSeverity(status: InvoiceStatus): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    switch(status) {
      case InvoiceStatus.Draft: return 'secondary';
      case InvoiceStatus.NotInvoiced: return 'warn';
      case InvoiceStatus.Invoiced: return 'info';
      case InvoiceStatus.Paid: return 'success';
      case InvoiceStatus.Cancelled: return 'danger';
      default: return 'info';
    }
  }

  private translatePipe = inject(TranslatePipe);

  onUpload(event: any) {
    this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'Belge yüklendi.' });
    this.loadInvoices();
  }

  viewDocument(url: string) {
    window.open(`http://localhost:5162${url}`, '_blank');
  }

  viewDetails(invoice: Invoice) {
    this.selectedInvoice = invoice;
    this.displayDetailsDialog = true;
    this.cdr.detectChanges();
  }
}

import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../services/auth.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';

interface UserDto {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  language: string;
  themeColor: string;
  isDarkMode: boolean;
  isApproved: boolean;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, TagModule,
    DialogModule, InputTextModule, PasswordModule, SelectModule,
    MessageModule, TooltipModule, ConfirmDialogModule, ToastModule, TranslatePipe
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="users-page">
      <!-- Sayfa Başlığı -->
      <div class="page-header flex flex-column md:flex-row md:align-items-center justify-content-between mb-5 gap-3">
        <div>
          <h1 class="text-3xl font-bold text-900 m-0 tracking-tight">{{ 'users.title' | translate }}</h1>
          <p class="text-secondary m-0 mt-1 opacity-70">{{ 'users.subtitle' | translate }}</p>
        </div>
        <div class="flex gap-2">
            <p-button 
              [label]="showPending ? 'Tüm Kullanıcılar' : 'Kayıt Onayları'" 
              [icon]="showPending ? 'pi pi-users' : 'pi pi-user-plus'" 
              [badge]="pendingUsers.length > 0 ? pendingUsers.length.toString() : ''"
              [badgeSeverity]="'danger'"
              (onClick)="toggleView()"
              [styleClass]="showPending ? 'p-button-outlined' : 'p-button-warning'">
            </p-button>
            <p-button 
              [label]="'users.new_user' | translate" 
              icon="pi pi-plus" 
              (onClick)="openCreateDialog()"
              styleClass="p-button-raised bg-primary border-none">
            </p-button>
        </div>
      </div>

      <!-- İstatistik Kartları -->
      <div class="grid mb-5" *ngIf="!showPending">
        <div class="col-12 md:col-4">
          <div class="stat-card p-4 border-round-2xl">
            <div class="flex align-items-center gap-3">
              <div class="stat-icon admin-icon shadow-soft">
                <i class="pi pi-shield"></i>
              </div>
              <div>
                <p class="text-secondary text-sm font-bold uppercase tracking-wider m-0 opacity-60">{{ 'users.admin_count' | translate }}</p>
                <p class="text-3xl font-bold text-900 m-0">{{ adminCount }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 md:col-4">
          <div class="stat-card p-4 border-round-2xl">
            <div class="flex align-items-center gap-3">
              <div class="stat-icon user-icon shadow-soft">
                <i class="pi pi-users"></i>
              </div>
              <div>
                <p class="text-secondary text-sm font-bold uppercase tracking-wider m-0 opacity-60">{{ 'users.staff_count' | translate }}</p>
                <p class="text-3xl font-bold text-900 m-0">{{ userCount }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 md:col-4">
          <div class="stat-card p-4 border-round-2xl">
            <div class="flex align-items-center gap-3">
              <div class="stat-icon pending-icon shadow-soft">
                <i class="pi pi-user-plus"></i>
              </div>
              <div>
                <p class="text-secondary text-sm font-bold uppercase tracking-wider m-0 opacity-60">Onay Bekleyen</p>
                <p class="text-3xl font-bold text-900 m-0">{{ pendingUsers.length }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Kayıt Onayları Tablosu -->
      <div class="glass-card border-round-2xl overflow-hidden p-0 mb-5" *ngIf="showPending">
        <div class="p-4 border-bottom-1 border-soft flex justify-content-between align-items-center bg-orange-50-alpha">
            <h2 class="text-xl font-bold m-0 text-orange-700 flex align-items-center gap-2">
                <i class="pi pi-user-plus"></i> Bekleyen Kayıt Talepleri
            </h2>
            <p class="m-0 text-orange-600 text-sm font-medium">Bu kullanıcılar sistem onayınızdan sonra giriş yapabilir.</p>
        </div>
        <p-table [value]="pendingUsers" styleClass="modern-table" [loading]="loading">
          <ng-template pTemplate="header">
            <tr>
              <th>Ad Soyad</th>
              <th>Kullanıcı Adı</th>
              <th>E-posta</th>
              <th class="text-center">İşlemler</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-u>
            <tr>
              <td><span class="font-bold text-900">{{u.fullName}}</span></td>
              <td><code>{{u.username}}</code></td>
              <td>{{u.email}}</td>
              <td class="text-center">
                <div class="flex justify-content-center gap-2">
                  <p-button icon="pi pi-check" severity="success" [rounded]="true" [text]="true" pTooltip="Onayla" (onClick)="approveUser(u)"></p-button>
                  <p-button icon="pi pi-times" severity="danger" [rounded]="true" [text]="true" pTooltip="Reddet" (onClick)="rejectUser(u)"></p-button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="4" class="text-center py-5 text-secondary">
                <i class="pi pi-check-circle text-3xl mb-2 text-green-500"></i>
                <p class="m-0">Şu an onay bekleyen herhangi bir kayıt talebi bulunmuyor.</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Mevcut Kullanıcılar Tablosu -->
      <div class="glass-card border-round-2xl overflow-hidden p-0" *ngIf="!showPending">
        <p-table 
          [value]="users" 
          [loading]="loading"
          [paginator]="users.length > 10"
          [rows]="10"
          styleClass="modern-table"
          [globalFilterFields]="['username', 'fullName', 'email', 'role']">
          
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 50px;">#</th>
              <th pSortableColumn="fullName">{{ 'users.full_name' | translate }} <p-sortIcon field="fullName"></p-sortIcon></th>
              <th pSortableColumn="username">{{ 'users.username' | translate }} <p-sortIcon field="username"></p-sortIcon></th>
              <th>{{ 'users.email' | translate }}</th>
              <th pSortableColumn="role">{{ 'users.role' | translate }} <p-sortIcon field="role"></p-sortIcon></th>
              <th style="width: 150px;" class="text-center">{{ 'common.actions' | translate }}</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-user let-i="rowIndex">
            <tr [class.current-user-row]="isCurrentUser(user.id)">
              <td class="text-dim">{{ i + 1 }}</td>
              <td>
                <div class="flex align-items-center gap-3">
                  <div class="user-avatar-premium" [style.background]="user.themeColor || '#3B82F6'">
                    {{ user.fullName?.charAt(0) }}
                  </div>
                  <div class="flex flex-column">
                    <span class="font-bold text-900">{{ user.fullName }}</span>
                    @if (isCurrentUser(user.id)) {
                      <span class="text-xs text-primary font-bold">(Oturum Açık)</span>
                    }
                  </div>
                </div>
              </td>
              <td>
                <code class="username-badge">{{ user.username }}</code>
              </td>
              <td class="text-secondary">{{ user.email || '—' }}</td>
              <td>
                <p-tag 
                  [value]="user.role === 'Admin' ? ('header.admin_tag' | translate) : ('header.user_tag' | translate)"
                  [severity]="user.role === 'Admin' ? 'danger' : 'info'"
                  [style]="{borderRadius: '8px', padding: '4px 12px'}">
                </p-tag>
              </td>
              <td class="text-center">
                <div class="flex align-items-center justify-content-center gap-1">
                  <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="info" pTooltip="Düzenle" (onClick)="openEditDialog(user)"></p-button>
                  <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" pTooltip="Sil" [disabled]="isCurrentUser(user.id)" (onClick)="confirmDelete(user)"></p-button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- User Edit Dialog -->
    <p-dialog 
      [(visible)]="dialogVisible" 
      [header]="(editMode ? 'users.edit_title' : 'users.new_user') | translate"
      [modal]="true" 
      [style]="{width: '480px'}"
      [draggable]="false"
      styleClass="glass-dialog">
      
      <div class="flex flex-column gap-4 pt-4">
        <div class="field">
          <label class="label-modern mb-2 block">Ad Soyad <span class="text-red-500">*</span></label>
          <div class="input-modern-wrapper">
              <i class="pi pi-user"></i>
              <input pInputText [(ngModel)]="form.fullName" class="w-full" placeholder="Ad ve soyad" [disabled]="isRestrictedEdit()" />
          </div>
        </div>

        @if (!editMode) {
          <div class="field">
            <label class="label-modern mb-2 block">Kullanıcı Adı <span class="text-red-500">*</span></label>
            <div class="input-modern-wrapper">
                <i class="pi pi-at"></i>
                <input pInputText [(ngModel)]="form.username" class="w-full" placeholder="Benzersiz kullanıcı adı" />
            </div>
          </div>
        }

        <div class="field">
          <label class="label-modern mb-2 block">E-posta</label>
          <div class="input-modern-wrapper">
                <i class="pi pi-envelope"></i>
                <input pInputText [(ngModel)]="form.email" type="email" class="w-full" placeholder="ornek@email.com" [disabled]="isRestrictedEdit()" />
          </div>
        </div>

        <div class="field">
          <label class="label-modern mb-2 block">Rol <span class="text-red-500">*</span></label>
          <p-select 
            [(ngModel)]="form.role" 
            [options]="roleOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full modern-select"
            styleClass="w-full"
            [disabled]="isRestrictedEdit()">
          </p-select>
          @if (isRestrictedEdit()) {
            <small class="text-red-500 font-bold block mt-1">Eş düzey veya üst düzey yetkiliyi düzenleme izniniz yok.</small>
          }
        </div>

        <div class="field">
          <label class="label-modern mb-2 block">
            {{ editMode ? 'Yeni Şifre (opsiyonel)' : 'Şifre' }}
            @if (!editMode) { <span class="text-red-500">*</span> }
          </label>
          <p-password 
            [(ngModel)]="form.password" 
            [feedback]="!editMode"
            [toggleMask]="true"
            styleClass="w-full"
            inputStyleClass="w-full"
            [disabled]="isRestrictedEdit()"
            [placeholder]="editMode ? 'Değiştirmek istemiyorsanız boş bırakın' : 'En az 6 karakter'">
          </p-password>
        </div>

        @if (dialogError) {
          <p-message severity="error" [text]="dialogError" styleClass="w-full"></p-message>
        }
      </div>

      <ng-template pTemplate="footer">
        <p-button [label]="'common.cancel' | translate" icon="pi pi-times" [text]="true" (onClick)="closeDialog()" styleClass="p-button-secondary"></p-button>
        <p-button 
          [label]="(editMode ? 'common.save' : 'common.add_new') | translate" 
          [icon]="editMode ? 'pi pi-check' : 'pi pi-plus'" 
          [loading]="saving"
          [disabled]="isRestrictedEdit()"
          (onClick)="saveUser()"
          styleClass="bg-primary border-none px-4">
        </p-button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .stat-card {
        background: var(--bg-card);
        border: 1px solid var(--border-soft);
        box-shadow: var(--shadow-premium);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .stat-card:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-xl);
    }

    .stat-icon {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
    }

    .admin-icon { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    .user-icon { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .pending-icon { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

    .user-avatar-premium {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 800;
        font-size: 1.1rem;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }

    .username-badge {
        background: var(--primary-glow);
        padding: 4px 10px;
        border-radius: 8px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.85rem;
        color: var(--text-muted);
    }

    .bg-orange-50-alpha {
        background: rgba(245, 158, 11, 0.05);
    }

    .label-modern {
        color: var(--text-muted);
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .input-modern-wrapper {
        position: relative;
        display: flex;
        align-items: center;
    }

    .input-modern-wrapper i {
        position: absolute;
        left: 1rem;
        color: var(--text-dim);
        z-index: 1;
    }

    .input-modern-wrapper input {
        padding-left: 2.75rem !important;
        border-radius: 10px !important;
        background: var(--bg-main) !important;
        color: var(--text-main) !important;
        border-color: var(--border-soft) !important;
    }

    :host ::ng-deep .modern-table.p-datatable .p-datatable-thead > tr > th {
        background: var(--bg-card);
        color: var(--text-muted);
        padding: 1.25rem 1rem;
    }

    :host ::ng-deep .p-confirm-dialog .p-dialog-content {
        padding-top: 1rem;
    }
  `]
})
export class UsersComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  private apiUrl = 'http://localhost:5162/api/users';

  users: UserDto[] = [];
  pendingUsers: UserDto[] = [];
  loading = false;
  showPending = false;
  
  dialogVisible = false;
  editMode = false;
  saving = false;
  dialogError = '';
  selectedUserId: number | null = null;
  selectedUserRole: string | null = null;

  form = {
    username: '',
    fullName: '',
    email: '',
    role: 'User',
    password: ''
  };

  roleOptions = [
    { label: '👤 Personel (User)', value: 'User' },
    { label: '🔐 Yönetici (Admin)', value: 'Admin' }
  ];

  get adminCount() { return this.users.filter(u => u.role === 'Admin').length; }
  get userCount() { return this.users.filter(u => u.role === 'User').length; }

  isCurrentUser(id: number): boolean {
    return this.authService.currentUser()?.id === id;
  }

  isRestrictedEdit(): boolean {
      if (!this.editMode || !this.selectedUserId) return false;
      const currentUser = this.authService.currentUser();
      if (!currentUser) return true;
      
      const currentRole = currentUser.role?.toString();
      const targetRole = this.selectedUserRole?.toString();

      // SuperAdmin (0) has no restrictions
      if (currentRole === 'SuperAdmin' || currentRole === '0') return false;
      
      // Admin (1) cannot edit another Admin (1) or SuperAdmin (0)
      if (currentRole === 'Admin' || currentRole === '1') {
          if (targetRole === 'Admin' || targetRole === '1' || targetRole === 'SuperAdmin' || targetRole === '0') {
              return true;
          }
      }
      return false;
  }

  ngOnInit() {
    this.loadUsers();
    this.loadPendingUsers();
  }

  toggleView() {
      this.showPending = !this.showPending;
      if (this.showPending) {
          this.loadPendingUsers();
      } else {
          this.loadUsers();
      }
  }

  loadUsers() {
    this.loading = true;
    this.http.get<UserDto[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadPendingUsers() {
      this.authService.getPendingUsers().subscribe({
          next: (data: any) => {
              this.pendingUsers = data;
              this.cdr.detectChanges();
          }
      });
  }

  approveUser(user: UserDto) {
      this.authService.approveUser(user.id).subscribe({
          next: () => {
              this.messageService.add({ severity: 'success', summary: 'Onaylandı', detail: `${user.fullName} artık sisteme giriş yapabilir.` });
              this.loadPendingUsers();
              this.loadUsers();
          }
      });
  }

  rejectUser(user: UserDto) {
      this.confirmationService.confirm({
          header: 'Kayıt Talebini Reddet',
          message: `${user.fullName} isimli kullanıcının kayıt talebini reddetmek ve silmek istediğinize emin misiniz?`,
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: 'Evet',
          rejectLabel: 'Hayır',
          accept: () => {
              this.authService.rejectUser(user.id).subscribe({
                  next: () => {
                      this.messageService.add({ severity: 'info', summary: 'Reddedildi', detail: 'Kayıt talebi silindi.' });
                      this.loadPendingUsers();
                  }
              });
          }
      });
  }

  openCreateDialog() {
    this.editMode = false;
    this.selectedUserId = null;
    this.selectedUserRole = null;
    this.form = { username: '', fullName: '', email: '', role: 'User', password: '' };
    this.dialogError = '';
    this.dialogVisible = true;
  }

  openEditDialog(user: UserDto) {
    this.editMode = true;
    this.selectedUserId = user.id;
    this.selectedUserRole = user.role;
    this.form = {
      username: user.username,
      fullName: user.fullName,
      email: user.email || '',
      role: user.role,
      password: ''
    };
    this.dialogError = '';
    this.dialogVisible = true;
  }

  closeDialog() {
    this.dialogVisible = false;
  }

  saveUser() {
    this.dialogError = '';
    if (!this.form.fullName.trim()) { this.dialogError = 'Ad Soyad zorunludur.'; return; }
    if (!this.editMode && !this.form.username.trim()) { this.dialogError = 'Kullanıcı adı zorunludur.'; return; }
    if (!this.editMode && !this.form.password) { this.dialogError = 'Şifre zorunludur.'; return; }

    this.saving = true;
    if (this.editMode && this.selectedUserId) {
      const payload: any = { fullName: this.form.fullName, email: this.form.email, role: this.form.role };
      if (this.form.password) { payload.newPassword = this.form.password; }

      this.http.put(`${this.apiUrl}/${this.selectedUserId}`, payload).subscribe({
        next: () => {
          this.saving = false;
          this.dialogVisible = false;
          this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'Kullanıcı güncellendi.' });
          this.loadUsers();
        },
        error: (err) => { 
          this.saving = false; 
          if (err.status === 403) {
              this.dialogError = 'Yetki Hatası: Eş düzey veya üst düzey bir kullanıcıyı düzenleyemezsiniz.';
          } else {
              this.dialogError = typeof err?.error === 'string' ? err.error : (err?.error?.detail || 'Hata oluştu.'); 
          }
          this.cdr.detectChanges();
        }
      });
    } else {
      const payload = { ...this.form };
      this.http.post(this.apiUrl, payload).subscribe({
        next: () => {
          this.saving = false;
          this.dialogVisible = false;
          this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'Yeni kullanıcı oluşturuldu.' });
          this.loadUsers();
        },
        error: (err) => { 
          this.saving = false; 
          this.dialogError = typeof err?.error === 'string' ? err.error : (err?.error?.detail || 'Hata oluştu.');
          this.cdr.detectChanges();
        }
      });
    }
  }

  confirmDelete(user: UserDto) {
    this.confirmationService.confirm({
      header: 'Kullanıcıyı Sil',
      message: 'Bu kullanıcıyı silmek istediğinize emin misiniz?',
      acceptLabel: 'Evet',
      rejectLabel: 'Hayır',
      accept: () => {
        this.http.delete(`${this.apiUrl}/${user.id}`).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'Kullanıcı silindi.' });
            this.loadUsers();
          },
          error: (err) => {
              const msg = err.status === 403 ? 'Yetki Hatası: Bu kullanıcıyı silme izniniz yok.' : 'Hata oluştu.';
              this.messageService.add({ severity: 'error', summary: 'Hata', detail: msg });
          }
        });
      }
    });
  }
}

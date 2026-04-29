import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { User } from '../../models/user.model';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, InputTextModule, ButtonModule, ToastModule, TranslatePipe],
  providers: [MessageService],
  template: `
    <div class="p-4 md:p-6 flex justify-content-center min-h-screen">
      <div class="glass-card w-full xl:w-9 border-round-2xl overflow-hidden">
        
        <div class="p-4 md:p-6 border-bottom-1 border-soft">
            <h1 class="text-3xl font-bold m-0 text-900 tracking-tight">{{ 'nav.profile' | translate }}</h1>
            <p class="text-secondary m-0 mt-1 opacity-70">{{ 'profile.subtitle' | translate }}</p>
        </div>

        @if (user) {
          <div class="grid p-0 m-0">
            <!-- Sidebar / Avatar Section -->
            <div class="col-12 lg:col-4 flex flex-column align-items-center p-6 bg-content-subtle border-right-1 border-soft">
              <div class="avatar-wrapper relative mb-5">
                <div class="avatar-inner w-10rem h-10rem bg-primary-gradient border-circle flex align-items-center justify-content-center text-5xl text-white font-bold shadow-premium overflow-hidden">
                  @if (user.avatarUrl) {
                    <img [src]="user.avatarUrl" class="w-full h-full object-cover" />
                  } @else {
                    {{ user.fullName.charAt(0) }}
                  }
                </div>
                <div class="flex gap-2 absolute bottom-0 right-0">
                    <button (click)="fileInput.click()" class="avatar-edit-btn w-2.5rem h-2.5rem border-circle bg-white border-1 border-soft flex align-items-center justify-content-center shadow-soft cursor-pointer hover:scale-110 transition-all">
                        <i class="pi pi-camera text-primary"></i>
                    </button>
                    @if (user.avatarUrl) {
                        <button (click)="deleteAvatar()" class="avatar-edit-btn w-2.5rem h-2.5rem border-circle bg-red-500 border-none flex align-items-center justify-content-center shadow-soft cursor-pointer hover:scale-110 transition-all text-white">
                            <i class="pi pi-trash"></i>
                        </button>
                    }
                </div>
                <input type="file" #fileInput class="hidden" accept="image/*" (change)="onFileSelected($event)">
              </div>
              
              <div class="text-center mb-6">
                  <h2 class="text-2xl font-bold m-0 text-900 tracking-tight">{{ user.fullName }}</h2>
                  <div class="flex align-items-center justify-content-center gap-2 mt-2">
                      <span class="role-badge">{{ user.role === 'Admin' ? ('header.admin_tag' | translate) : ('header.user_tag' | translate) }}</span>
                      <span class="text-xs text-dim font-medium uppercase letter-spacing-1">{{ user.username }}</span>
                  </div>
              </div>

              <div class="w-full flex flex-column gap-2">
                  <button class="profile-side-btn" [class.active]="activeTab === 'profile'" (click)="activeTab = 'profile'">
                      <i class="pi pi-user mr-2"></i> {{ 'nav.profile' | translate }}
                  </button>
                  <button class="profile-side-btn" [class.active]="activeTab === 'security'" (click)="activeTab = 'security'">
                      <i class="pi pi-lock mr-2"></i> {{ 'profile.security_tab' | translate }}
                  </button>
                  <button class="profile-side-btn" [class.active]="activeTab === 'notifications'" (click)="activeTab = 'notifications'">
                      <i class="pi pi-bell mr-2"></i> {{ 'profile.notifications_tab' | translate }}
                  </button>
              </div>
            </div>

            <!-- Form Section -->
            <div class="col-12 lg:col-8 p-6">
              @if (activeTab === 'profile') {
                <div class="grid row-gap-5">
                  <div class="col-12">
                      <h3 class="text-lg font-bold text-900 m-0 mb-4 flex align-items-center gap-2">
                          <i class="pi pi-info-circle text-primary"></i> {{ 'profile.general_info' | translate }}
                      </h3>
                  </div>

                  <div class="col-12 md:col-6">
                    <label class="label-modern mb-2 block">{{ 'users.username' | translate }}</label>
                    <div class="input-modern-wrapper disabled">
                        <i class="pi pi-at"></i>
                        <input pInputText [value]="user.username" disabled class="w-full" />
                    </div>
                  </div>

                  <div class="col-12 md:col-6">
                    <label class="label-modern mb-2 block">{{ 'profile.full_name' | translate }}</label>
                    <div class="input-modern-wrapper">
                        <i class="pi pi-user"></i>
                        <input pInputText [(ngModel)]="user.fullName" class="w-full" placeholder="Ad Soyad giriniz" />
                    </div>
                  </div>

                  <div class="col-12">
                    <label class="label-modern mb-2 block">{{ 'users.email' | translate }}</label>
                    <div class="input-modern-wrapper">
                        <i class="pi pi-envelope"></i>
                        <input pInputText [(ngModel)]="user.email" class="w-full" placeholder="e-posta@adresiniz.com" />
                    </div>
                  </div>

                  <div class="col-12 mt-6">
                      <div class="flex flex-column sm:flex-row justify-content-between align-items-center gap-4 p-4 border-round-2xl border-1 border-soft bg-surface-50">
                          <div class="flex align-items-center gap-3">
                              <div class="w-3rem h-3rem bg-teal-50 border-circle flex align-items-center justify-content-center text-teal-600">
                                  <i class="pi pi-sync"></i>
                              </div>
                              <div class="flex flex-column">
                                  <span class="font-bold text-900">{{ 'profile.apply_changes' | translate }}</span>
                                  <span class="text-sm text-secondary opacity-70">{{ 'profile.apply_desc' | translate }}</span>
                              </div>
                          </div>
                          <p-button [label]="'common.save' | translate" icon="pi pi-check" (onClick)="save()" [loading]="loading" styleClass="p-button-raised bg-primary border-none px-6 py-3 shadow-premium font-bold"></p-button>
                      </div>
                  </div>
                </div>
              } @else if (activeTab === 'security') {
                <div class="grid row-gap-5">
                    <div class="col-12">
                        <h3 class="text-lg font-bold text-900 m-0 mb-4 flex align-items-center gap-2">
                            <i class="pi pi-shield text-primary"></i> {{ 'profile.security_settings' | translate }}
                        </h3>
                    </div>

                    <div class="col-12">
                        <label class="label-modern mb-2 block">{{ 'profile.current_password' | translate }}</label>
                        <div class="input-modern-wrapper">
                            <i class="pi pi-lock"></i>
                            <input pInputText type="password" [(ngModel)]="oldPassword" class="w-full" placeholder="••••••••" />
                        </div>
                    </div>

                    <div class="col-12 md:col-6">
                        <label class="label-modern mb-2 block">{{ 'profile.new_password' | translate }}</label>
                        <div class="input-modern-wrapper">
                            <i class="pi pi-key"></i>
                            <input pInputText type="password" [(ngModel)]="newPassword" class="w-full" placeholder="••••••••" />
                        </div>
                    </div>

                    <div class="col-12 md:col-6">
                        <label class="label-modern mb-2 block">{{ 'profile.confirm_password' | translate }}</label>
                        <div class="input-modern-wrapper">
                            <i class="pi pi-key"></i>
                            <input pInputText type="password" [(ngModel)]="confirmPassword" class="w-full" placeholder="••••••••" />
                        </div>
                    </div>

                    <div class="col-12 mt-4">
                        <p-button [label]="'profile.update_password' | translate" icon="pi pi-lock" (onClick)="changePassword()" [loading]="loading" [disabled]="!oldPassword || !newPassword || newPassword !== confirmPassword" styleClass="w-full sm:w-auto bg-primary border-none px-6 py-3 shadow-premium font-bold"></p-button>
                    </div>
                </div>
              } @else if (activeTab === 'notifications') {
                <div class="flex flex-column gap-5">
                    <h3 class="text-lg font-bold text-900 m-0 mb-2 flex align-items-center gap-2">
                        <i class="pi pi-bell text-primary"></i> {{ 'profile.notifications_tab' | translate }}
                    </h3>
                    
                    <div class="flex align-items-center justify-content-between p-4 border-round-xl bg-surface-50 border-1 border-soft">
                        <div class="flex flex-column gap-1">
                            <span class="font-bold text-900">{{ 'profile.email_notifications' | translate }}</span>
                            <span class="text-sm text-secondary opacity-70">{{ 'profile.email_notif_desc' | translate }}</span>
                        </div>
                        <i class="pi pi-check-circle text-2xl text-primary"></i>
                    </div>

                    <div class="flex align-items-center justify-content-between p-4 border-round-xl bg-surface-50 border-1 border-soft">
                        <div class="flex flex-column gap-1">
                            <span class="font-bold text-900">{{ 'profile.browser_notifications' | translate }}</span>
                            <span class="text-sm text-secondary opacity-70">{{ 'profile.browser_notif_desc' | translate }}</span>
                        </div>
                        <i class="pi pi-circle text-2xl text-dim"></i>
                    </div>

                    <div class="p-4 bg-blue-50 text-blue-700 border-round-xl flex gap-3 align-items-start">
                        <i class="pi pi-info-circle text-xl mt-1"></i>
                        <p class="m-0 text-sm leading-relaxed">{{ 'profile.notif_desc' | translate }}</p>
                    </div>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
    <p-toast></p-toast>
  `,
  styles: [`
    .avatar-wrapper {
        padding: 8px;
        background: var(--bg-main);
        border-radius: 50%;
        border: 2px dashed var(--border-soft);
    }

    .avatar-inner img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .bg-content-subtle {
        background: var(--bg-main);
    }
    
    .role-badge {
        background: var(--primary);
        color: white;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.65rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.1em;
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
        border-radius: 12px !important;
        border: 1px solid var(--border-soft) !important;
        background: var(--bg-card) !important;
        color: var(--text-main) !important;
        height: 3rem;
    }

    .input-modern-wrapper.disabled input {
        background: var(--bg-main) !important;
        opacity: 0.7;
    }

    .profile-side-btn {
        width: 100%;
        padding: 1rem;
        border: none;
        background: transparent;
        border-radius: 12px;
        text-align: left;
        font-weight: 600;
        color: var(--text-muted);
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        position: relative;
        z-index: 10;
    }

    .profile-side-btn:hover {
        background: var(--primary-glow);
        color: var(--primary);
    }

    .profile-side-btn.active {
        background: var(--primary-glow);
        color: var(--primary);
    }

    .avatar-edit-btn {
        background: var(--bg-card) !important;
        border-color: var(--border-soft) !important;
    }
  `]
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  langService = inject(LanguageService);
  
  user: User | null = null;
  loading = false;
  activeTab: 'profile' | 'security' | 'notifications' = 'profile';

  // Password fields
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';

  ngOnInit() {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.user = { ...currentUser };
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && this.user) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.user!.avatarUrl = e.target.result;
        this.save(); // Auto-save on image change
      };
      reader.readAsDataURL(file);
    }
  }

  deleteAvatar() {
    if (this.user) {
      this.user.avatarUrl = undefined;
      this.save();
    }
  }

  save() {
    if (!this.user) return;
    this.loading = true;
    
    this.authService.updateProfile(this.user).subscribe({
      next: () => {
        this.messageService.add({ 
            severity: 'success', 
            summary: this.langService.translate('common.success'), 
            detail: this.langService.translate('profile.update_success') 
        });
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ 
            severity: 'error', 
            summary: this.langService.translate('common.error'), 
            detail: this.langService.translate('profile.update_error') 
        });
        this.loading = false;
      }
    });
  }

  changePassword() {
    if (this.newPassword !== this.confirmPassword) return;
    
    this.loading = true;
    this.authService.changePassword(this.oldPassword, this.newPassword).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: this.langService.translate('common.success'), detail: this.langService.translate('profile.password_success') });
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: this.langService.translate('common.error'), detail: err.error || this.langService.translate('profile.password_error') });
        this.loading = false;
      }
    });
  }
}

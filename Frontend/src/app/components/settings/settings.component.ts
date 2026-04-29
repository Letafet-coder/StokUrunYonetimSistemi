import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { ThemeService } from '../../services/theme.service';
import { LanguageService } from '../../services/language.service';
import { AuthService } from '../../services/auth.service';
import { ReportsService } from '../../services/reports.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, FormsModule, CardModule, SelectButtonModule, 
    ColorPickerModule, ToggleSwitchModule, SelectModule, 
    ButtonModule, InputTextModule, PasswordModule, TranslatePipe
  ],
  template: `
    <div class="p-4 md:p-6 flex justify-content-center min-h-screen">
      <div class="glass-card w-full xl:w-9 border-round-2xl overflow-hidden shadow-8">
        
        <!-- Header -->
        <div class="p-6 md:p-8 border-bottom-1 border-soft header-gradient">
            <div class="flex align-items-center gap-4">
              <div class="w-4rem h-4rem border-round-xl bg-white-alpha-20 flex align-items-center justify-content-center shadow-4 backdrop-blur-md">
                <i class="pi pi-cog text-white text-3xl"></i>
              </div>
              <div>
                <h1 class="text-4xl font-bold m-0 text-white tracking-tight">{{ 'settings.title' | translate }}</h1>
                <p class="text-white-alpha-70 m-0 mt-1 text-lg">{{ 'settings.subtitle' | translate }}</p>
              </div>
            </div>
        </div>

        <div class="grid p-0 m-0">
          <!-- Navigation Section -->
          <div class="col-12 lg:col-3 p-4 lg:p-6 bg-content-subtle border-right-1 border-soft">
              <div class="flex flex-column gap-2">
                  <button 
                    class="settings-nav-btn" 
                    [class.active]="activeTab() === 'appearance'"
                    (click)="activeTab.set('appearance')">
                      <div class="w-2rem h-2rem flex align-items-center justify-content-center border-round-md mr-2 icon-bg">
                        <i class="pi pi-palette"></i>
                      </div>
                      <span>Görünüm & Tema</span>
                  </button>
                  <button 
                    class="settings-nav-btn" 
                    [class.active]="activeTab() === 'language'"
                    (click)="activeTab.set('language')">
                      <div class="w-2rem h-2rem flex align-items-center justify-content-center border-round-md mr-2 icon-bg">
                        <i class="pi pi-globe"></i>
                      </div>
                      <span>Dil Seçenekleri</span>
                  </button>
                  <button 
                    class="settings-nav-btn" 
                    [class.active]="activeTab() === 'security'"
                    (click)="activeTab.set('security')">
                      <div class="w-2rem h-2rem flex align-items-center justify-content-center border-round-md mr-2 icon-bg">
                        <i class="pi pi-shield"></i>
                      </div>
                      <span>Güvenlik</span>
                  </button>
                  <button 
                    class="settings-nav-btn" 
                    [class.active]="activeTab() === 'data'"
                    (click)="activeTab.set('data')">
                      <div class="w-2rem h-2rem flex align-items-center justify-content-center border-round-md mr-2 icon-bg">
                        <i class="pi pi-database"></i>
                      </div>
                      <span>Veri Yönetimi</span>
                  </button>
              </div>
          </div>

          <!-- Settings Content Section -->
          <div class="col-12 lg:col-9 p-6 md:p-8">
            <div class="flex flex-column gap-6">
              
              <!-- Appearance Section -->
              @if (activeTab() === 'appearance') {
                <section class="fadein">
                  <h3 class="section-title mb-5">Görünüm Ayarları</h3>
                  
                  <div class="settings-card mb-4">
                    <div class="flex align-items-center justify-content-between">
                      <div class="flex align-items-center gap-3">
                        <div class="w-3rem h-3rem border-circle bg-primary-100 text-primary flex align-items-center justify-content-center">
                          <i class="pi pi-moon text-xl"></i>
                        </div>
                        <div class="flex flex-column">
                          <span class="font-bold text-lg text-900">{{ 'settings.dark_mode' | translate }}</span>
                          <span class="text-sm text-secondary opacity-70">{{ 'settings.dark_mode_desc' | translate }}</span>
                        </div>
                      </div>
                      <p-toggleSwitch [ngModel]="themeService.isDarkMode()" (ngModelChange)="themeService.toggleDarkMode()"></p-toggleSwitch>
                    </div>
                  </div>

                  <div class="settings-card">
                    <div class="flex flex-column gap-4">
                      <div class="flex align-items-center gap-3">
                        <div class="w-3rem h-3rem border-circle bg-primary-100 text-primary flex align-items-center justify-content-center">
                          <i class="pi pi-palette text-xl"></i>
                        </div>
                        <div class="flex flex-column">
                          <span class="font-bold text-lg text-900">{{ 'settings.theme_color' | translate }}</span>
                          <span class="text-sm text-secondary opacity-70">{{ 'settings.theme_color_desc' | translate }}</span>
                        </div>
                      </div>
                      
                      <div class="flex flex-wrap gap-3 mt-2">
                        @for (color of premiumColors; track color) {
                          <div 
                            class="color-swatch" 
                            [style.background-color]="color"
                            [class.active]="themeService.primaryColor() === color"
                            (click)="themeService.setPrimaryColor(color)">
                            @if (themeService.primaryColor() === color) {
                              <i class="pi pi-check text-white"></i>
                            }
                          </div>
                        }
                        <div class="flex align-items-center gap-2 ml-auto custom-color-picker">
                          <span class="text-xs font-bold text-secondary uppercase">Özel Renk:</span>
                          <p-colorPicker [ngModel]="themeService.primaryColor()" (ngModelChange)="themeService.setPrimaryColor($event)"></p-colorPicker>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              }

              <!-- Localization Section -->
              @if (activeTab() === 'language') {
                <section class="fadein">
                  <h3 class="section-title mb-5">Dil & Bölge</h3>
                  
                  <div class="settings-card">
                    <div class="flex align-items-center justify-content-between">
                      <div class="flex align-items-center gap-3">
                        <div class="w-3rem h-3rem border-circle bg-blue-100 text-blue-600 flex align-items-center justify-content-center">
                          <i class="pi pi-globe text-xl"></i>
                        </div>
                        <div class="flex flex-column">
                          <span class="font-bold text-lg text-900">{{ 'settings.language' | translate }}</span>
                          <span class="text-sm text-secondary opacity-70">{{ 'settings.language_desc' | translate }}</span>
                        </div>
                      </div>
                      <p-select [options]="languages" 
                               [ngModel]="langService.currentLang()" 
                               (ngModelChange)="langService.setLanguage($event)"
                               optionLabel="label" 
                               optionValue="value" 
                               styleClass="w-12rem modern-select"></p-select>
                    </div>
                  </div>
                </section>
              }

              <!-- Security Section -->
              @if (activeTab() === 'security') {
                <section class="fadein">
                  <h3 class="section-title mb-5">Güvenlik & Şifre</h3>
                  
                  <div class="settings-card flex flex-column gap-5">
                    <div class="field w-full m-0">
                      <label class="block text-900 font-bold mb-2 flex align-items-center gap-2">
                        <i class="pi pi-key text-primary"></i> Mevcut Şifre
                      </label>
                      <p-password [(ngModel)]="oldPassword" [toggleMask]="true" [feedback]="false" styleClass="w-full" inputStyleClass="w-full modern-input"></p-password>
                    </div>
                    <div class="field w-full m-0">
                      <label class="block text-900 font-bold mb-2 flex align-items-center gap-2">
                        <i class="pi pi-lock text-primary"></i> Yeni Şifre
                      </label>
                      <p-password [(ngModel)]="newPassword" [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full modern-input" promptLabel="Şifre Gücü" weakLabel="Zayıf" mediumLabel="Orta" strongLabel="Güçlü"></p-password>
                    </div>
                    <p-button 
                      label="Şifreyi Güncelle" 
                      icon="pi pi-check-circle" 
                      styleClass="w-fit modern-action-btn"
                      [loading]="loading"
                      (click)="onUpdatePassword()"></p-button>
                  </div>
                </section>
              }

              <!-- Data Management Section -->
              @if (activeTab() === 'data') {
                <section class="fadein">
                  <h3 class="section-title mb-5">Veri & Yedekleme</h3>
                  
                  <div class="flex flex-column gap-4">
                    <div class="settings-card hover-lift">
                      <div class="flex align-items-center justify-content-between">
                        <div class="flex align-items-center gap-3">
                          <div class="w-3rem h-3rem border-circle bg-green-100 text-green-600 flex align-items-center justify-content-center">
                            <i class="pi pi-file-excel text-xl"></i>
                          </div>
                          <div class="flex flex-column">
                            <span class="font-bold text-lg text-900">Verileri Dışa Aktar</span>
                            <span class="text-sm text-secondary opacity-70">Tüm ürün ve stok verilerini Excel formatında indir</span>
                          </div>
                        </div>
                        <button pButton icon="pi pi-download" label="İndir (.xlsx)" class="p-button-success p-button-text font-bold" (click)="onExport()"></button>
                      </div>
                    </div>

                    <div class="settings-card hover-lift danger-border">
                      <div class="flex align-items-center justify-content-between">
                        <div class="flex align-items-center gap-3">
                          <div class="w-3rem h-3rem border-circle bg-red-100 text-red-600 flex align-items-center justify-content-center">
                            <i class="pi pi-user-minus text-xl"></i>
                          </div>
                          <div class="flex flex-column">
                            <span class="font-bold text-lg text-red-600">Hesabı Dondur</span>
                            <span class="text-sm text-secondary opacity-70">Sistem erişiminizi geçici olarak kapatın</span>
                          </div>
                        </div>
                        <button pButton icon="pi pi-trash" label="İşlemi Başlat" class="p-button-danger p-button-text font-bold" (click)="onFreezeAccount()"></button>
                      </div>
                    </div>
                  </div>
                </section>
              }

              <!-- Save Info Footer -->
              <div class="mt-4 p-5 border-round-2xl bg-info-gradient border-1 border-soft flex align-items-center gap-4 shadow-3">
                  <div class="w-4rem h-4rem border-circle bg-white-alpha-20 text-white flex align-items-center justify-content-center shadow-2 backdrop-blur-md">
                      <i class="pi pi-cloud-upload text-2xl"></i>
                  </div>
                  <div class="flex-1">
                      <p class="m-0 text-lg font-bold text-white">Bulut Eşitleme Aktif</p>
                      <p class="m-0 text-sm text-white-alpha-80">{{ 'settings.save_info' | translate }}</p>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header-gradient {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    }

    .bg-info-gradient {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    }

    .section-title {
        font-size: 0.75rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        color: var(--primary);
        background: var(--primary-glow);
        display: inline-block;
        padding: 6px 16px;
        border-radius: 30px;
    }

    .settings-card {
        padding: 2rem;
        background: var(--bg-card);
        border-radius: 20px;
        border: 1px solid var(--border-soft);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }

    .settings-card:hover {
        border-color: var(--primary);
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
    }

    .hover-lift:hover {
      transform: translateY(-4px);
    }

    .danger-border:hover {
      border-color: #ef4444;
    }

    .settings-nav-btn {
        width: 100%;
        padding: 0.75rem;
        border: none;
        background: transparent;
        border-radius: 14px;
        text-align: left;
        font-weight: 600;
        color: var(--text-muted);
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        margin-bottom: 0.5rem;
    }

    .icon-bg {
      background: var(--bg-main);
      color: var(--text-muted);
      transition: all 0.3s ease;
    }

    .settings-nav-btn:hover {
        background: var(--bg-card);
        color: var(--primary);
    }

    .settings-nav-btn:hover .icon-bg {
      background: var(--primary-glow);
      color: var(--primary);
    }

    .settings-nav-btn.active {
        background: var(--bg-card);
        color: var(--primary);
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    .settings-nav-btn.active .icon-bg {
      background: var(--primary);
      color: white;
    }

    .color-swatch {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      border: 3px solid transparent;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .color-swatch:hover {
      transform: scale(1.15) rotate(5deg);
    }

    .color-swatch.active {
      border-color: white;
      outline: 2px solid var(--primary);
      transform: scale(1.1);
    }

    .modern-select {
      border-radius: 12px !important;
      border: 1px solid var(--border-soft) !important;
      background: var(--bg-main) !important;
    }

    .modern-input {
      border-radius: 12px !important;
      padding: 0.75rem 1rem !important;
      border: 1px solid var(--border-soft) !important;
      background: var(--bg-main) !important;
    }

    .modern-input:focus {
      border-color: var(--primary) !important;
      box-shadow: 0 0 0 3px var(--primary-glow) !important;
    }

    .modern-action-btn {
      background: var(--primary) !important;
      border: none !important;
      padding: 0.75rem 2rem !important;
      border-radius: 12px !important;
      font-weight: 700 !important;
      box-shadow: 0 10px 20px -10px var(--primary) !important;
    }

    .fadein {
        animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .backdrop-blur-md {
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    .white-alpha-20 { background-color: rgba(255, 255, 255, 0.2); }
    .text-white-alpha-70 { color: rgba(255, 255, 255, 0.7); }
    .text-white-alpha-80 { color: rgba(255, 255, 255, 0.8); }
  `]
})
export class SettingsComponent {
  themeService = inject(ThemeService);
  langService = inject(LanguageService);
  authService = inject(AuthService);
  reportsService = inject(ReportsService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);

  activeTab = signal('appearance');
  loading = false;

  oldPassword = '';
  newPassword = '';

  premiumColors = [
    '#0d9488', // Teal (Default)
    '#2563eb', // Blue
    '#7c3aed', // Violet
    '#db2777', // Pink
    '#ea580c', // Orange
    '#16a34a', // Green
    '#4b5563', // Slate
    '#000000'  // Black
  ];

  languages = [
    { label: 'Türkçe', value: 'tr' },
    { label: 'English', value: 'en' }
  ];

  onUpdatePassword() {
    if (!this.oldPassword || !this.newPassword) {
      this.messageService.add({ severity: 'warn', summary: 'Uyarı', detail: 'Lütfen tüm alanları doldurun.' });
      return;
    }

    if (this.newPassword.length < 6) {
      this.messageService.add({ severity: 'warn', summary: 'Uyarı', detail: 'Yeni şifre en az 6 karakter olmalıdır.' });
      return;
    }

    this.loading = true;
    this.authService.changePassword(this.oldPassword, this.newPassword).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'Şifreniz başarıyla güncellendi.' });
        this.oldPassword = '';
        this.newPassword = '';
        this.loading = false;
      },
      error: (err) => {
        const errorMsg = typeof err.error === 'string' ? err.error : (err.error?.message || 'İşlem başarısız oldu.');
        this.messageService.add({ severity: 'error', summary: 'Hata', detail: errorMsg });
        this.loading = false;
      }
    });
  }

  onExport() {
    console.log('DEBUG: onExport called');
    try {
      this.messageService.add({ severity: 'info', summary: 'İşlem Başladı', detail: 'Excel dosyası hazırlanıyor...' });
      this.reportsService.exportProducts().subscribe({
        next: (blob) => {
          console.log('DEBUG: Export success, blob size:', blob.size);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Envanter_${new Date().toISOString().split('T')[0]}.xlsx`;
          a.click();
          window.URL.revokeObjectURL(url);
          this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'Dosya indirildi.' });
        },
        error: (err) => {
          console.error('DEBUG: Export failed', err);
          this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Dosya indirilemedi.' });
        }
      });
    } catch (e) {
      console.error('DEBUG: onExport crash', e);
    }
  }

  onFreezeAccount() {
    console.log('DEBUG: onFreezeAccount called');
    this.confirmationService.confirm({
      message: 'Hesabınızı dondurmak istediğinizden emin misiniz? Bu işlemden sonra giriş yapabilmek için bir yöneticinin onay vermesi gerekecektir.',
      header: 'Hesabı Dondur',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Evet, Dondur',
      rejectLabel: 'Vazgeç',
      accept: () => {
        console.log('DEBUG: Account freeze accepted');
        this.authService.freezeAccount().subscribe({
          next: () => {
            console.log('DEBUG: Account freeze success');
            this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'Hesabınız donduruldu. Çıkış yapılıyor...' });
            setTimeout(() => {
              this.authService.logout();
            }, 2000);
          },
          error: (err) => {
            console.error('DEBUG: Account freeze failed', err);
            this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'İşlem gerçekleştirilemedi.' });
          }
        });
      },
      reject: () => {
        console.log('DEBUG: Account freeze rejected');
      }
    });
  }
}

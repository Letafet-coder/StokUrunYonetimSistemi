import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, PasswordModule, MessageModule, RouterLink],
  template: `
    <div class="register-container flex align-items-center justify-content-center min-h-screen py-5">
      <div class="glass-card p-6 shadow-8 border-round-xl w-full sm:w-32rem">
        
        <div class="text-center mb-5">
          <div class="logo-icon mb-3">
            <i class="pi pi-user-plus"></i>
          </div>
          <div class="text-3xl font-bold text-gray-900 mb-2">Yeni Hesap Oluştur</div>
          <span class="text-gray-500 font-medium text-sm">Sisteme katılmak için formu doldurun</span>
        </div>

        <form (ngSubmit)="onRegister()" #registerForm="ngForm" class="flex flex-column gap-3">
          
          <!-- Ad Soyad -->
          <div class="field">
            <label for="fullName" class="block text-gray-800 font-bold mb-2">Ad Soyad <span class="text-red-500">*</span></label>
            <span class="p-input-icon-left w-full">
              <i class="pi pi-id-card text-gray-500"></i>
              <input pInputText id="fullName" type="text" [(ngModel)]="fullName" name="fullName" required
                class="w-full h-3rem" placeholder="Adınız ve soyadınız" />
            </span>
          </div>

          <!-- Kullanıcı Adı -->
          <div class="field">
            <label for="username" class="block text-gray-800 font-bold mb-2">Kullanıcı Adı <span class="text-red-500">*</span></label>
            <span class="p-input-icon-left w-full">
              <i class="pi pi-user text-gray-500"></i>
              <input pInputText id="username" type="text" [(ngModel)]="username" name="username" required
                class="w-full h-3rem" placeholder="Benzersiz bir kullanıcı adı" />
            </span>
          </div>

          <!-- E-posta -->
          <div class="field">
            <label for="email" class="block text-gray-800 font-bold mb-2">E-posta</label>
            <span class="p-input-icon-left w-full">
              <i class="pi pi-envelope text-gray-500"></i>
              <input pInputText id="email" type="email" [(ngModel)]="email" name="email"
                class="w-full h-3rem" placeholder="ornek@email.com" />
            </span>
          </div>

          <!-- Şifre -->
          <div class="field">
            <label for="password" class="block text-gray-800 font-bold mb-2">Şifre <span class="text-red-500">*</span></label>
            <p-password id="password" [(ngModel)]="password" name="password" required
              [toggleMask]="true"
              styleClass="w-full"
              inputStyleClass="w-full h-3rem"
              placeholder="En az 6 karakter"
              promptLabel="Şifre gücü"
              weakLabel="Zayıf"
              mediumLabel="Orta"
              strongLabel="Güçlü">
            </p-password>
          </div>

          <!-- Şifre Tekrar -->
          <div class="field">
            <label for="confirmPassword" class="block text-gray-800 font-bold mb-2">Şifre Tekrar <span class="text-red-500">*</span></label>
            <p-password id="confirmPassword" [(ngModel)]="confirmPassword" name="confirmPassword" required
              [feedback]="false" [toggleMask]="true"
              styleClass="w-full"
              inputStyleClass="w-full h-3rem"
              placeholder="Şifreyi tekrar girin">
            </p-password>
            @if (password && confirmPassword && password !== confirmPassword) {
              <small class="text-red-500 mt-1 block">Şifreler eşleşmiyor</small>
            }
          </div>

          @if (error) {
            <p-message severity="error" [text]="error" styleClass="w-full"></p-message>
          }

          @if (success) {
            <p-message severity="success" [text]="success" styleClass="w-full"></p-message>
          }

          <p-button 
            label="Kayıt Ol" 
            icon="pi pi-check" 
            type="submit" 
            [loading]="loading"
            [disabled]="!username || !password || !fullName || password !== confirmPassword"
            styleClass="w-full h-3rem font-bold text-lg p-button-raised p-button-rounded mt-2">
          </p-button>
        </form>

        <div class="divider flex align-items-center gap-3 my-4">
          <div class="flex-1 h-1px bg-gray-200"></div>
          <span class="text-gray-400 text-sm">veya</span>
          <div class="flex-1 h-1px bg-gray-200"></div>
        </div>

        <div class="text-center">
          <span class="text-gray-600 text-sm">Zaten hesabınız var mı? </span>
          <a routerLink="/login" class="text-primary font-bold text-sm cursor-pointer hover:underline">Giriş Yap</a>
        </div>

        <div class="mt-4 p-3 border-round-lg text-center" style="background: #f0fdf4; border: 1px solid #bbf7d0;">
          <p class="text-xs text-gray-600 m-0">
            <i class="pi pi-info-circle text-green-500 mr-1"></i>
            Kayıt talebiniz <strong>yönetici onayına</strong> sunulur. Onay işleminden sonra sisteme giriş yapabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #0891b2 100%);
      background-size: 400% 400%;
      animation: gradientBG 12s ease infinite;
      min-height: 100vh;
    }

    @keyframes gradientBG {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .glass-card {
      background: var(--bg-card);
      border: 1px solid var(--border-glass);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
    }

    .logo-icon {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, var(--primary), var(--primary-light));
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      box-shadow: 0 8px 24px var(--primary-glow);
    }

    .logo-icon i {
      color: white;
      font-size: 1.75rem;
    }

    .h-1px { height: 1px; }

    :host ::ng-deep .p-inputtext {
        background: var(--bg-main) !important;
        color: var(--text-main) !important;
        border: 1px solid var(--border-soft) !important;
        box-shadow: none !important;
    }

    :host ::ng-deep .p-inputtext:focus {
        border-color: var(--primary) !important;
        background: var(--bg-card) !important;
        box-shadow: 0 0 0 2px var(--primary-glow) !important;
    }

    :host ::ng-deep .p-password input {
        width: 100%;
    }

    :host ::ng-deep .p-input-icon-left > i {
        color: var(--text-dim) !important;
        z-index: 10;
    }

    .text-gray-900 { color: var(--text-main) !important; }
    .text-gray-800 { color: var(--text-main) !important; }
    .text-gray-600 { color: var(--text-muted) !important; }
    .text-gray-500 { color: var(--text-dim) !important; }
    .text-gray-400 { color: var(--text-dim) !important; }
  `]
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  fullName = '';
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  error = '';
  success = '';

  onRegister() {
    if (!this.username || !this.password || !this.fullName) return;
    if (this.password !== this.confirmPassword) {
      this.error = 'Şifreler eşleşmiyor.';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'Şifre en az 6 karakter olmalıdır.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.authService.register({
      username: this.username,
      password: this.password,
      fullName: this.fullName,
      email: this.email
    }).subscribe({
      next: (res: any) => {
        this.success = res.message || 'Kayıt talebiniz alındı! Onay bekleyin...';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.error = err?.error || 'Kayıt sırasında bir hata oluştu.';
        this.loading = false;
      }
    });
  }
}

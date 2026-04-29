import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, CardModule, PasswordModule, MessageModule, RouterLink],
  template: `
    <div class="login-page">
      <!-- Background Overlay -->
      <div class="bg-overlay"></div>
      
      <!-- Futuristic Floating Elements -->
      <div class="floating-widgets hidden md:block">
        <div class="widget widget-left-top glass-widget animate-float-slow">
            <div class="widget-header">Kesintisiz Erişim</div>
            <div class="widget-stat-small">7/24 Teknik Destek</div>
            <div class="widget-desc">"Her Zaman ve Her Cihazdan Bağlantı"</div>
        </div>

        <div class="widget widget-left-bottom glass-widget animate-float">
            <div class="widget-header">Kapsamlı Yönetim</div>
            <div class="widget-stat-small">12 Aktif Modül</div>
            <div class="widget-desc">Stok, Sevkiyat, Raporlama ve CRM</div>
        </div>

        <div class="widget widget-right-top glass-widget animate-float-delayed">
            <div class="widget-header">Stratejik Analiz</div>
            <div class="widget-stat-small">Anlık Raporlama</div>
            <div class="widget-desc">Veriye Dayalı Karar Destek Sistemi</div>
        </div>

        <div class="widget widget-right-bottom glass-widget animate-float-slow">
            <div class="widget-header">Üstün Güvenlik</div>
            <div class="widget-stat-small">SSL & Şifreleme</div>
            <div class="widget-desc">Uçtan Uca Veri Koruması</div>
        </div>
      </div>

      <!-- Futuristic Orbits -->
      <div class="orbit orbit-1"></div>
      <div class="orbit orbit-2"></div>

      <!-- Main Login Card -->
      <div class="login-card-container z-10 p-3">
        <div class="login-card shadow-premium border-round-2xl overflow-hidden p-4 md:p-5">
          <div class="text-center mb-4">
            <div class="logo-box mb-3 shadow-3">
              <i class="pi pi-box"></i>
            </div>
            <h1 class="text-2xl font-bold text-900 m-0 mb-1 tracking-tight">LagerMaster</h1>
            <p class="text-secondary text-xl font-bold m-0 opacity-70 animate-text-glow">Stok Yönetim Sistemi</p>
          </div>

          @if (sessionExpired) {
            <p-message severity="warn" text="Oturumunuz sona erdi." styleClass="w-full mb-3 p-2 text-xs"></p-message>
          }

          <form (ngSubmit)="onLogin()" #loginForm="ngForm" class="flex flex-column gap-3">
            <div class="flex flex-column gap-1">
              <label for="username" class="text-xs font-bold text-900 uppercase letter-spacing-1 opacity-70">Kullanıcı Adı</label>
              <div class="input-modern-wrapper">
                <i class="pi pi-user"></i>
                <input pInputText id="username" type="text" [(ngModel)]="username" name="username" required class="w-full h-3rem" placeholder="Kullanıcı adınızı girin" autocomplete="username" />
              </div>
            </div>

            <div class="flex flex-column gap-1">
              <label for="password" class="text-xs font-bold text-900 uppercase letter-spacing-1 opacity-70">Şifre</label>
              <div class="input-modern-wrapper">
                <i class="pi pi-lock"></i>
                <p-password id="password" [(ngModel)]="password" name="password" [feedback]="false" [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full h-3rem" placeholder="Şifrenizi girin"></p-password>
              </div>
            </div>

            @if (error) {
              <p-message severity="error" [text]="error" styleClass="w-full p-2 text-xs"></p-message>
            }

            <p-button type="submit" [loading]="loading" styleClass="w-full bg-primary border-none h-3rem font-bold text-lg shadow-premium hover:scale-102 transition-all mt-2">
                <ng-template pTemplate="content">
                    <div class="flex align-items-center justify-content-center gap-2">
                        <i class="pi pi-sign-in"></i>
                        <span>Giriş Yap</span>
                    </div>
                </ng-template>
            </p-button>
          </form>

          <div class="divider flex align-items-center gap-3 my-4">
            <div class="flex-1 h-1px bg-border"></div>
            <span class="text-dim text-xs font-bold uppercase">veya</span>
            <div class="flex-1 h-1px bg-border"></div>
          </div>

          <div class="text-center">
            <p class="text-secondary text-sm m-0">Hesabınız yok mu? <a routerLink="/register" class="text-primary font-bold no-underline hover:underline">Kayıt Ol</a></p>
          </div>
        </div>


      </div>
    </div>
  `,
  styles: [`
    .login-page {
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: #020617 url('/warehouse_bg_futuristic.png') center/cover no-repeat;
      padding: 2rem;
      transition: background 0.3s ease;
    }

    .bg-overlay {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at center, rgba(15, 23, 42, 0.4) 0%, rgba(2, 6, 23, 0.85) 100%);
        backdrop-filter: blur(0px);
    }

    .login-card {
        background: var(--bg-card);
        backdrop-filter: blur(25px);
        width: 100%;
        max-width: 420px;
        position: relative;
        z-index: 10;
        border: 1px solid var(--border-glass);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        border-radius: 24px !important;
    }

    :host-context(.my-app-dark) .login-card {
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo-box {
        width: 64px;
        height: 64px;
        background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
        border-radius: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        box-shadow: 0 8px 20px var(--primary-glow);
    }

    .logo-box i {
        color: white;
        font-size: 1.75rem;
    }

    .input-modern-wrapper {
        position: relative;
        display: flex;
        align-items: center;
    }

    .input-modern-wrapper i {
        position: absolute;
        left: 1.25rem;
        color: var(--text-dim);
        z-index: 10;
        font-size: 1.1rem;
    }

    :host ::ng-deep .p-inputtext {
        padding-left: 3.25rem !important;
        border-radius: 14px !important;
        border: 1px solid var(--border-soft) !important;
        background: var(--bg-main) !important;
        color: var(--text-main) !important;
        height: 3.5rem !important;
        font-weight: 500 !important;
    }

    :host ::ng-deep .p-inputtext:focus {
        border-color: var(--primary) !important;
        background: var(--bg-card) !important;
        box-shadow: 0 0 0 4px var(--primary-glow) !important;
    }

    .widget {
        position: absolute;
        padding: 1.25rem;
        border-radius: 20px;
        border: 1px solid var(--border-glass);
        color: white;
        z-index: 5;
        min-width: 180px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
    }

    .widget-left-top { left: 5%; top: 15%; }
    .widget-left-bottom { left: 8%; bottom: 15%; }
    .widget-right-top { right: 5%; top: 18%; }
    .widget-right-bottom { right: 8%; bottom: 12%; }

    .glass-widget {
        background: rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .widget-header {
        font-size: 0.7rem;
        font-weight: 800;
        text-transform: uppercase;
        margin-bottom: 0.75rem;
        color: rgba(255, 255, 255, 0.6);
        letter-spacing: 0.08em;
    }

    .widget-stat-small {
        font-size: 1.5rem;
        font-weight: 800;
    }

    .trend-up {
        font-size: 0.8rem;
        color: #4ade80;
        margin-left: 0.5rem;
    }

    .progress-bar-modern {
        width: 100%;
        height: 8px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--primary), var(--primary-light));
        box-shadow: 0 0 10px var(--primary-glow);
    }

    .widget-stat-big {
        font-size: 2.25rem;
        font-weight: 800;
        color: var(--primary-light);
        text-shadow: 0 0 15px var(--primary-glow);
    }

    .orbit {
        position: absolute;
        border: 1px solid rgba(255, 255, 255, 0.03);
        border-radius: 50%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
    }

    .orbit-1 { width: 800px; height: 800px; border-style: dashed; animation: rotate 80s linear infinite; }
    .orbit-2 { width: 1200px; height: 1200px; animation: rotate 120s linear infinite reverse; }

    @keyframes rotate {
        from { transform: translate(-50%, -50%) rotate(0deg); }
        to { transform: translate(-50%, -50%) rotate(360deg); }
    }

    @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
    }

    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-float-slow { animation: float 9s ease-in-out infinite; }
    .animate-float-delayed { animation: float 7s ease-in-out infinite 2s; }

    .bg-border { background-color: var(--border-soft); height: 1px; }
    .text-dim { color: var(--text-dim); }

    @keyframes textGlow {
        0%, 100% { opacity: 0.7; transform: translateY(0); }
        50% { opacity: 1; transform: translateY(-2px); color: var(--primary); }
    }

    .animate-text-glow {
        animation: textGlow 3s ease-in-out infinite;
        display: inline-block;
    }

    .text-900 { color: var(--text-main) !important; font-weight: 700 !important; }
    .text-secondary { color: var(--text-muted) !important; }
  `]


})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  username = '';
  password = '';
  loading = false;
  error = '';
  sessionExpired = false;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.sessionExpired = params['reason'] === 'session_expired';
    });

    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onLogin() {
    if (!this.username || !this.password) return;

    this.loading = true;
    this.error = '';
    this.sessionExpired = false;

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = typeof err.error === 'string' ? err.error : 'Hatalı kullanıcı adı veya şifre';
        this.loading = false;
      }
    });
  }
}

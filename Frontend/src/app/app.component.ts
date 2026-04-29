import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { LanguageService } from './services/language.service';
import { NotificationService } from './services/notification.service';
import { ThemeService } from './services/theme.service';
import { TranslatePipe } from './pipes/translate.pipe';

import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive, 
    TagModule, TooltipModule, PopoverModule, ButtonModule, 
    MenuModule, TranslatePipe, ConfirmDialogModule, ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  authService = inject(AuthService);
  langService = inject(LanguageService);
  notifService = inject(NotificationService);
  themeService = inject(ThemeService); // Added to activate theme effects
  confirmationService = inject(ConfirmationService);
  
  isSidebarCollapsed = signal(false);

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.authService.refreshProfile().subscribe();
    }
  }

  // Language Menu Items
  langItems: MenuItem[] = [
    { label: 'Türkçe', icon: 'pi pi-language', command: () => this.langService.setLanguage('tr') },
    { label: 'English', icon: 'pi pi-language', command: () => this.langService.setLanguage('en') }
  ];

  toggleSidebar() {
    this.isSidebarCollapsed.update(v => !v);
  }

  handleNotificationClick() {
    this.notifService.markAllAsRead();
  }
}

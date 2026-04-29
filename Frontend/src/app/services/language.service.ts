import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { TRANSLATIONS } from '../models/translations';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private authService = inject(AuthService);

  // Default to browser language or 'tr'
  currentLang = signal<string>(this.getInitialLanguage());

  constructor() {
    // Persist language to profile when it changes
    effect(() => {
      const lang = this.currentLang();
      localStorage.setItem('lang', lang);
      this.syncWithProfile(lang);
    });
  }

  setLanguage(lang: string) {
    if (TRANSLATIONS[lang as keyof typeof TRANSLATIONS]) {
      this.currentLang.set(lang);
    }
  }

  translate(key: string, params: any = {}): string {
    const lang = this.currentLang() as keyof typeof TRANSLATIONS;
    const translations = TRANSLATIONS[lang];
    
    let text = (translations as any)[key] || key;

    // Replace parameters like {name}
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });

    return text;
  }

  private getInitialLanguage(): string {
    const saved = localStorage.getItem('lang');
    if (saved) return saved;

    const profileLang = this.authService.currentUser()?.language;
    if (profileLang) return profileLang;

    const browserLang = navigator.language.split('-')[0];
    return TRANSLATIONS[browserLang as keyof typeof TRANSLATIONS] ? browserLang : 'tr';
  }

  private syncWithProfile(lang: string) {
    const user = this.authService.currentUser();
    if (user && user.language !== lang) {
      const updatedUser = { ...user, language: lang };
      
      // Update locally immediately
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Sync with backend
      this.authService.updateProfile(updatedUser).subscribe({
          error: (err) => console.error('Dil tercihi kaydedilemedi:', err)
      });
    }
  }
}

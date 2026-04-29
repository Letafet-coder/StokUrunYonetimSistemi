import { Injectable, signal, effect, inject } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private authService = inject(AuthService);
  
  isDarkMode = signal<boolean>(this.authService.currentUser()?.isDarkMode ?? false);
  primaryColor = signal<string>(this.authService.currentUser()?.themeColor ?? '#0d9488');

  constructor() {
    // Apply theme on load and whenever signals change
    effect(() => {
      const isDark = this.isDarkMode();
      this.applyDarkMode(isDark);
    });

    effect(() => {
      const color = this.primaryColor();
      this.applyPrimaryColor(color);
    });
  }

  toggleDarkMode() {
    this.isDarkMode.update(prev => !prev);
    this.saveToProfile();
  }

  setPrimaryColor(color: string) {
    // Ensure we have a hex string (PrimeNG color picker might return an object or hex)
    const hexColor = typeof color === 'string' ? color : (color as any).value || '#0d9488';
    this.primaryColor.set(hexColor);
    this.saveToProfile();
  }

  private applyDarkMode(isDark: boolean) {
    const html = document.querySelector('html');
    if (isDark) {
      html?.classList.add('my-app-dark');
      document.body.classList.add('my-app-dark');
    } else {
      html?.classList.remove('my-app-dark');
      document.body.classList.remove('my-app-dark');
    }
  }

  private applyPrimaryColor(color: string) {
    if (!color) return;
    
    // Update global variables
    document.documentElement.style.setProperty('--primary', color);
    document.documentElement.style.setProperty('--primary-500', color);
    document.documentElement.style.setProperty('--p-primary-500', color);
    
    // Update active primary gradient shades if needed
    // For a corporate look, we can just stick to the main primary color
  }

  private saveToProfile() {
    const user = this.authService.currentUser();
    if (user) {
      const updatedUser = { 
        ...user, 
        isDarkMode: this.isDarkMode(), 
        themeColor: this.primaryColor() 
      };
      
      // Update locally immediately for better UX
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Sync with backend
      this.authService.updateProfile(updatedUser).subscribe({
          error: (err) => console.error('Profil kaydedilemedi:', err)
      });
    }
  }
}

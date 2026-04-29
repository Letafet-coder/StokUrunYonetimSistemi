import { Component, OnInit, OnDestroy, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SkeletonModule } from 'primeng/skeleton';
import { ChartModule } from 'primeng/chart';
import { ThemeService } from '../../services/theme.service';
import { Router } from '@angular/router';

import { SpeedDialModule } from 'primeng/speeddial';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, CardModule, TableModule, TagModule, 
    ButtonModule, RouterModule, TranslatePipe, SkeletonModule,
    ChartModule, SpeedDialModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats = signal<any>(null);
  displayedStats = signal<any>({
    totalProducts: 0,
    lowStockCount: 0,
    totalStockCounts: 0,
    totalMovements: 0
  });
  lowStockProducts = signal<any[]>([]);
  loading = signal(true);
  
  // SpeedDial Items
  speedDialItems: MenuItem[] = [];
  
  // Chart Data
  lineData: any;
  lineOptions: any;
  pieData: any;
  pieOptions: any;

  private refreshInterval: any;
  private apiService = inject(ApiService);
  private themeService = inject(ThemeService);
  private router = inject(Router);

  constructor() {
    // Re-initialize charts when theme changes
    effect(() => {
      this.initCharts();
    });
  }

  ngOnInit(): void {
    this.initEmptyCharts();
    this.initSpeedDial();
    this.refreshData();
    
    this.refreshInterval = setInterval(() => {
      this.refreshData(false);
    }, 60000);
  }

  initEmptyCharts() {
    this.lineData = { labels: [], datasets: [{ data: [] }] };
    this.pieData = { labels: [], datasets: [{ data: [] }] };
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  refreshData(showLoading = true) {
    if (showLoading) this.loading.set(true);
    
    Promise.all([
      this.apiService.getStats().toPromise(),
      this.apiService.getLowStock().toPromise()
    ]).then(([statsData, lowStockData]) => {
      if (statsData) {
        this.animateNumbers(statsData);
      }
      this.stats.set(statsData);
      this.lowStockProducts.set(lowStockData || []);
      this.initCharts();
      this.loading.set(false);
    }).catch(err => {
      console.error('Dashboard data load error:', err);
      this.loading.set(false);
    });
  }

  animateNumbers(targetStats: any) {
    const duration = 1200; // 1.2 seconds
    const frameRate = 60;
    const totalFrames = (duration / 1000) * frameRate;
    let frame = 0;

    const startStats = { ...this.displayedStats() };
    
    // Extract targets from backend data structure
    const targets = {
      totalProducts: targetStats.totalProducts || 0,
      lowStockCount: targetStats.lowStockCount || 0,
      totalStockCounts: targetStats.totalInventoryCounts || 0,
      totalMovements: targetStats.recentMovements?.length || 0
    };

    const interval = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const easeOutQuad = (t: number) => t * (2 - t);
      const easedProgress = easeOutQuad(progress);

      this.displayedStats.set({
        totalProducts: Math.floor(startStats.totalProducts + (targets.totalProducts - startStats.totalProducts) * easedProgress),
        lowStockCount: Math.floor(startStats.lowStockCount + (targets.lowStockCount - startStats.lowStockCount) * easedProgress),
        totalStockCounts: Math.floor(startStats.totalStockCounts + (targets.totalStockCounts - startStats.totalStockCounts) * easedProgress),
        totalMovements: Math.floor(startStats.totalMovements + (targets.totalMovements - startStats.totalMovements) * easedProgress)
      });

      if (frame >= totalFrames) {
        clearInterval(interval);
        this.displayedStats.set(targets);
      }
    }, 1000 / frameRate);
  }

  initCharts() {
    const data = this.stats();
    if (!data) return;

    const isDark = this.themeService.isDarkMode();
    const textColor = isDark ? '#f1f5f9' : '#1e293b';
    const textColorSecondary = isDark ? '#94a3b8' : '#64748b';
    const surfaceBorder = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';

    // 1. Line Chart: Movement Trend
    const trend = data.movementTrend || [];
    this.lineData = {
      labels: trend.map((t: any) => new Date(t.date).toLocaleDateString('tr-TR', { weekday: 'short' })),
      datasets: [
        {
          label: 'Günlük Hareket Sayısı',
          data: trend.map((t: any) => t.count),
          fill: true,
          borderColor: isDark ? '#60a5fa' : '#3B82F6',
          tension: 0.4,
          backgroundColor: isDark ? 'rgba(96, 165, 250, 0.15)' : 'rgba(59, 130, 246, 0.1)',
          pointBackgroundColor: isDark ? '#60a5fa' : '#3B82F6',
          pointBorderColor: isDark ? '#1e293b' : '#ffffff',
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: isDark ? '#60a5fa' : '#3B82F6'
        }
      ]
    };

    this.lineOptions = {
      plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            titleColor: textColor,
            bodyColor: textColor,
            borderColor: surfaceBorder,
            borderWidth: 1
        }
      },
      scales: {
        x: {
          ticks: { color: textColorSecondary, font: { size: 11 } },
          grid: { color: surfaceBorder, drawBorder: false }
        },
        y: {
          beginAtZero: true,
          ticks: { color: textColorSecondary, font: { size: 11 }, stepSize: 1 },
          grid: { color: surfaceBorder, drawBorder: false }
        }
      },
      maintainAspectRatio: false,
      responsive: true
    };

    // 2. Pie Chart: Category Distribution
    const dist = data.categoryDistribution || [];
    const hasData = dist.some((d: any) => d.totalValue > 0);

    this.pieData = {
      labels: dist.map((d: any) => d.categoryName),
      datasets: [
        {
          data: dist.map((d: any) => d.totalValue),
          backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'],
          hoverBackgroundColor: ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED', '#DB2777', '#0891B2'],
          borderWidth: isDark ? 2 : 1,
          borderColor: isDark ? '#111827' : '#ffffff'
        }
      ]
    };

    this.pieOptions = {
      plugins: {
        legend: {
          position: 'bottom',
          labels: { 
            color: textColor, 
            usePointStyle: true, 
            pointStyle: 'circle',
            font: { size: 11, weight: '500' },
            padding: 20
          }
        },
        tooltip: {
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            titleColor: textColor,
            bodyColor: textColor,
            borderColor: surfaceBorder,
            borderWidth: 1
        }
      },
      maintainAspectRatio: false,
      responsive: true,
      cutout: '65%' // Make it a doughnut for better look
    };
  }

  hasPieData() {
    return this.pieData?.datasets?.[0]?.data?.some((v: any) => v > 0);
  }

  initSpeedDial() {
    this.speedDialItems = [
      {
        icon: 'pi pi-plus',
        tooltipOptions: { tooltipLabel: 'Yeni Ürün' },
        command: () => { this.router.navigate(['/products']); }
      },
      {
        icon: 'pi pi-file-export',
        tooltipOptions: { tooltipLabel: 'Rapor Al' },
        command: () => { this.router.navigate(['/reports']); }
      },
      {
        icon: 'pi pi-refresh',
        tooltipOptions: { tooltipLabel: 'Verileri Güncelle' },
        command: () => { this.refreshData(); }
      }
    ];
  }
}

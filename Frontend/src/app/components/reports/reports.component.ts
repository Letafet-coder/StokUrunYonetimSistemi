import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ReportsService } from '../../services/reports.service';
import { ChartModule } from 'primeng/chart';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ThemeService } from '../../services/theme.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ChartModule, TableModule, ButtonModule, CardModule, SkeletonModule, TagModule, TranslatePipe],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  loading = signal(true);
  summary = signal<any>(null);
  lowStockReport = signal<any[]>([]);
  
  // Charts
  trendData: any;
  trendOptions: any;
  typeData: any;
  typeOptions: any;
  topProductsData: any;
  topProductsOptions: any;
  categoryData: any;
  categoryOptions: any;

  private apiService = inject(ApiService);
  private reportsService = inject(ReportsService);
  private themeService = inject(ThemeService);
  private langService = inject(LanguageService);
  private messageService = inject(MessageService);

  private lastData: any = null;

  constructor() {
    effect(() => {
      // Re-init charts when theme OR language OR data changes
      this.initCharts(this.lastData);
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    Promise.all([
      this.reportsService.getSummary().toPromise(),
      this.reportsService.getAnalytics().toPromise(),
      this.reportsService.getLowStockReport().toPromise()
    ]).then(([sum, ana, low]) => {
      this.summary.set(sum);
      this.lowStockReport.set(low || []);
      this.lastData = ana;
      this.processAnalytics(ana);
      this.loading.set(false);
    }).catch(err => {
      console.error('Reports load error:', err);
      this.loading.set(false);
    });
  }

  processAnalytics(data: any) {
    if (!data) return;
    this.initCharts(data);
  }

  initCharts(data?: any) {
    const isDark = this.themeService.isDarkMode();
    const currentLang = this.langService.currentLang(); // Access to trigger effect on lang change
    const textColor = isDark ? '#f8fafc' : '#1e293b';
    const textColorSecondary = isDark ? '#94a3b8' : '#64748b';
    const surfaceBorder = isDark ? '#334155' : '#e2e8f0';

    const analytics = data || this.lastData || {};

    // 1. Movement Trend (Line)
    const trend = analytics.movementTrend || [];
    this.trendData = {
      labels: trend.map((t: any) => new Date(t.date).toLocaleDateString(currentLang === 'tr' ? 'tr-TR' : 'en-US', { weekday: 'short' })),
      datasets: [
        {
          label: this.langService.translate('common.in'),
          data: trend.map((t: any) => t.in),
          borderColor: '#10B981',
          tension: 0.4,
          fill: false
        },
        {
          label: this.langService.translate('common.out'),
          data: trend.map((t: any) => t.out),
          borderColor: '#EF4444',
          tension: 0.4,
          fill: false
        }
      ]
    };

    this.trendOptions = this.getBasicOptions(textColorSecondary, surfaceBorder);

    // 2. Type Distribution (Pie)
    const types = analytics.typeDistribution || [];
    this.typeData = {
      labels: types.map((t: any) => {
        if (t.type === 0) return this.langService.translate('common.in');
        if (t.type === 1) return this.langService.translate('common.out');
        if (t.type === 2) return this.langService.translate('movements.adjustment_label');
        return this.langService.translate('movements.transfer_label');
      }),
      datasets: [{
        data: types.map((t: any) => t.count),
        backgroundColor: ['#10B981', '#EF4444', '#F59E0B', '#3B82F6']
      }]
    };

    this.typeOptions = {
      plugins: {
        legend: { position: 'bottom', labels: { color: textColor } }
      },
      maintainAspectRatio: false
    };

    // 3. Top Products (Horizontal Bar)
    const top = analytics.topProducts || [];
    this.topProductsData = {
      labels: top.map((p: any) => p.name),
      datasets: [{
        label: this.langService.translate('reports.inventory_value'),
        data: top.map((p: any) => p.value),
        backgroundColor: '#3B82F6',
        borderRadius: 8
      }]
    };

    this.topProductsOptions = {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: textColorSecondary }, grid: { display: false } },
        y: { ticks: { color: textColorSecondary }, grid: { display: false } }
      },
      maintainAspectRatio: false
    };

    // 4. Category Value (Vertical Bar)
    const cats = analytics.categoryValueDistribution || [];
    this.categoryData = {
      labels: cats.map((c: any) => c.categoryName),
      datasets: [{
        label: this.langService.translate('reports.inventory_value'),
        data: cats.map((c: any) => c.value),
        backgroundColor: '#8B5CF6',
        borderRadius: 8
      }]
    };

    this.categoryOptions = this.getBasicOptions(textColorSecondary, surfaceBorder);
  }

  getBasicOptions(textColorSecondary: string, surfaceBorder: string) {
    return {
      plugins: { legend: { labels: { color: textColorSecondary } } },
      scales: {
        x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder, drawBorder: false } },
        y: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder, drawBorder: false } }
      },
      maintainAspectRatio: false
    };
  }

  exportCSV() {
    this.messageService.add({ severity: 'info', summary: 'İşlem Başladı', detail: 'CSV dosyası hazırlanıyor...' });
    this.reportsService.exportCsv().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Envanter_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'Dosya indirildi.' });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Dosya indirilemedi.' })
    });
  }

  exportPDF() {
    this.messageService.add({ severity: 'info', summary: 'İşlem Başladı', detail: 'PDF dosyası hazırlanıyor...' });
    this.reportsService.exportPdf().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Envanter_${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'Dosya indirildi.' });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Dosya indirilemedi.' })
    });
  }
}

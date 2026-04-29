import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SystemSettingsService, SystemSetting } from '../../services/system-settings.service';
import { AuditLogService, AuditLog } from '../../services/audit-log.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-system-management',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TranslatePipe, TableModule, 
    TagModule, ButtonModule, InputTextModule, ToggleSwitchModule, TooltipModule
  ],
  template: `
    <div class="p-4 md:p-6">
      <div class="flex flex-column gap-6">
        
        <!-- Header -->
        <div class="flex flex-column md:flex-row md:align-items-center justify-content-between gap-4">
          <div>
            <h1 class="text-3xl font-bold m-0 text-900 tracking-tight">{{ 'system.title' | translate }}</h1>
            <p class="text-secondary m-0 mt-1">{{ 'system.subtitle' | translate }}</p>
          </div>
          <div class="flex gap-3">
             <p-button [label]="'system.refresh_all' | translate" icon="pi pi-refresh" (onClick)="loadAll()" [text]="true" severity="secondary"></p-button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex gap-2 border-bottom-1 border-soft overflow-x-auto pb-1">
          <button class="tab-btn" [class.active]="activeTab() === 'approvals'" (click)="activeTab.set('approvals')">
            <i class="pi pi-user-plus mr-2"></i> {{ 'system.pending_approvals' | translate }}
            @if (pendingUsers().length > 0) {
              <span class="tab-badge">{{ pendingUsers().length }}</span>
            }
          </button>
          <button class="tab-btn" [class.active]="activeTab() === 'settings'" (click)="activeTab.set('settings')">
            <i class="pi pi-sliders-h mr-2"></i> {{ 'system.config' | translate }}
          </button>
          <button class="tab-btn" [class.active]="activeTab() === 'logs'" (click)="activeTab.set('logs')">
            <i class="pi pi-history mr-2"></i> {{ 'system.audit_logs' | translate }}
          </button>
        </div>

        <!-- Content Area -->
        <div class="fadein">
          
          <!-- Approvals Tab -->
          @if (activeTab() === 'approvals') {
            <div class="glass-card border-round-2xl overflow-hidden shadow-4">
              <p-table [value]="pendingUsers()" styleClass="p-datatable-sm modern-table">
                <ng-template pTemplate="header">
                  <tr>
                    <th>{{ 'users.full_name' | translate }}</th>
                    <th>{{ 'users.username' | translate }}</th>
                    <th>{{ 'users.email' | translate }}</th>
                    <th>{{ 'users.role' | translate }}</th>
                    <th class="text-right">{{ 'common.actions' | translate }}</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-user>
                  <tr>
                    <td class="font-bold">{{ user.fullName }}</td>
                    <td>{{ user.username }}</td>
                    <td>{{ user.email }}</td>
                    <td>
                      <p-tag [value]="user.role" [severity]="user.role === 'Admin' ? 'success' : 'info'"></p-tag>
                    </td>
                    <td class="text-right flex justify-content-end gap-2">
                      <p-button icon="pi pi-check" severity="success" [text]="true" [pTooltip]="'common.approve' | translate" (onClick)="approveUser(user.id)"></p-button>
                      <p-button icon="pi pi-times" severity="danger" [text]="true" [pTooltip]="'common.reject' | translate" (onClick)="rejectUser(user.id)"></p-button>
                    </td>
                  </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                  <tr>
                    <td colspan="5" class="text-center py-6">
                      <div class="flex flex-column align-items-center gap-3 opacity-50">
                        <i class="pi pi-users text-5xl"></i>
                        <p class="m-0 text-lg">{{ 'system.no_pending' | translate }}</p>
                      </div>
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            </div>
          }

          <!-- Settings Tab -->
          @if (activeTab() === 'settings') {
            <div class="grid">
              @for (setting of settings(); track setting.key) {
                <div class="col-12 md:col-6 lg:col-4">
                  <div class="glass-card p-4 border-round-xl h-full flex flex-column justify-content-between hover-lift">
                    <div class="flex flex-column gap-2 mb-4">
                      <div class="flex align-items-center justify-content-between">
                        <span class="text-xs font-bold text-primary uppercase tracking-wider">{{ setting.group }}</span>
                        <span class="text-xs text-secondary">{{ setting.lastUpdated | date:'short' }}</span>
                      </div>
                      <span class="font-bold text-900 text-lg">{{ setting.key }}</span>
                      <span class="text-sm text-secondary opacity-70">{{ setting.description }}</span>
                    </div>
                    
                    <div class="flex align-items-center gap-3 pt-3 border-top-1 border-soft">
                      @if (setting.key === 'MaintenanceMode' || setting.key === 'AllowRegistration') {
                        <p-toggleSwitch [ngModel]="setting.value === 'true'" (ngModelChange)="updateToggleSetting(setting.key, $event)"></p-toggleSwitch>
                        <span class="text-sm font-medium">{{ setting.value === 'true' ? 'Aktif' : 'Pasif' }}</span>
                      } @else {
                        <div class="p-inputgroup flex-1">
                          <input pInputText [(ngModel)]="setting.value" class="p-inputtext-sm" />
                          <button pButton icon="pi pi-save" (click)="saveSetting(setting.key, setting.value)"></button>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          }

          <!-- Logs Tab -->
          @if (activeTab() === 'logs') {
            <div class="glass-card border-round-2xl overflow-hidden shadow-4">
              <p-table [value]="logs()" [paginator]="true" [rows]="15" styleClass="p-datatable-sm modern-table">
                <ng-template pTemplate="header">
                  <tr>
                    <th>{{ 'common.date' | translate }}</th>
                    <th>{{ 'system.log_user' | translate }}</th>
                    <th>{{ 'system.log_action' | translate }}</th>
                    <th>{{ 'system.log_entity' | translate }}</th>
                    <th>{{ 'system.log_details' | translate }}</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-log>
                  <tr>
                    <td class="text-sm">{{ log.timestamp | date:'short' }}</td>
                    <td>
                      <div class="flex flex-column">
                        <span class="font-bold text-sm">{{ log.user?.fullName }}</span>
                        <span class="text-xs opacity-50">{{ log.ipAddress }}</span>
                      </div>
                    </td>
                    <td>
                      <p-tag [value]="log.action" [severity]="getActionSeverity(log.action)"></p-tag>
                    </td>
                    <td>
                      <div class="flex flex-column">
                        <span class="font-medium text-sm">{{ log.entityName }}</span>
                        <span class="text-xs opacity-50">ID: {{ log.entityId }}</span>
                      </div>
                    </td>
                    <td class="text-sm">
                      <div class="max-w-15rem truncate" [pTooltip]="getLogDetail(log)" tooltipPosition="left">
                        {{ getLogDetail(log) }}
                      </div>
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            </div>
          }

        </div>
      </div>
    </div>
  `,
  styles: [`
    .tab-btn {
      padding: 1rem 1.5rem;
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-weight: 600;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      white-space: nowrap;
    }

    .tab-btn:hover {
      color: var(--primary);
      background: var(--primary-glow);
    }

    .tab-btn.active {
      color: var(--primary);
      border-bottom-color: var(--primary);
    }

    .tab-badge {
      background: #ef4444;
      color: white;
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 10px;
      margin-left: 8px;
    }

    .tab-content {
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .hover-lift:hover {
      transform: translateY(-4px);
    }
  `]
})
export class SystemManagementComponent implements OnInit {
  authService = inject(AuthService);
  settingsService = inject(SystemSettingsService);
  logService = inject(AuditLogService);
  messageService = inject(MessageService);

  activeTab = signal('approvals');
  pendingUsers = signal<User[]>([]);
  settings = signal<SystemSetting[]>([]);
  logs = signal<AuditLog[]>([]);

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.loadPending();
    this.loadSettings();
    this.loadLogs();
  }

  loadPending() {
    this.authService.getPendingUsers().subscribe(users => this.pendingUsers.set(users));
  }

  loadSettings() {
    this.settingsService.getSettings().subscribe(res => this.settings.set(res));
  }

  loadLogs() {
    this.logService.getLogs().subscribe(res => this.logs.set(res));
  }

  approveUser(id: number) {
    this.authService.approveUser(id).subscribe(() => {
      this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'Kullanıcı onaylandı.' });
      this.loadPending();
    });
  }

  rejectUser(id: number) {
    this.authService.rejectUser(id).subscribe(() => {
      this.messageService.add({ severity: 'warn', summary: 'Bilgi', detail: 'Kayıt talebi reddedildi.' });
      this.loadPending();
    });
  }

  saveSetting(key: string, value: string) {
    this.settingsService.updateSetting(key, value).subscribe(() => {
      this.messageService.add({ severity: 'success', summary: 'Güncellendi', detail: `${key} ayarı kaydedildi.` });
      this.loadSettings();
    });
  }

  updateToggleSetting(key: string, checked: boolean) {
    this.saveSetting(key, checked ? 'true' : 'false');
  }

  getActionSeverity(action: string) {
    switch (action.toLowerCase()) {
      case 'create': return 'success';
      case 'update': return 'info';
      case 'delete': return 'danger';
      case 'login': return 'secondary';
      default: return 'info';
    }
  }

  getLogDetail(log: AuditLog) {
    if (log.newValues && !log.oldValues) return `Yeni: ${log.newValues}`;
    if (log.oldValues && log.newValues) return `${log.oldValues} -> ${log.newValues}`;
    if (log.oldValues) return `Eski: ${log.oldValues}`;
    return log.action;
  }
}

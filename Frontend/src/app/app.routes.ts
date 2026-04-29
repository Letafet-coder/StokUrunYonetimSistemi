import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { ProductsComponent } from './components/products/products.component';
import { StockMovementsComponent } from './components/stock-movements/stock-movements.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SettingsComponent } from './components/settings/settings.component';
import { UsersComponent } from './components/users/users.component';
import { InventoryCountComponent } from './components/inventory-count/inventory-count.component';
import { authGuard, adminGuard, superAdminGuard } from './guards/auth.guard';
import { SystemManagementComponent } from './components/system-management/system-management.component';

export const routes: Routes = [
    // Public rotalar — auth gerektirmez
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },

    // Korumalı rotalar — giriş yapılmış olmalı
    { 
        path: '', 
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardComponent },
            { path: 'categories', component: CategoriesComponent },
            { path: 'products', component: ProductsComponent },
            { path: 'movements', component: StockMovementsComponent },
            { path: 'inventory-audit', component: InventoryCountComponent },
            { path: 'warehouses', loadComponent: () => import('./components/warehouses/warehouses.component').then(c => c.WarehousesComponent) },
            { path: 'locations', loadComponent: () => import('./components/locations/locations.component').then(c => c.LocationsComponent) },
            { path: 'lots', loadComponent: () => import('./components/lot-serials/lot-serials.component').then(c => c.LotSerialsComponent) },
            { path: 'profile', component: ProfileComponent },
            { path: 'settings', component: SettingsComponent },

            // Admin-only rotalar — adminGuard ile korunur
            { 
                path: 'users', 
                component: UsersComponent,
                canActivate: [adminGuard]
            },
            {
                path: 'reports',
                loadComponent: () => import('./components/reports/reports.component').then(c => c.ReportsComponent),
                canActivate: [adminGuard]
            },
            {
                path: 'invoices',
                loadComponent: () => import('./components/invoices/invoices.component').then(m => m.InvoicesComponent),
                canActivate: [adminGuard]
            },
            {
                path: 'bulk-stock',
                loadComponent: () => import('./components/bulk-stock/bulk-stock.component').then(m => m.BulkStockComponent),
                canActivate: [adminGuard]
            },
            {
                path: 'system-management',
                component: SystemManagementComponent,
                canActivate: [superAdminGuard]
            }
        ]
    },
    { path: '**', redirectTo: 'dashboard' }
];

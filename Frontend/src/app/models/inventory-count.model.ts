import { Product } from './product.model';
import { User } from './user.model';

export interface InventoryCount {
  id?: number;
  date: Date | string;
  description?: string;
  status: string; // 'Completed', 'Draft'
  warehouseId?: number;
  createdByUserId: number;
  createdByUser?: User;
  items: InventoryCountItem[];
}

export interface InventoryCountItem {
  id?: number;
  inventoryCountId?: number;
  productId: number;
  product?: Product;
  theoreticalQuantity: number;
  countedQuantity: number;
  difference?: number; // Calculated property usually
}

export interface ProductForCount {
  id: number;
  name: string;
  sku: string;
  stockQuantity: number;
  unit: string;
  categoryName: string;
  // Local UI properties
  countedQuantity?: number;
}

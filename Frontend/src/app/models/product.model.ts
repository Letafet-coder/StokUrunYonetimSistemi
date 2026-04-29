import { Category } from './category.model';

export enum TrackingType {
    None = 0,
    Lot = 1,
    Serial = 2
}

export interface Product {
    id?: number;
    name: string;
    description?: string;
    categoryId: number;
    category?: Category;
    price: number;
    stockQuantity: number;
    criticalLevel: number;
    unit: string;
    sku?: string;
    tracking?: TrackingType;
    productStocks?: any[];
}

import { Product } from "./product.model";

export enum InvoiceType {
    Purchase = 'Purchase',
    Sale = 'Sale'
}

export enum InvoiceStatus {
    Draft = 'Draft',
    Pending = 'Pending',
    Paid = 'Paid',
    Cancelled = 'Cancelled'
}

export interface Invoice {
    id?: number;
    invoiceNumber: string;
    date: Date;
    customerSupplierName: string;
    type: InvoiceType;
    status: InvoiceStatus;
    totalAmount: number;
    notes?: string;
    items: InvoiceItem[];
}

export interface InvoiceItem {
    id?: number;
    invoiceId?: number;
    productId: number;
    product?: Product;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

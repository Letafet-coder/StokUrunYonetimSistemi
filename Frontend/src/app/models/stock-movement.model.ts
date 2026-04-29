import { Product } from './product.model';

export enum MovementType {
    In = 0,
    Out = 1,
    Adjustment = 2,
    Transfer = 3
}

export interface StockMovement {
    id?: number;
    productId: number;
    product?: Product;
    quantity: number;
    type: MovementType;
    date: string;
    fromLocationId?: number;
    fromLocation?: any;
    toLocationId?: number;
    toLocation?: any;
    lotSerialId?: number;
    lotSerial?: any;
    description?: string;
    supplierOrClient?: string;
    documentNumber?: string;
}

export interface Warehouse {
  id: number;
  name: string;
  code: string;
  address?: string;
}

export enum LocationType {
  Internal = 0,
  Scrap = 1,
  Transit = 2,
  View = 3
}

export interface StorageLocation {
  id: number;
  name: string;
  warehouseId: number;
  warehouse?: Warehouse;
  type: LocationType;
  aisle?: string;
  rack?: string;
  level?: string;
  position?: string;
  shelfCode?: string;
}

export type ProductUnitType = "UNIT" | "HUNDRED" | "KIT" | "KG" | "TRAY";
export type ProductOrderStatus =
  | "RECEIVED"
  | "CONFIRMED"
  | "AWAITING_PAYMENT"
  | "PAID"
  | "IN_PRODUCTION"
  | "READY"
  | "DELIVERED"
  | "CANCELLED";
export type ProductPaymentStatus = "PENDING" | "PARTIALLY_PAID" | "PAID";
export type FulfillmentType = "PICKUP" | "DELIVERY";

export interface OrderStoreSettings {
  orderModuleEnabled: boolean;
  storeWhatsappPhone: string | null;
  storePixKey: string | null;
  storePixReceiverName: string | null;
  storePickupInstructions: string | null;
  storeDeliveryInstructions: string | null;
  storeMinimumOrderValue: number | null;
  storeMinimumLeadTimeHours: number | null;
  storeActive: boolean;
}

export interface PublicOrderStore {
  id: string;
  slug: string;
  storeName: string;
  description: string | null;
  logoUrl: string | null;
  whatsappPhone?: string | null;
  pixKey?: string | null;
  pixReceiverName?: string | null;
  pickupInstructions?: string | null;
  deliveryInstructions?: string | null;
  minimumOrderValue?: number | null;
  minimumLeadTimeHours?: number | null;
  active?: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  unitType: ProductUnitType;
  minimumQuantity: number;
  sortOrder: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PublicMenuCategory {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  products: Product[];
}

export interface PublicOrderStoreResponse {
  store: PublicOrderStore;
}

export interface PublicOrderMenuResponse {
  store: Pick<PublicOrderStore, "id" | "slug" | "storeName" | "description" | "logoUrl">;
  categories: PublicMenuCategory[];
}

export interface CreatePublicProductOrderInput {
  customerName: string;
  customerPhone: string;
  desiredDate: string;
  fulfillmentType: FulfillmentType;
  address?: string | null;
  notes?: string | null;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface CreatePublicProductOrderResponse {
  order: {
    id: string;
    orderNumber: string;
    status: ProductOrderStatus;
    paymentStatus: ProductPaymentStatus;
    totalAmount: number;
  };
}

export interface ProductOrderItemSnapshot {
  id: string;
  productNameSnapshot: string;
  unitTypeSnapshot: ProductUnitType;
  quantity: number;
  unitPriceSnapshot: number;
  subtotal: number;
}

export interface ProductOrder {
  id: string;
  tenantId?: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  desiredDate: string;
  fulfillmentType: FulfillmentType;
  address: string | null;
  notes: string | null;
  status: ProductOrderStatus;
  paymentStatus: ProductPaymentStatus;
  totalAmount: number;
  amountPaid?: number;
  items?: ProductOrderItemSnapshot[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ManualPaymentLog {
  id: string;
  amount: number;
  status: ProductPaymentStatus;
  notes: string | null;
  createdAt: string;
}

export interface PublicOrderConfirmationResponse {
  order: ProductOrder & { items: ProductOrderItemSnapshot[] };
  store: {
    storeName: string;
    pixKey: string | null;
    pixReceiverName: string | null;
    whatsappPhone: string | null;
    pickupInstructions: string | null;
    deliveryInstructions: string | null;
  };
  whatsappUrl: string | null;
}

export interface SaveProductCategoryInput {
  name: string;
  description?: string | null;
  sortOrder?: number;
  active?: boolean;
}

export interface SaveProductInput {
  categoryId: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  price: number;
  unitType: ProductUnitType;
  minimumQuantity: number;
  sortOrder?: number;
  active?: boolean;
}

export interface ListProductOrdersFilters {
  desiredDate?: string;
  status?: ProductOrderStatus;
}

export interface UpdateProductOrderStatusInput {
  status: ProductOrderStatus;
  paymentStatus?: ProductPaymentStatus;
}

export interface RegisterManualPaymentInput {
  amount: number;
  notes?: string | null;
}

export interface ProductionSummaryResponse {
  date: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitType: ProductUnitType;
  }>;
}

import { httpClient } from "@/lib/http-client";
import type {
  CreatePublicProductOrderInput,
  CreatePublicProductOrderResponse,
  ListProductOrdersFilters,
  ManualPaymentLog,
  OrderStoreSettings,
  Product,
  ProductCategory,
  ProductOrder,
  ProductionSummaryResponse,
  PublicOrderConfirmationResponse,
  PublicOrderMenuResponse,
  PublicOrderStoreResponse,
  RegisterManualPaymentInput,
  SaveProductCategoryInput,
  SaveProductInput,
  UpdateProductOrderStatusInput,
} from "@/types/order-module";

function buildQuery(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

export const orderModuleService = {
  getOrderSettings(): Promise<OrderStoreSettings> {
    return httpClient<OrderStoreSettings>("/tenants/me/order-settings");
  },

  updateOrderSettings(input: Partial<OrderStoreSettings>): Promise<OrderStoreSettings> {
    return httpClient<OrderStoreSettings>("/tenants/me/order-settings", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  getPublicStore(slug: string): Promise<PublicOrderStoreResponse> {
    return httpClient<PublicOrderStoreResponse>(`/public/order-stores/${slug}`, {
      skipAuth: true,
    });
  },

  getPublicMenu(slug: string): Promise<PublicOrderMenuResponse> {
    return httpClient<PublicOrderMenuResponse>(`/public/order-stores/${slug}/menu`, {
      skipAuth: true,
    });
  },

  createPublicOrder(
    slug: string,
    input: CreatePublicProductOrderInput,
  ): Promise<CreatePublicProductOrderResponse> {
    return httpClient<CreatePublicProductOrderResponse>(`/public/order-stores/${slug}/orders`, {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify(input),
    });
  },

  getPublicOrderConfirmation(
    slug: string,
    orderNumber: string,
  ): Promise<PublicOrderConfirmationResponse> {
    return httpClient<PublicOrderConfirmationResponse>(
      `/public/order-stores/${slug}/orders/${orderNumber}/confirmation`,
      {
        skipAuth: true,
      },
    );
  },

  listCategories(): Promise<{ categories: ProductCategory[] }> {
    return httpClient<{ categories: ProductCategory[] }>("/product-categories");
  },

  createCategory(input: SaveProductCategoryInput): Promise<{ category: ProductCategory }> {
    return httpClient<{ category: ProductCategory }>("/product-categories", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  updateCategory(
    id: string,
    input: Partial<SaveProductCategoryInput>,
  ): Promise<{ category: ProductCategory }> {
    return httpClient<{ category: ProductCategory }>(`/product-categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  listProducts(): Promise<{ products: Product[] }> {
    return httpClient<{ products: Product[] }>("/products");
  },

  createProduct(input: SaveProductInput): Promise<{ product: Product }> {
    return httpClient<{ product: Product }>("/products", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  updateProduct(id: string, input: Partial<SaveProductInput>): Promise<{ product: Product }> {
    return httpClient<{ product: Product }>(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  listOrders(filters: ListProductOrdersFilters): Promise<{ orders: ProductOrder[] }> {
    return httpClient<{ orders: ProductOrder[] }>(
      `/product-orders${buildQuery({
        desiredDate: filters.desiredDate,
        status: filters.status,
      })}`,
    );
  },

  getOrder(id: string): Promise<{ order: ProductOrder; payments: ManualPaymentLog[] }> {
    return httpClient<{ order: ProductOrder; payments: ManualPaymentLog[] }>(
      `/product-orders/${id}`,
    );
  },

  updateOrderStatus(
    id: string,
    input: UpdateProductOrderStatusInput,
  ): Promise<{ order: ProductOrder }> {
    return httpClient<{ order: ProductOrder }>(`/product-orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  registerManualPayment(
    id: string,
    input: RegisterManualPaymentInput,
  ): Promise<{ order: ProductOrder }> {
    return httpClient<{ order: ProductOrder }>(`/product-orders/${id}/manual-payments`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  getProductionSummary(desiredDate: string): Promise<ProductionSummaryResponse> {
    return httpClient<ProductionSummaryResponse>(
      `/product-orders/production${buildQuery({ desiredDate })}`,
    );
  },
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderModuleService } from "@/services/order-module-service";
import { systemAdminService } from "@/services/system-admin-service";
import type {
  CreatePublicProductOrderInput,
  ListProductOrdersFilters,
  OrderStoreSettings,
  RegisterManualPaymentInput,
  SaveProductCategoryInput,
  SaveProductInput,
  UpdateProductOrderStatusInput,
} from "@/types/order-module";

export function useOrderSettingsQuery() {
  return useQuery({
    queryKey: ["order-settings"],
    queryFn: orderModuleService.getOrderSettings,
  });
}

export function useUpdateOrderSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderModuleService.updateOrderSettings,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["order-settings"] });
    },
  });
}

export function useSystemAdminTenantOrderSettingsQuery(tenantId?: string | null) {
  return useQuery({
    queryKey: ["system-admin", "tenant-order-settings", tenantId ?? ""],
    queryFn: () => systemAdminService.getTenantOrderSettings(tenantId as string),
    enabled: Boolean(tenantId),
  });
}

export function useUpdateSystemAdminTenantOrderSettingsMutation(tenantId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Partial<OrderStoreSettings>) =>
      systemAdminService.updateTenantOrderSettings(tenantId as string, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["system-admin", "tenant-order-settings", tenantId ?? ""],
      });
    },
  });
}

export function usePublicOrderStoreQuery(slug?: string) {
  return useQuery({
    queryKey: ["public-order-store", slug],
    queryFn: () => orderModuleService.getPublicStore(slug as string),
    enabled: Boolean(slug),
  });
}

export function usePublicOrderMenuQuery(slug?: string) {
  return useQuery({
    queryKey: ["public-order-menu", slug],
    queryFn: () => orderModuleService.getPublicMenu(slug as string),
    enabled: Boolean(slug),
  });
}

export function useCreatePublicProductOrderMutation(slug?: string) {
  return useMutation({
    mutationFn: (input: CreatePublicProductOrderInput) =>
      orderModuleService.createPublicOrder(slug as string, input),
  });
}

export function usePublicOrderConfirmationQuery(slug?: string, orderNumber?: string) {
  return useQuery({
    queryKey: ["public-order-confirmation", slug, orderNumber],
    queryFn: () =>
      orderModuleService.getPublicOrderConfirmation(slug as string, orderNumber as string),
    enabled: Boolean(slug && orderNumber),
  });
}

export function useProductCategoriesQuery() {
  return useQuery({
    queryKey: ["product-categories"],
    queryFn: orderModuleService.listCategories,
  });
}

export function useCreateProductCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SaveProductCategoryInput) => orderModuleService.createCategory(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["product-categories"] });
    },
  });
}

export function useUpdateProductCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<SaveProductCategoryInput> }) =>
      orderModuleService.updateCategory(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["product-categories"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useProductsQuery() {
  return useQuery({
    queryKey: ["products"],
    queryFn: orderModuleService.listProducts,
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SaveProductInput) => orderModuleService.createProduct(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<SaveProductInput> }) =>
      orderModuleService.updateProduct(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useProductOrdersQuery(filters: ListProductOrdersFilters) {
  return useQuery({
    queryKey: ["product-orders", filters.desiredDate ?? "", filters.status ?? ""],
    queryFn: () => orderModuleService.listOrders(filters),
  });
}

export function useProductOrderQuery(id?: string) {
  return useQuery({
    queryKey: ["product-order", id],
    queryFn: () => orderModuleService.getOrder(id as string),
    enabled: Boolean(id),
  });
}

export function useUpdateProductOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProductOrderStatusInput }) =>
      orderModuleService.updateOrderStatus(id, input),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["product-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["product-order", variables.id] });
    },
  });
}

export function useRegisterProductOrderManualPaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RegisterManualPaymentInput }) =>
      orderModuleService.registerManualPayment(id, input),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["product-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["product-order", variables.id] });
    },
  });
}

export function useProductionSummaryQuery(desiredDate?: string) {
  return useQuery({
    queryKey: ["product-orders-production", desiredDate ?? ""],
    queryFn: () => orderModuleService.getProductionSummary(desiredDate as string),
    enabled: Boolean(desiredDate),
  });
}

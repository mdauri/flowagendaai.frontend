import type { Product } from "@/types/order-module";

export interface OrderCartItem {
  productId: string;
  productName: string;
  unitType: Product["unitType"];
  unitPrice: number;
  minimumQuantity: number;
  quantity: number;
}

function cartStorageKey(slug: string) {
  return `agendoro:order-cart:${slug}`;
}

export function readOrderCart(slug: string): OrderCartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(cartStorageKey(slug));
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as OrderCartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeOrderCart(slug: string, items: OrderCartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(cartStorageKey(slug), JSON.stringify(items));
}

export function clearOrderCart(slug: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(cartStorageKey(slug));
}

export function upsertOrderCartItem(slug: string, product: Product, quantity: number) {
  const nextItems = [...readOrderCart(slug)];
  const index = nextItems.findIndex((item) => item.productId === product.id);

  if (quantity <= 0) {
    if (index >= 0) {
      nextItems.splice(index, 1);
    }
  } else {
    const nextItem: OrderCartItem = {
      productId: product.id,
      productName: product.name,
      unitType: product.unitType,
      unitPrice: product.price,
      minimumQuantity: product.minimumQuantity,
      quantity,
    };

    if (index >= 0) {
      nextItems[index] = nextItem;
    } else {
      nextItems.push(nextItem);
    }
  }

  writeOrderCart(slug, nextItems);
  return nextItems;
}

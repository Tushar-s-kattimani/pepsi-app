import { Timestamp } from "firebase/firestore";

export type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  size: string;
  stock: number;
  imageUrl: string;
  imageHint: string;
};

export type Order = {
  id: string;
  shopId: string;
  shopName?: string; // Denormalized for display
  orderDate: Timestamp;
  status: 'Pending' | 'Confirmed' | 'Dispatched' | 'Delivered' | 'Cancelled';
  totalAmount: number;
  itemCount: number;
};

export type StockItem = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  maxQuantity: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
};

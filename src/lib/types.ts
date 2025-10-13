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
  shopName: string;
  date: string;
  total: number;
  status: 'Pending' | 'Confirmed' | 'Dispatched' | 'Delivered' | 'Cancelled';
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

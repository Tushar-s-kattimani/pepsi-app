import type { Product, Order, StockItem } from './types';

export const products: Product[] = [
  { id: '1', name: 'Pepsi Classic', sku: 'PEP-CL-330', price: 1.20, size: '330ml Can', stock: 1500, imageUrl: "https://picsum.photos/seed/pepsi1/400/400", imageHint: 'soda can' },
  { id: '2', name: 'Pepsi Bottle', sku: 'PEP-CL-500', price: 1.80, size: '500ml Bottle', stock: 1200, imageUrl: "https://picsum.photos/seed/pepsi2/400/400", imageHint: 'soda bottle' },
  { id: '3', name: 'Diet Pepsi', sku: 'PEP-DT-330', price: 1.20, size: '330ml Can', stock: 800, imageUrl: "https://picsum.photos/seed/pepsi3/400/400", imageHint: 'soda can' },
  { id: '4', name: 'Pepsi Zero Sugar', sku: 'PEP-ZS-500', price: 1.80, size: '500ml Bottle', stock: 950, imageUrl: "https://picsum.photos/seed/pepsi4/400/400", imageHint: 'soda bottle' },
  { id: '5', name: 'Pepsi Max', sku: 'PEP-MX-330', price: 1.25, size: '330ml Can', stock: 0, imageUrl: "https://picsum.photos/seed/pepsi5/400/400", imageHint: 'soda can' },
  { id: '6', name: 'Pepsi Wild Cherry', sku: 'PEP-CH-500', price: 1.90, size: '500ml Bottle', stock: 450, imageUrl: "https://picsum.photos/seed/pepsi6/400/400", imageHint: 'soda bottle' },
];

export const orders: Order[] = [
  { id: 'ORD-001', shopName: 'City Mart', date: '2023-10-26', total: 240.50, status: 'Delivered', itemCount: 5 },
  { id: 'ORD-002', shopName: 'Quick Stop', date: '2023-10-26', total: 180.00, status: 'Delivered', itemCount: 3 },
  { id: 'ORD-003', shopName: 'The Corner Store', date: '2023-10-27', total: 350.75, status: 'Dispatched', itemCount: 8 },
  { id: 'ORD-004', shopName: 'Highway Grocers', date: '2023-10-27', total: 500.00, status: 'Confirmed', itemCount: 12 },
  { id: 'ORD-005', shopName: 'City Mart', date: '2023-10-28', total: 120.00, status: 'Pending', itemCount: 2 },
  { id: 'ORD-006', shopName: 'Campus Canteen', date: '2023-10-28', total: 75.25, status: 'Cancelled', itemCount: 4 },
  { id: 'ORD-007', shopName: 'Riverside Cafe', date: '2023-10-28', total: 210.00, status: 'Pending', itemCount: 6 },
];

export const stockItems: StockItem[] = products.map(p => {
    const maxQuantity = 2000;
    const quantity = p.stock;
    let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
    if (quantity === 0) {
        status = 'Out of Stock';
    } else if (quantity < 500) {
        status = 'Low Stock';
    }
    return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        quantity: quantity,
        maxQuantity: maxQuantity,
        status: status,
    }
});

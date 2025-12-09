export enum PaymentStatus {
  Paid = 'Paid',
  Unpaid = 'Unpaid',
}

export enum DeliveryStatus {
  Delivered = 'Delivered',
  Pending = 'Pending',
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phoneNumber: string;
  items: string;
  totalPrice: number;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  notes: string;
  createdAt: number;
}

export interface OrderStats {
  totalSales: number;
  totalOrders: number;
  paidOrders: number;
  unpaidOrders: number;
  deliveredOrders: number;
  pendingOrders: number;
}

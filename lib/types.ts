export type Merchant = {
  id: string;
  name: string;
  ownerPhone: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  maxUsers: number;
  notes?: string;
  plan: 'basic' | 'pro' | 'advanced';
};

export type UserRole = 'Admin' | 'Orders_Staff' | 'Purchasing_Staff' | 'Accountant' | 'Delivery_Staff' | 'Courier' | 'Investor_Partner' | 'SuperAdmin';
export type User = {
  id: string;
  merchantId: string;
  username: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  pin?: string;
};

export type CustomerRating = 'VIP' | 'Good' | 'Late_Payer' | 'Blacklisted';
export type Customer = {
  id: string;
  merchantId: string;
  name: string;
  phone: string;
  rating: CustomerRating;
  creditBalance: number;
  shoeSize?: string;
  clothingSize?: string;
  notes?: string;
  createdAt: string;
};

export type Supplier = { id: string; merchantId: string; name: string; phone: string; whatsapp: string; category: string };
export type SheinOrder = {
  id: string; merchantId: string; orderDate: string; tracking: string; courier: string;
  totalForeign: number; discount: number; netPaid: number; currency: string; rate: number; status: string;
};
export type Coupon = {
  id: string; merchantId: string; code: string; type: 'Percentage' | 'Fixed_Amount' | 'Free_Delivery';
  value: number; group?: string; expiry: string; isActive: boolean;
};

export type OrderStatus = 'Pending_Deposit' | 'Confirmed' | 'Purchased' | 'Shipped' | 'Arrived' | 'At_Pickup' | 'Delivered' | 'Returned' | 'Cancelled';
export type PickupStatus = 'Awaiting_Pickup' | 'Collected' | 'Overdue_Pending_Admin_Review' | 'Returned';
export type Order = {
  id: string; merchantId: string; barcode: string; customerId: string; orderDate: string;
  source: string; groupName?: string;
  deliveryType: 'Delivery_Point' | 'Courier';
  deliveryPointId?: string; courierId?: string;
  status: OrderStatus;
  totalAmount: number; discount: number; depositPaid: number; remaining: number;
  depositTimer?: string;
  pickupDepositedAt?: string;
  pickupStatus?: PickupStatus;
  isDeadStock?: boolean;
  audioNote?: string;
  isDebt?: boolean;
  debtDue?: string;
  cartLink?: string;
  notes?: string;
};

export type OrderItem = {
  id: string; orderId: string; name: string; image?: string; category?: string;
  supplierId?: string; sheinOrderId?: string; sku?: string; url?: string;
  color?: string; size?: string; qty: number; purchasePrice: number; purchaseCurrency: string; rate: number; sellingPrice: number; status: string;
};

export type DeliveryPoint = { id: string; merchantId: string; name: string; phone: string; address: string; contact: string; settlement: 'Cash' | 'Bank_Transfer' | 'Both'; bankInfo?: string };
export type Manifest = { id: string; merchantId: string; pointId: string; createdAt: string; count: number; total: number; status: 'Generated' | 'Delivered_To_Point' | 'Settled' };
export type FinancialApproval = { id: string; merchantId: string; requestedBy: string; type: 'Debt_Cancellation' | 'Cash_Refund' | 'Rate_Adjustment'; orderId: string; amount: number; reason: string; status: 'Pending' | 'Approved' | 'Rejected'; approvedBy?: string; timestamp: string };
export type Transaction = { id: string; merchantId: string; orderId?: string; customerId?: string; type: string; amount: number; currency: string; method: string; createdAt: string; createdBy: string; receipt?: string };
export type Expense = { id: string; merchantId: string; category: string; amount: number; notes?: string; date: string; userId: string };
export type PointSettlement = { id: string; merchantId: string; pointId: string; date: string; cash: number; bank: number; net: number; status: 'Pending' | 'Settled' };
export type CourierSettlement = { id: string; merchantId: string; courierId: string; date: string; cash: number; transfers: number; net: number; status: string };
export type ReturnDamage = { id: string; merchantId: string; orderId: string; itemId?: string; type: 'Customer_Return' | 'Non_Pickup_Return' | 'Damaged_In_Transit' | 'Spec_Mismatch'; destination: 'Local_Supplier_Refund' | 'Shein_Loss_Writeoff' | 'Resell_To_Other_Customer'; qty: number; action: 'Cash_Refund' | 'Customer_Credit_Balance' | 'Supplier_Refund' | 'Expense_Loss'; amount: number; notes?: string; date: string };
export type Currency = { code: string; name: string; rate: number; isBase: boolean };
export type AuditLog = { id: string; merchantId: string; userId: string; action: string; target: string; details: string; timestamp: string };

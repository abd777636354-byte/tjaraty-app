import { Merchant, User, Customer, Supplier, SheinOrder, Coupon, Order, OrderItem, DeliveryPoint, Manifest, FinancialApproval, Transaction, Expense, Currency } from './types';

export const mockCurrencies: Currency[] = [
  { code: 'YER', name: 'ريال يمني', rate: 1, isBase: true },
  { code: 'SAR', name: 'ريال سعودي', rate: 140, isBase: false },
  { code: 'USD', name: 'دولار أمريكي', rate: 530, isBase: false },
  { code: 'CNY', name: 'يوان صيني', rate: 75, isBase: false },
];

export const mockMerchants: Merchant[] = [
  { id: 'm1', name: 'متجر الأناقة - صنعاء', ownerPhone: '777123456', startDate: new Date(Date.now()-200*86400000).toISOString(), endDate: new Date(Date.now()+12*86400000).toISOString(), isActive: true, maxUsers: 10, plan: 'pro', notes: 'مشترك مميز' },
  { id: 'm2', name: 'عالم شي إن - عدن', ownerPhone: '777987654', startDate: new Date(Date.now()-300*86400000).toISOString(), endDate: new Date(Date.now()-2*86400000).toISOString(), isActive: false, maxUsers: 5, plan: 'basic' },
  { id: 'm3', name: 'لمسة حرير - تعز', ownerPhone: '712345678', startDate: new Date(Date.now()-10*86400000).toISOString(), endDate: new Date(Date.now()+350*86400000).toISOString(), isActive: true, maxUsers: 20, plan: 'advanced' },
];

export const mockUsers: User[] = [
  { id: 'u1', merchantId: 'm1', username: 'admin', fullName: 'أحمد المدير', role: 'Admin', isActive: true, pin: '1234' },
  { id: 'u2', merchantId: 'm1', username: 'orders1', fullName: 'سارة المبيعات', role: 'Orders_Staff', isActive: true },
  { id: 'u3', merchantId: 'm1', username: 'courier1', fullName: 'محمد المندوب', role: 'Courier', isActive: true },
  { id: 'u4', merchantId: 'm1', username: 'investor1', fullName: 'خالد المستثمر', role: 'Investor_Partner', isActive: true },
  { id: 'super', merchantId: 'm1', username: 'superadmin', fullName: 'د. عبدالله الحميري', role: 'SuperAdmin', isActive: true },
];

export const mockCustomers: Customer[] = [
  { id: 'c1', merchantId: 'm1', name: 'نورة أحمد', phone: '777111222', rating: 'VIP', creditBalance: 12500, shoeSize: '38', clothingSize: 'M', notes: 'عميلة مميزة دائمة', createdAt: new Date().toISOString() },
  { id: 'c2', merchantId: 'm1', name: 'فاطمة علي', phone: '777333444', rating: 'Good', creditBalance: 0, shoeSize: '39', clothingSize: 'L', createdAt: new Date().toISOString() },
  { id: 'c3', merchantId: 'm1', name: 'مريم صالح', phone: '733555666', rating: 'Late_Payer', creditBalance: 0, createdAt: new Date().toISOString() },
  { id: 'c4', merchantId: 'm1', name: 'هند محمد', phone: '777777888', rating: 'Blacklisted', creditBalance: 0, notes: 'كثيرة الإلغاء - تنبيه!', createdAt: new Date().toISOString() },
  { id: 'c5', merchantId: 'm1', name: 'أسماء عبدالله', phone: '771234567', rating: 'VIP', creditBalance: 32000, shoeSize: '37', clothingSize: 'S', createdAt: new Date().toISOString() },
];

export const mockSuppliers: Supplier[] = [
  { id: 's1', merchantId: 'm1', name: 'مصنع النور للملابس', phone: '777000111', whatsapp: '967777000111', category: 'ملابس نسائية' },
  { id: 's2', merchantId: 'm1', name: 'تاجر الجملة - عدن', phone: '777000222', whatsapp: '967777000222', category: 'أحذية وحقائب' },
];

export const mockSheinOrders: SheinOrder[] = [
  { id: 'sh1', merchantId: 'm1', orderDate: new Date(Date.now()-5*86400000).toISOString(), tracking: 'SHEIN-YE-88421', courier: 'DHL', totalForeign: 245, discount: 45, netPaid: 200, currency: 'USD', rate: 530, status: 'Shipped' },
  { id: 'sh2', merchantId: 'm1', orderDate: new Date(Date.now()-2*86400000).toISOString(), tracking: 'SHEIN-YE-88422', courier: 'Aramex', totalForeign: 180, discount: 20, netPaid: 160, currency: 'USD', rate: 530, status: 'Purchased' },
];

export const mockCoupons: Coupon[] = [
  { id: 'cp1', merchantId: 'm1', code: 'EID25', type: 'Percentage', value: 15, group: 'جروب VIP', expiry: new Date(Date.now()+30*86400000).toISOString(), isActive: true },
  { id: 'cp2', merchantId: 'm1', code: 'FREEDEL', type: 'Free_Delivery', value: 0, expiry: new Date(Date.now()+10*86400000).toISOString(), isActive: true },
];

export const mockPoints: DeliveryPoint[] = [
  { id: 'p1', merchantId: 'm1', name: 'محل الأمانة - التحرير', phone: '777888999', address: 'صنعاء - التحرير - جوار البريد', contact: 'أبو أحمد', settlement: 'Cash' },
  { id: 'p2', merchantId: 'm1', name: 'محل سبأ - حدة', phone: '777666555', address: 'حدة - شارع صفر', contact: 'أم سعيد', settlement: 'Bank_Transfer', bankInfo: 'الكريمي 123456789' },
];

export const mockOrders: Order[] = [
  { id: 'ORD-2026-000125', merchantId: 'm1', barcode: 'ORD-2026-000125', customerId: 'c1', orderDate: new Date(Date.now()-1*86400000).toISOString(), source: 'WhatsApp', groupName: 'أناقة 1', deliveryType: 'Delivery_Point', deliveryPointId: 'p1', status: 'Arrived', totalAmount: 45000, discount: 5000, depositPaid: 15000, remaining: 25000, pickupStatus: 'Awaiting_Pickup', pickupDepositedAt: new Date(Date.now()-2*86400000).toISOString(), cartLink: 'https://tjaraty.app/cart/ORD-2026-000125' },
  { id: 'ORD-2026-000126', merchantId: 'm1', barcode: 'ORD-2026-000126', customerId: 'c3', orderDate: new Date().toISOString(), source: 'SHEIN', deliveryType: 'Courier', courierId: 'u3', status: 'Pending_Deposit', totalAmount: 38000, discount: 0, depositPaid: 0, remaining: 38000, depositTimer: new Date(Date.now()+12*3600000).toISOString() },
  { id: 'ORD-2026-000127', merchantId: 'm1', barcode: 'ORD-2026-000127', customerId: 'c4', orderDate: new Date(Date.now()-10*86400000).toISOString(), source: 'WhatsApp', groupName: 'عام', deliveryType: 'Delivery_Point', deliveryPointId: 'p2', status: 'At_Pickup', totalAmount: 62000, discount: 0, depositPaid: 62000, remaining: 0, pickupStatus: 'Overdue_Pending_Admin_Review', isDebt: false, pickupDepositedAt: new Date(Date.now()-7*86400000).toISOString() },
  { id: 'ORD-2026-000128', merchantId: 'm1', barcode: 'ORD-2026-000128', customerId: 'c2', orderDate: new Date(Date.now()-3*86400000).toISOString(), source: 'WhatsApp', deliveryType: 'Courier', courierId: 'u3', status: 'Shipped', totalAmount: 29000, discount: 2000, depositPaid: 10000, remaining: 17000 },
  { id: 'ORD-2026-000129', merchantId: 'm1', barcode: 'ORD-2026-000129', customerId: 'c5', orderDate: new Date(Date.now()-6*86400000).toISOString(), source: 'SHEIN', deliveryType: 'Delivery_Point', deliveryPointId: 'p1', status: 'Delivered', totalAmount: 78000, discount: 8000, depositPaid: 70000, remaining: 0, pickupStatus: 'Collected', isDebt: true, debtDue: new Date(Date.now()+5*86400000).toISOString().slice(0,10) },
];

export const mockOrderItems: OrderItem[] = [
  { id: 'it1', orderId: 'ORD-2026-000125', name: 'فستان سهرة مخمل - SHEIN', sku: 'SW220815-2', qty: 1, purchasePrice: 32, purchaseCurrency: 'USD', rate: 530, sellingPrice: 45000, status: 'Arrived', color: 'خمري', size: 'M', category: 'فساتين', sheinOrderId: 'sh1' },
  { id: 'it2', orderId: 'ORD-2026-000125', name: 'حقيبة كتف جلدية', qty: 1, purchasePrice: 15000, purchaseCurrency: 'YER', rate: 1, sellingPrice: 18000, status: 'Arrived', supplierId: 's1' },
  { id: 'it3', orderId: 'ORD-2026-000126', name: 'طقم رياضي SHEIN', sku: 'SP3321', qty: 2, purchasePrice: 28, purchaseCurrency: 'USD', rate: 530, sellingPrice: 38000, status: 'Pending', sheinOrderId: 'sh2' },
];

export const mockManifests: Manifest[] = [
  { id: 'mf1', merchantId: 'm1', pointId: 'p1', createdAt: new Date().toISOString(), count: 12, total: 340000, status: 'Generated' },
];

export const mockApprovals: FinancialApproval[] = [
  { id: 'ap1', merchantId: 'm1', requestedBy: 'u2', type: 'Cash_Refund', orderId: 'ORD-2026-000127', amount: 15000, reason: 'طلب إلغاء بعد الدفع - عميلة محظورة', status: 'Pending', timestamp: new Date().toISOString() },
];

export const mockTransactions: Transaction[] = [
  { id: 't1', merchantId: 'm1', orderId: 'ORD-2026-000125', customerId: 'c1', type: 'Deposit', amount: 15000, currency: 'YER', method: 'Cash', createdAt: new Date().toISOString(), createdBy: 'u2' },
  { id: 't2', merchantId: 'm1', type: 'Expense', amount: 8000, currency: 'YER', method: 'Cash', createdAt: new Date().toISOString(), createdBy: 'u1' },
];

export const mockExpenses: Expense[] = [
  { id: 'e1', merchantId: 'm1', category: 'شحن', amount: 12000, notes: 'شحن DHL شي إن', date: new Date().toISOString(), userId: 'u1' },
  { id: 'e2', merchantId: 'm1', category: 'تغليف', amount: 3500, notes: 'أكياس وملصقات', date: new Date().toISOString(), userId: 'u1' },
];

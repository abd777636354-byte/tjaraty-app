"use client";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Merchant, User, Customer, Supplier, SheinOrder, Coupon, Order, OrderItem, DeliveryPoint, Manifest, FinancialApproval, Transaction, Expense, Currency, ReturnDamage, PointSettlement, CourierSettlement, AuditLog } from './types';
import { mockMerchants, mockUsers, mockCustomers, mockSuppliers, mockSheinOrders, mockCoupons, mockOrders, mockOrderItems, mockPoints, mockManifests, mockApprovals, mockTransactions, mockExpenses, mockCurrencies } from './mockData';

type AppState = {
  merchants: Merchant[];
  users: User[];
  customers: Customer[];
  suppliers: Supplier[];
  sheinOrders: SheinOrder[];
  coupons: Coupon[];
  orders: Order[];
  orderItems: OrderItem[];
  points: DeliveryPoint[];
  manifests: Manifest[];
  approvals: FinancialApproval[];
  transactions: Transaction[];
  expenses: Expense[];
  currencies: Currency[];
  returns: ReturnDamage[];
  pointSettlements: PointSettlement[];
  courierSettlements: CourierSettlement[];
  auditLogs: AuditLog[];
  currentMerchantId: string;
  currentUserId: string | null;
  darkMode: boolean;
  // actions
  setCurrentMerchant: (id: string)=>void;
  setCurrentUser: (id: string | null)=>void;
  toggleDark: ()=>void;
  addOrder: (o: Order, items: OrderItem[])=>void;
  updateOrder: (id: string, patch: Partial<Order>)=>void;
  addCustomer: (c: Customer)=>void;
  updateCustomer: (id: string, patch: Partial<Customer>)=>void;
  addMerchant: (m: Merchant)=>void;
  renewMerchant: (id: string)=>void;
  toggleMerchantActive: (id: string)=>void;
  addApproval: (a: FinancialApproval)=>void;
  decideApproval: (id: string, status: 'Approved' | 'Rejected')=>void;
  addExpense: (e: Expense)=>void;
  addTransaction: (t: Transaction)=>void;
  addLog: (log: AuditLog)=>void;
  addCoupon: (c: Coupon)=>void;
  addSupplier: (s: Supplier)=>void;
  addPoint: (p: DeliveryPoint)=>void;
  addManifest: (m: Manifest)=>void;
  addSheinOrder: (s: SheinOrder)=>void;
  addReturn: (r: ReturnDamage)=>void;
  updateCurrency: (code: string, rate: number)=>void;
};

export const useStore = create<AppState>()(persist((set, get)=>({
  merchants: mockMerchants,
  users: mockUsers,
  customers: mockCustomers,
  suppliers: mockSuppliers,
  sheinOrders: mockSheinOrders,
  coupons: mockCoupons,
  orders: mockOrders,
  orderItems: mockOrderItems,
  points: mockPoints,
  manifests: mockManifests,
  approvals: mockApprovals,
  transactions: mockTransactions,
  expenses: mockExpenses,
  currencies: mockCurrencies,
  returns: [],
  pointSettlements: [],
  courierSettlements: [],
  auditLogs: [{ id: 'log1', merchantId: 'm1', userId: 'u1', action: 'تسجيل دخول', target: 'Users', details: 'دخول النظام', timestamp: new Date().toISOString() }],
  currentMerchantId: 'm1',
  currentUserId: null,
  darkMode: false,
  setCurrentMerchant: (id)=> set({ currentMerchantId: id }),
  setCurrentUser: (id)=> set({ currentUserId: id }),
  toggleDark: ()=> set(s=>({ darkMode: !s.darkMode })),
  addOrder: (o, items)=> set(s=>({ orders: [o, ...s.orders], orderItems: [...items, ...s.orderItems], auditLogs: [{ id: 'log'+Date.now(), merchantId: o.merchantId, userId: s.currentUserId||'u1', action: 'إنشاء طلب', target: 'Orders', details: o.id, timestamp: new Date().toISOString() }, ...s.auditLogs]})),
  updateOrder: (id, patch)=> set(s=>({ orders: s.orders.map(o=> o.id===id? {...o, ...patch}: o)})),
  addCustomer: (c)=> set(s=>({ customers: [c, ...s.customers]})),
  updateCustomer: (id, patch)=> set(s=>({ customers: s.customers.map(c=> c.id===id? {...c, ...patch}: c)})),
  addMerchant: (m)=> set(s=>({ merchants: [...s.merchants, m]})),
  renewMerchant: (id)=> set(s=>({ merchants: s.merchants.map(m=> m.id===id? {...m, endDate: new Date(new Date(m.endDate).getTime()+365*86400000).toISOString(), isActive: true }: m)})),
  toggleMerchantActive: (id)=> set(s=>({ merchants: s.merchants.map(m=> m.id===id? {...m, isActive: !m.isActive}: m)})),
  addApproval: (a)=> set(s=>({ approvals: [a, ...s.approvals]})),
  decideApproval: (id, status)=> set(s=>({ approvals: s.approvals.map(a=> a.id===id? {...a, status, approvedBy: s.currentUserId||'u1'}: a)})),
  addExpense: (e)=> set(s=>({ expenses: [e, ...s.expenses]})),
  addTransaction: (t)=> set(s=>({ transactions: [t, ...s.transactions]})),
  addLog: (log)=> set(s=>({ auditLogs: [log, ...s.auditLogs]})),
  addCoupon: (c)=> set(s=>({ coupons: [c, ...s.coupons]})),
  addSupplier: (sup)=> set(s=>({ suppliers: [...s.suppliers, sup]})),
  addPoint: (p)=> set(s=>({ points: [...s.points, p]})),
  addManifest: (m)=> set(s=>({ manifests: [m, ...s.manifests]})),
  addSheinOrder: (so)=> set(s=>({ sheinOrders: [so, ...s.sheinOrders]})),
  addReturn: (r)=> set(s=>({ returns: [r, ...s.returns]})),
  updateCurrency: (code, rate)=> set(s=>({ currencies: s.currencies.map(c=> c.code===code? {...c, rate}: c)})),
}), { name: 'tjaraty-storage', partialize: (s:any)=> ({ ...s, currentUserId: s.currentUserId, currentMerchantId: s.currentMerchantId, darkMode: s.darkMode }) } as any));

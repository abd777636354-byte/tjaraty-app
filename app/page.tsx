"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { useStore } from "../lib/store";
import {
  LayoutDashboard, Package, ShoppingCart, Users, MapPin, Truck, Wallet, Coins, Tag, Calculator, MessageCircle,
  Undo2, ShieldCheck, BarChart3, Settings, Crown, LogOut, Search, Bell, Moon, Sun, Fingerprint, Printer,
  Plus, X, QrCode, Mic, Send, FileText, AlertTriangle, CheckCircle2, Clock, Eye, Edit, Trash2, Download,
  Upload, Phone, Star, Ban, CreditCard, TrendingUp, Box, Archive, Filter, ArrowUpRight, ArrowDownRight,
  Image as ImageIcon, Link2, Copy, Check, Menu, ChevronDown, ChevronLeft, Sparkles, Zap, Globe, Layers
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

// helper
const fmtMoney = (n:number)=> new Intl.NumberFormat('ar-YE').format(Math.round(n)) + ' ر.ي';
const fmtDate = (d:string)=> new Date(d).toLocaleDateString('ar-YE');
const daysLeft = (end:string)=> Math.ceil((new Date(end).getTime()-Date.now())/86400000);

export default function Page(){
  const store = useStore();
  const {
    merchants, users, customers, suppliers, sheinOrders, coupons, orders, orderItems, points,
    manifests, approvals, transactions, expenses, currencies, returns, auditLogs,
    currentMerchantId, currentUserId, darkMode
  } = store;

  const [mounted,setMounted]=useState(false);
  useEffect(()=> setMounted(true),[]);
  useEffect(()=>{ if(mounted) document.documentElement.classList.toggle('dark', darkMode); },[darkMode,mounted]);

  const currentMerchant = merchants.find(m=>m.id===currentMerchantId) || merchants[0];
  const currentUser = users.find(u=>u.id===currentUserId) || null;
  const merchantOrders = orders.filter(o=> o.merchantId===currentMerchantId);
  const merchantCustomers = customers.filter(c=> c.merchantId===currentMerchantId);
  const merchantPoints = points.filter(p=> p.merchantId===currentMerchantId);

  const [tab,setTab]=useState('dashboard');
  const [mobileNav,setMobileNav]=useState(false);
  const [search,setSearch]=useState('');
  const [showNewOrder,setShowNewOrder]=useState(false);
  const [showNewCustomer,setShowNewCustomer]=useState(false);
  const [showNewSupplier,setShowNewSupplier]=useState(false);
  const [showNewPoint,setShowNewPoint]=useState(false);
  const [showNewCoupon,setShowNewCoupon]=useState(false);
  const [showNewShein,setShowNewShein]=useState(false);
  const [selectedOrder,setSelectedOrder]=useState<string | null>(null);
  const [deadStockFilter,setDeadStockFilter]=useState(false);
  const [orderStatusFilter,setOrderStatusFilter]=useState<string>('all');
  const [toast,setToast]=useState<string | null>(null);
  const [pinInput,setPinInput]=useState('');
  const [loginUsername,setLoginUsername]=useState('admin');
  const showToast=(m:string)=>{setToast(m); setTimeout(()=>setToast(null),2500)};

  // auth
  const handleLogin=()=>{
    const u = users.find(x=> x.username===loginUsername && x.merchantId===currentMerchantId) || users.find(x=> x.username===loginUsername);
    if(!u) return showToast('المستخدم غير موجود');
    if(u.role==='SuperAdmin'){ store.setCurrentUser(u.id); showToast('مرحباً د. عبدالله الحميري 👑'); return; }
    if(u.pin && pinInput!==u.pin && pinInput!==''){ return showToast('رمز PIN غير صحيح'); }
    store.setCurrentUser(u.id);
    store.addLog({ id:'log'+Date.now(), merchantId: currentMerchantId, userId: u.id, action: 'تسجيل دخول', target:'Auth', details:`دخول ${u.fullName}`, timestamp: new Date().toISOString()});
    showToast(`أهلاً ${u.fullName}`);
  };
  const logout=()=> store.setCurrentUser(null);

  // lock check
  const isLocked = !currentMerchant.isActive || daysLeft(currentMerchant.endDate) <= 0;
  const renewalDays = daysLeft(currentMerchant.endDate);

  // KPIs
  const kpis = useMemo(()=>{
    const today = new Date().toDateString();
    const todayOrders = merchantOrders.filter(o=> new Date(o.orderDate).toDateString()===today).length;
    const pendingDeposit = merchantOrders.filter(o=> o.status==='Pending_Deposit').length;
    const atPickup = merchantOrders.filter(o=> o.pickupStatus==='Awaiting_Pickup').length;
    const overdue = merchantOrders.filter(o=> o.pickupStatus==='Overdue_Pending_Admin_Review').length;
    const dead = merchantOrders.filter(o=> o.isDeadStock).length;
    const totalSales = merchantOrders.filter(o=> o.status!=='Cancelled').reduce((s,o)=> s+o.totalAmount,0);
    const totalProfit = merchantOrders.reduce((s,o)=> s+ (o.totalAmount - o.depositPaid*0.2),0); // mock
    const debts = merchantOrders.filter(o=> o.isDebt).reduce((s,o)=> s+o.remaining,0);
    return { todayOrders, pendingDeposit, atPickup, overdue, dead, totalSales, totalProfit, debts };
  },[merchantOrders]);

  const filteredOrders = useMemo(()=>{
    let list = merchantOrders;
    if(search) list = list.filter(o=>{
      const cust = merchantCustomers.find(c=>c.id===o.customerId);
      return o.id.includes(search) || o.barcode.includes(search) || cust?.name.includes(search) || cust?.phone.includes(search) || o.barcode.includes(search);
    });
    if(deadStockFilter) list = list.filter(o=> o.isDeadStock);
    if(orderStatusFilter!=='all') list = list.filter(o=> o.status===orderStatusFilter);
    return list;
  },[merchantOrders, search, deadStockFilter, orderStatusFilter, merchantCustomers]);

  // shein calculator state
  const [sheinPrice,setSheinPrice]=useState(25);
  const [sheinRate,setSheinRate]=useState(530);
  const [sheinShipping,setSheinShipping]=useState(2000);
  const [sheinCommission,setSheinCommission]=useState(10);
  const [sheinProfit,setSheinProfit]=useState(5000);
  const sheinSuggested = Math.round(sheinPrice*sheinRate + sheinShipping + (sheinPrice*sheinRate* sheinCommission/100) + sheinProfit);

  // whatsapp generator
  const [waProduct,setWaProduct]=useState({name:'فستان مخملي فاخر', sizes:'S, M, L, XL', colors:'خمري، أسود، زيتي', price:'45,000 ر.ي', image:''});

  if(!mounted) return <div className="min-h-screen flex items-center justify-center bg-emerald-50">جاري التحميل...</div>;

  if(!currentUser){
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-0 bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden shadow-2xl">
          <div className="p-8 md:p-10 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-xl font-black">ت</div>
              <div>
                <div className="font-black text-xl leading-none">تِجارتي</div>
                <div className="text-[11px] text-zinc-500">من الطلب إلى التسليم والتحصيل</div>
              </div>
            </div>
            <h1 className="text-2xl font-black mb-2">مرحباً بعودتك 👋</h1>
            <p className="text-sm text-zinc-500 mb-6">سجّل دخولك لإدارة تجارتك بكل احترافية</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-600 mb-1 block">التاجر</label>
                <select value={currentMerchantId} onChange={e=> store.setCurrentMerchant(e.target.value)} className="input">
                  {merchants.map(m=> <option key={m.id} value={m.id}>{m.name} {daysLeft(m.endDate)<=0?'🔒':''}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-600 mb-1 block">اسم المستخدم</label>
                <select value={loginUsername} onChange={e=> setLoginUsername(e.target.value)} className="input">
                  {users.filter(u=> u.merchantId===currentMerchantId || u.role==='SuperAdmin').map(u=> <option key={u.id} value={u.username}>{u.fullName} — {u.role}</option>)}
                  <option value="superadmin">د. عبدالله الحميري — SuperAdmin</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-600 mb-1 block">رمز PIN (اختياري للتجربة اتركه فارغ أو 1234)</label>
                <input value={pinInput} onChange={e=>setPinInput(e.target.value)} placeholder="••••" className="input tracking-widest text-center text-lg" />
              </div>
              <button onClick={handleLogin} className="w-full btn-primary py-3.5 text-base">تسجيل الدخول <ChevronLeft size={18}/></button>
              <div className="flex gap-2">
                <button onClick={()=>{store.setCurrentUser('super'); showToast('دخول سوبر آدمن')}} className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-bold text-sm flex items-center justify-center gap-2"><Crown size={16}/> دخول المالك</button>
                <button onClick={()=>store.toggleDark()} className="px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800">{darkMode?<Sun size={18}/>:<Moon size={18}/>}</button>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 justify-center pt-2">
                <Fingerprint size={14}/> دخول بالبصمة متاح على الأجهزة الداعمة
              </div>
            </div>
            <p className="text-[11px] text-center text-zinc-400 mt-6 leading-relaxed">«تِجارتي» - أعداد د. عبدالله عبدالمجيد الحميري © جميع الحقوق محفوظة<br/>الإصدار 1.0 — نظام SaaS متعدد التجار</p>
          </div>
          <div className="relative bg-gradient-to-br from-emerald-600 to-teal-700 p-8 md:p-10 text-white flex flex-col justify-between overflow-hidden hidden md:flex">
            <div className="absolute inset-0 opacity-10" style={{backgroundImage:`radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize:'24px 24px'}}/>
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-3 py-1 text-xs mb-6">✨ موثوق من ٣٠٠+ تاجر يمني</div>
              <h2 className="text-3xl font-black leading-tight mb-3">كل تجارتك<br/>في مكان واحد</h2>
              <p className="text-white/80 text-sm leading-relaxed">إدارة طلبات الواتساب، حجوزات SHEIN، محلات الأمانات، المناديب والأرباح — مع إغلاق سنوي آلي ولوحة سوبر آدمن.</p>
            </div>
            <div className="relative grid grid-cols-2 gap-3 mt-8">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4"><div className="text-2xl font-black">+12k</div><div className="text-xs opacity-80">طلب شهري</div></div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4"><div className="text-2xl font-black">98%</div><div className="text-xs opacity-80">رضا التجار</div></div>
              <div className="bg-white text-emerald-700 rounded-2xl p-4 col-span-2 flex items-center justify-between"><span className="font-bold text-sm">تجربة مجانية 14 يوم</span><span className="bg-emerald-600 text-white rounded-full p-2"><ArrowUpRight size={16}/></span></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // locked screen
  if(isLocked && currentUser.role!=='SuperAdmin'){
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full card p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4"><Ban size={36}/></div>
          <h2 className="text-xl font-black mb-2">عذراً، انتهت فترة الاشتراك السنوي</h2>
          <p className="text-sm text-zinc-500 mb-2">خدمة <b>تِجارتي</b> مغلقة حالياً للتاجر <b>{currentMerchant.name}</b></p>
          <p className="text-xs text-zinc-400 mb-6">تاريخ الانتهاء: {fmtDate(currentMerchant.endDate)} — يرجى التواصل مع الإدارة لتجديد الاشتراك (365 يوم إضافي بنقرة واحدة).</p>
          <div className="grid gap-3">
            <a href={`https://wa.me/967777123456?text=مرحبا د. عبدالله، أرغب بتجديد اشتراك ${currentMerchant.name}`} target="_blank" className="btn-primary py-3.5"><MessageCircle size={18}/> تواصل واتساب مع الإدارة</a>
            <button onClick={logout} className="btn-ghost">تسجيل خروج</button>
            <button onClick={()=>store.setCurrentUser('super')} className="text-xs text-amber-600 font-bold flex items-center justify-center gap-1"><Crown size={14}/> دخول كـ مالك النظام</button>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    {id:'dashboard', label:'الرئيسية', icon: LayoutDashboard},
    {id:'orders', label:'الطلبات', icon: Package, badge: merchantOrders.length},
    {id:'bookings', label:'الحجوزات', icon: ShoppingCart},
    {id:'customers', label:'العملاء', icon: Users},
    {id:'points', label:'نقاط الأمانات', icon: MapPin},
    {id:'couriers', label:'المناديب', icon: Truck},
    {id:'finances', label:'المالية', icon: Wallet},
    {id:'currencies', label:'العملات', icon: Coins},
    {id:'coupons', label:'الكوبونات', icon: Tag},
    {id:'sheinCalc', label:'حاسبة شي إن', icon: Calculator},
    {id:'waTools', label:'أدوات واتساب', icon: MessageCircle},
    {id:'returns', label:'المرتجعات', icon: Undo2},
    {id:'approvals', label:'الموافقات', icon: ShieldCheck, badge: approvals.filter(a=>a.status==='Pending').length},
    {id:'reports', label:'التقارير', icon: BarChart3},
    {id:'users', label:'المستخدمين', icon: Users},
    {id:'audit', label:'سجل العمليات', icon: FileText},
    {id:'settings', label:'الإعدادات', icon: Settings},
  ];
  if(currentUser.role==='SuperAdmin') navItems.splice(1,0,{id:'superadmin', label:'لوحة المالك', icon: Crown, badge: undefined} as any);

  return (
    <div className={`min-h-screen flex ${darkMode?'dark':''}`}>
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-50 dark:bg-zinc-950">
        {/* renewal banner */}
        {renewalDays<=15 && renewalDays>0 && (
          <div className="bg-amber-500 text-white px-4 py-2.5 flex items-center justify-between text-sm font-bold">
            <span className="flex items-center gap-2"><Clock size={16}/> تنبيه التجديد: متبقي {renewalDays} يوم على انتهاء اشتراك {currentMerchant.name} — جدّد الآن لتجنب الإغلاق التلقائي</span>
            <a href={`https://wa.me/967777123456`} target="_blank" className="bg-white text-amber-600 rounded-full px-3 py-1 text-xs">تجديد عبر واتساب</a>
          </div>
        )}

        {/* header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 px-4 md:px-6 py-3">
            <button onClick={()=>setMobileNav(!mobileNav)} className="md:hidden p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800"><Menu size={18}/></button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg">ت</div>
              <div className="hidden sm:block">
                <div className="font-black leading-none">تِجارتي</div>
                <div className="text-[11px] text-zinc-500">{currentMerchant.name} • {currentUser.fullName}</div>
              </div>
            </div>
            <div className="flex-1 max-w-xl mx-4 hidden md:flex relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="بحث ذكي: اسم العميل، رقم الهاتف، باركود، SKU شي إن، نقطة الاستلام..." className="w-full bg-zinc-100 dark:bg-zinc-800 border-0 rounded-full pr-10 pl-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"/>
              <button className="absolute left-1 top-1 bg-emerald-600 text-white rounded-full p-2"><ImageIcon size={14}/></button>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <div className="hidden lg:flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-full px-3 py-1.5 text-xs">
                <span className={`w-2 h-2 rounded-full ${isLocked?'bg-red-500':'bg-emerald-500'} animate-pulse`}></span>
                {isLocked? 'مقفل':'نشط'} • ينتهي {fmtDate(currentMerchant.endDate)}
              </div>
              <button onClick={()=>store.toggleDark()} className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800">{darkMode?<Sun size={18}/>:<Moon size={18}/>}</button>
              <button className="relative p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <Bell size={18}/>
                {(kpis.overdue + kpis.pendingDeposit) >0 && <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black">{kpis.overdue + kpis.pendingDeposit}</span>}
              </button>
              <div className="hidden md:flex items-center gap-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full pl-1 pr-3 py-1">
                <img src={`https://i.pravatar.cc/100?u=${currentUser.id}`} className="w-8 h-8 rounded-full"/>
                <div className="text-xs leading-none"><div className="font-bold">{currentUser.fullName}</div><div className="text-[11px] text-zinc-500">{currentUser.role}</div></div>
                <button onClick={logout} className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700"><LogOut size={14}/></button>
              </div>
            </div>
          </div>
          <div className="md:hidden px-4 pb-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="بحث..." className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full pr-10 pl-4 py-2.5 text-sm outline-none"/>
            </div>
          </div>
        </header>

        <div className="flex flex-1 min-h-0">
          {/* sidebar desktop */}
          <aside className="hidden md:flex w-[260px] shrink-0 flex-col bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto scrollbar-thin">
            <div className="p-3">
              <button onClick={()=>setShowNewOrder(true)} className="w-full btn-primary py-3"><Plus size={18}/> طلب جديد</button>
            </div>
            <nav className="px-2 pb-4 space-y-1">
              {navItems.map(item=>{
                const active = tab===item.id;
                return (
                  <button key={item.id} onClick={()=>setTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${active?'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20':'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}`}>
                    <item.icon size={18} className={active?'text-white':''}/>
                    <span className="flex-1 text-right">{item.label}</span>
                    {item.badge? <span className={`text-[11px] px-2 py-0.5 rounded-full font-black ${active?'bg-white text-emerald-700':'bg-emerald-100 text-emerald-700'}`}>{item.badge}</span>: null}
                  </button>
                )
              })}
            </nav>
            <div className="mt-auto p-3 border-t border-zinc-100 dark:border-zinc-800">
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-4 text-white">
                <div className="flex items-center gap-2 font-black text-sm"><Crown size={16}/> باقة {currentMerchant.plan==='pro'?'احترافية':'أساسية'}</div>
                <div className="text-xs opacity-90 mt-1">الحد: {currentMerchant.maxUsers} مستخدمين</div>
                <button onClick={()=>showToast('ترقية الباقة قريباً — تواصل مع المالك')} className="mt-3 w-full bg-white text-amber-600 rounded-xl py-2 text-xs font-black">ترقية الباقة</button>
              </div>
              <div className="text-[11px] text-center text-zinc-400 mt-3 leading-relaxed">«تِجارتي» — أعداد د. عبدالله الحميري<br/>© جميع الحقوق محفوظة</div>
            </div>
          </aside>

          {/* mobile drawer */}
          {mobileNav && (
            <div className="fixed inset-0 z-40 md:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={()=>setMobileNav(false)}/>
              <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-[320px] bg-white dark:bg-zinc-900 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2"><div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">ت</div><span className="font-black">تِجارتي</span></div>
                  <button onClick={()=>setMobileNav(false)} className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800"><X size={18}/></button>
                </div>
                <button onClick={()=>{setShowNewOrder(true); setMobileNav(false)}} className="w-full btn-primary mb-4"><Plus size={18}/> طلب جديد</button>
                <nav className="space-y-1">
                  {navItems.map(i=>(
                    <button key={i.id} onClick={()=>{setTab(i.id); setMobileNav(false)}} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold ${tab===i.id?'bg-emerald-600 text-white':'bg-zinc-50 dark:bg-zinc-800'}`}><i.icon size={18}/>{i.label}</button>
                  ))}
                </nav>
              </div>
            </div>
          )}

          {/* main content */}
          <main className="flex-1 min-w-0 p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto w-full">
            {/* DASHBOARD */}
            {tab==='dashboard' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-black">لوحة التحكم</h1>
                    <p className="text-sm text-zinc-500">مرحباً {currentUser.fullName} — هنا ملخص تجارتك اليوم</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>setShowNewOrder(true)} className="btn-primary"><Plus size={16}/> طلب جديد</button>
                    <button onClick={()=>showToast('تمت مزامنة البيانات أوفلاين ✓')} className="btn-ghost flex items-center gap-2"><Upload size={16}/> مزامنة</button>
                  </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  <div className="card p-4">
                    <div className="flex justify-between items-start"><span className="text-xs text-zinc-500">مبيعات اليوم</span><span className="p-2 rounded-xl bg-emerald-100 text-emerald-600"><TrendingUp size={16}/></span></div>
                    <div className="text-2xl font-black mt-2">{fmtMoney(kpis.totalSales)}</div>
                    <div className="text-xs text-emerald-600 flex items-center gap-1 mt-1"><ArrowUpRight size={12}/> +12% عن الأمس</div>
                  </div>
                  <div className="card p-4">
                    <div className="flex justify-between"><span className="text-xs text-zinc-500">طلبات بانتظار العربون</span><span className="p-2 rounded-xl bg-amber-100 text-amber-600"><Clock size={16}/></span></div>
                    <div className="text-2xl font-black mt-2">{kpis.pendingDeposit}</div>
                    <div className="text-xs text-amber-600">مؤقت إلغاء 12 ساعة</div>
                  </div>
                  <div className="card p-4">
                    <div className="flex justify-between"><span className="text-xs text-zinc-500">في محلات الأمانات</span><span className="p-2 rounded-xl bg-sky-100 text-sky-600"><MapPin size={16}/></span></div>
                    <div className="text-2xl font-black mt-2">{kpis.atPickup}</div>
                    <div className="text-xs text-sky-600">{kpis.overdue} متأخرة تحتاج قرار</div>
                  </div>
                  <div className="card p-4">
                    <div className="flex justify-between"><span className="text-xs text-zinc-500">صافي الربح</span><span className="p-2 rounded-xl bg-violet-100 text-violet-600"><Wallet size={16}/></span></div>
                    <div className="text-2xl font-black mt-2">{fmtMoney(kpis.totalProfit)}</div>
                    <div className="text-xs text-violet-600">بعد المصاريف والعمولات</div>
                  </div>
                </div>

                {/* alerts row */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="card p-4 border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
                    <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400 text-sm"><AlertTriangle size={16}/> تنبيهات تحتاج إجراء</div>
                    <ul className="mt-3 space-y-2 text-sm">
                      <li className="flex justify-between bg-white dark:bg-zinc-900 rounded-xl p-3"><span>⏳ طلبان ينتهي مؤقت العربون خلال ساعتين</span><button onClick={()=>setTab('orders')} className="text-emerald-600 font-bold text-xs">عرض</button></li>
                      <li className="flex justify-between bg-white dark:bg-zinc-900 rounded-xl p-3"><span>🚨 {kpis.overdue} طلب متأخر في الأمانات</span><button onClick={()=>setTab('orders')} className="text-red-600 font-bold text-xs">قرار</button></li>
                      <li className="flex justify-between bg-white dark:bg-zinc-900 rounded-xl p-3"><span>📦 مخزون راكد: 3 شحنات غير مربوطة</span><button className="text-sky-600 font-bold text-xs">فرز</button></li>
                    </ul>
                  </div>
                  <div className="card p-4 md:col-span-2">
                    <div className="flex items-center justify-between mb-3"><span className="font-bold text-sm">المبيعات آخر 7 أيام</span><span className="text-xs text-zinc-500">ريال يمني</span></div>
                    <div className="h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          {name:'السبت', sales: 320000}, {name:'الأحد', sales: 410000}, {name:'الاثنين', sales: 280000}, {name:'الثلاثاء', sales: 520000}, {name:'الأربعاء', sales: 380000}, {name:'الخميس', sales: 610000}, {name:'اليوم', sales: 450000},
                        ]}>
                          <XAxis dataKey="name" tick={{fontSize:11}} axisLine={false} tickLine={false}/>
                          <YAxis tick={{fontSize:11}} axisLine={false} tickLine={false}/>
                          <Tooltip/>
                          <Bar dataKey="sales" fill="#10b981" radius={[8,8,0,0]}/>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* recent orders + quick actions */}
                <div className="grid lg:grid-cols-3 gap-4">
                  <div className="card p-4 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-black">أحدث الطلبات</span>
                      <button onClick={()=>setTab('orders')} className="text-xs font-bold text-emerald-600">عرض الكل ←</button>
                    </div>
                    <div className="space-y-3">
                      {merchantOrders.slice(0,4).map(o=>{
                        const cust = merchantCustomers.find(c=>c.id===o.customerId);
                        return (
                          <div key={o.id} className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                            <img src={`https://i.pravatar.cc/100?u=${cust?.phone}`} className="w-10 h-10 rounded-full"/>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-sm truncate">{cust?.name} — {o.id}</div>
                              <div className="text-xs text-zinc-500 truncate">{o.status} • {fmtMoney(o.totalAmount)} • {o.deliveryType==='Courier'?'مندوب':'أمانات'}</div>
                            </div>
                            <span className={`badge ${o.status==='Delivered'?'bg-emerald-100 text-emerald-700': o.status==='Pending_Deposit'?'bg-amber-100 text-amber-700': o.status==='At_Pickup'?'bg-sky-100 text-sky-700':'bg-zinc-200 text-zinc-700'}`}>{o.status}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="card p-4">
                      <div className="font-bold text-sm mb-3 flex items-center gap-2"><Zap size={16} className="text-amber-500"/> حلول سريعة</div>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={()=>setTab('sheinCalc')} className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs font-bold flex flex-col items-start gap-2"><Calculator size={18}/> حاسبة شي إن</button>
                        <button onClick={()=>setTab('waTools')} className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold flex flex-col items-start gap-2"><MessageCircle size={18}/> مولد إعلان</button>
                        <button onClick={()=>showToast('تم مسح الباركود: ORD-2026-000125 ✓')} className="p-3 rounded-2xl bg-zinc-900 text-white text-xs font-bold flex flex-col items-start gap-2"><QrCode size={18}/> مسح باركود</button>
                        <button onClick={()=>setTab('points')} className="p-3 rounded-2xl bg-white dark:bg-zinc-800 border text-xs font-bold flex flex-col items-start gap-2"><Printer size={18}/> كشف أمانات</button>
                      </div>
                    </div>
                    <div className="card p-4">
                      <div className="font-bold text-sm mb-2">توزيع الطلبات حسب الحالة</div>
                      <div className="h-[140px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={[
                              {name:'مكتمل', value: 12}, {name:'قيد الشحن', value: 8}, {name:'في الأمانات', value: 5}, {name:'بانتظار عربون', value: 4}
                            ]} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3}>
                              {['#10b981','#f59e0b','#0ea5e9','#ef4444'].map((c,i)=><Cell key={i} fill={c}/>)}
                            </Pie>
                            <Tooltip/>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ORDERS */}
            {tab==='orders' && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3 items-center justify-between">
                  <h2 className="text-xl font-black flex items-center gap-2"><Package className="text-emerald-600"/> إدارة الطلبات <span className="badge bg-zinc-900 text-white">{filteredOrders.length}</span></h2>
                  <div className="flex gap-2">
                    <select value={orderStatusFilter} onChange={e=>setOrderStatusFilter(e.target.value)} className="input py-2 w-auto text-xs">
                      <option value="all">كل الحالات</option>
                      <option value="Pending_Deposit">بانتظار العربون</option>
                      <option value="Confirmed">مؤكد</option>
                      <option value="Shipped">تم الشحن</option>
                      <option value="Arrived">وصل</option>
                      <option value="At_Pickup">في الأمانات</option>
                      <option value="Delivered">تم التسليم</option>
                    </select>
                    <label className="flex items-center gap-2 text-xs font-bold bg-amber-100 text-amber-700 px-3 rounded-xl"><input type="checkbox" checked={deadStockFilter} onChange={e=>setDeadStockFilter(e.target.checked)}/> راكد فقط</label>
                    <button onClick={()=>setShowNewOrder(true)} className="btn-primary"><Plus size={16}/> طلب جديد</button>
                  </div>
                </div>

                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-500">
                        <tr>
                          <th className="p-3 text-right">الطلب / الباركود</th>
                          <th className="p-3 text-right">العميل</th>
                          <th className="p-3 text-right">الإجمالي</th>
                          <th className="p-3 text-right">العربون</th>
                          <th className="p-3 text-right">الحالة</th>
                          <th className="p-3 text-right">التسليم</th>
                          <th className="p-3 text-right">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map(o=>{
                          const cust = merchantCustomers.find(c=>c.id===o.customerId);
                          const ratingColor = cust?.rating==='Blacklisted'?'bg-red-500': cust?.rating==='VIP'?'bg-amber-500': cust?.rating==='Late_Payer'?'bg-orange-500':'bg-emerald-500';
                          return (
                            <tr key={o.id} className="border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                              <td className="p-3">
                                <div className="font-mono font-bold text-xs">{o.barcode}</div>
                                <div className="text-[11px] text-zinc-500 flex items-center gap-1"><QrCode size={12}/> {fmtDate(o.orderDate)} • {o.source}</div>
                                {o.depositTimer && <div className="text-[11px] text-amber-600 font-bold mt-1 flex items-center gap-1"><Clock size={10}/> ينتهي {new Date(o.depositTimer).toLocaleTimeString('ar-YE')}</div>}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${ratingColor}`}></span>
                                  <span className="font-bold">{cust?.name}</span>
                                  {cust?.rating==='Blacklisted' && <span className="badge bg-red-100 text-red-700">محظور</span>}
                                  {cust?.rating==='VIP' && <span className="badge bg-amber-100 text-amber-700">VIP ⭐</span>}
                                </div>
                                <div className="text-xs text-zinc-500 flex items-center gap-1"><Phone size={10}/>{cust?.phone}</div>
                              </td>
                              <td className="p-3 font-black">{fmtMoney(o.totalAmount)}</td>
                              <td className="p-3">
                                <div className="text-xs">{fmtMoney(o.depositPaid)}</div>
                                <div className="text-[11px] text-zinc-500">متبقي {fmtMoney(o.remaining)}</div>
                              </td>
                              <td className="p-3"><span className={`badge ${o.status==='Delivered'?'bg-emerald-100 text-emerald-700 border border-emerald-200': o.status==='At_Pickup'?'bg-sky-100 text-sky-700':'bg-zinc-100 text-zinc-700'}`}>{o.status}</span>{o.pickupStatus==='Overdue_Pending_Admin_Review' && <div className="text-[11px] text-red-600 font-bold">متأخرة — قرار آدمن</div>}</td>
                              <td className="p-3 text-xs">{o.deliveryType==='Courier'? 'مندوب':'أمانات'}</td>
                              <td className="p-3">
                                <div className="flex gap-1">
                                  <button onClick={()=>setSelectedOrder(o.id)} className="p-2 rounded-lg bg-zinc-900 text-white"><Eye size={14}/></button>
                                  <button onClick={()=>showToast('تم نسخ رابط السلة ✓')} className="p-2 rounded-lg bg-emerald-600 text-white"><Link2 size={14}/></button>
                                  <button onClick={()=>showToast('تمت الطباعة الحرارية 🖨️')} className="p-2 rounded-lg bg-white border"><Printer size={14}/></button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* order detail drawer */}
                {selectedOrder && (
                  <div className="fixed inset-0 z-50 flex">
                    <div className="flex-1 bg-black/40" onClick={()=>setSelectedOrder(null)}/>
                    <div className="w-full max-w-[520px] bg-white dark:bg-zinc-900 h-full overflow-y-auto p-6 space-y-4">
                      {(()=>{
                        const o = orders.find(x=>x.id===selectedOrder)!;
                        const cust = customers.find(c=>c.id===o.customerId);
                        const items = orderItems.filter(i=> i.orderId===o.id);
                        return (
                          <>
                            <div className="flex items-center justify-between">
                              <h3 className="font-black text-lg">{o.barcode}</h3>
                              <button onClick={()=>setSelectedOrder(null)} className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800"><X size={18}/></button>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={()=>{navigator.clipboard.writeText(o.cartLink||''); showToast('تم نسخ رابط السلة')}} className="flex-1 btn-primary"><Link2 size={16}/> رابط السلة</button>
                              <button onClick={()=>showToast('تم توليد PDF')} className="btn-ghost"><Download size={16}/> PDF</button>
                            </div>
                            <div className="card p-4 space-y-3">
                              <div className="flex items-center gap-3">
                                <img src={`https://i.pravatar.cc/100?u=${cust?.phone}`} className="w-12 h-12 rounded-full"/>
                                <div><div className="font-bold">{cust?.name}</div><div className="text-xs text-zinc-500">{cust?.phone} • {cust?.rating}</div></div>
                                <a href={`https://wa.me/${cust?.phone}`} target="_blank" className="mr-auto p-2 rounded-full bg-emerald-500 text-white"><MessageCircle size={16}/></a>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3"><div className="text-zinc-500">الإجمالي</div><div className="font-black">{fmtMoney(o.totalAmount)}</div></div>
                                <div className="bg-emerald-50 rounded-xl p-3"><div className="text-zinc-500">العربون</div><div className="font-black text-emerald-700">{fmtMoney(o.depositPaid)}</div></div>
                                <div className="bg-amber-50 rounded-xl p-3"><div className="text-zinc-500">المتبقي</div><div className="font-black text-amber-700">{fmtMoney(o.remaining)}</div></div>
                              </div>
                              <div className="flex gap-2">
                                <div className="flex-1 bg-white dark:bg-zinc-800 border rounded-xl p-3 text-center">
                                  <div className="text-[11px] text-zinc-500">باركود الطلب</div>
                                  <div className="flex justify-center my-2"><QRCodeSVG value={o.barcode} size={100}/></div>
                                  <div className="font-mono text-xs font-bold">{o.barcode}</div>
                                  <button onClick={()=>showToast('تمت الطباعة الحرارية')} className="mt-2 w-full py-2 rounded-xl bg-zinc-900 text-white text-xs flex items-center justify-center gap-1"><Printer size={12}/> طباعة الملصق</button>
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3">
                                    <div className="text-xs font-bold mb-1 flex items-center gap-1"><Mic size={12}/> ملاحظة صوتية</div>
                                    <button onClick={()=>showToast('تم تشغيل الملاحظة الصوتية 🔊')} className="w-full py-2 rounded-xl bg-violet-600 text-white text-xs">▶ تشغيل (0:12)</button>
                                    <button onClick={()=>showToast('تم التسجيل')} className="w-full mt-1 py-1.5 rounded-xl bg-white border text-xs">● تسجيل جديد</button>
                                  </div>
                                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3 text-xs">
                                    <div className="font-bold mb-1">حالة الاستلام</div>
                                    <div className="badge bg-sky-100 text-sky-700">{o.pickupStatus||o.status}</div>
                                    {o.pickupStatus==='Overdue_Pending_Admin_Review' && (
                                      <div className="mt-2 grid grid-cols-3 gap-1">
                                        <button onClick={()=>{store.updateOrder(o.id,{pickupStatus:'Awaiting_Pickup'}); showToast('تم تمديد المهلة'); setSelectedOrder(null)}} className="py-1.5 rounded-lg bg-amber-500 text-white text-[11px]">تمديد</button>
                                        <button onClick={()=>{store.updateOrder(o.id,{status:'Returned'}); showToast('تم الإرجاع')}} className="py-1.5 rounded-lg bg-red-500 text-white text-[11px]">إرجاع</button>
                                        <button onClick={()=>showToast('تم التصريف في المجموعات')} className="py-1.5 rounded-lg bg-zinc-900 text-white text-[11px]">تصريف</button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="card p-4">
                              <div className="font-bold text-sm mb-3">أصناف الطلب</div>
                              <div className="space-y-2">
                                {items.map(it=>(
                                  <div key={it.id} className="flex gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                                    <img src={it.image || `https://picsum.photos/seed/${it.id}/80/80`} className="w-14 h-14 rounded-xl object-cover"/>
                                    <div className="flex-1">
                                      <div className="font-bold text-sm">{it.name}</div>
                                      <div className="text-xs text-zinc-500">{it.color} • {it.size} • كود {it.sku||'—'}</div>
                                      <div className="text-xs font-bold">{fmtMoney(it.sellingPrice)} × {it.qty}</div>
                                    </div>
                                    <span className="badge bg-white border h-fit">{it.status}</span>
                                  </div>
                                ))}
                                {items.length===0 && <div className="text-center text-sm text-zinc-400 py-6">لا توجد أصناف — أضف من الحجوزات</div>}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={()=>{store.updateOrder(o.id,{status:'Delivered', pickupStatus:'Collected'}); showToast('تم تأكيد التسليم ✓'); setSelectedOrder(null)}} className="flex-1 btn-primary">تأكيد التسليم</button>
                              <button onClick={()=>showToast('تم إرسال تذكير واتساب')} className="flex-1 btn-ghost">تذكير واتساب</button>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* BOOKINGS */}
            {tab==='bookings' && (
              <div className="space-y-6">
                <h2 className="text-xl font-black flex items-center gap-2"><ShoppingCart className="text-violet-600"/> الحجوزات</h2>
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="card p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-black flex items-center gap-2"><Layers size={18}/> حجوزات التجار المحليين</span>
                      <button onClick={()=>setShowNewSupplier(true)} className="btn-primary py-2 text-xs"><Plus size={14}/> تاجر جديد</button>
                    </div>
                    <div className="space-y-2">
                      {suppliers.map(s=>(
                        <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                          <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center font-black">{s.name[0]}</div>
                          <div className="flex-1"><div className="font-bold text-sm">{s.name}</div><div className="text-xs text-zinc-500">{s.category} • {s.phone}</div></div>
                          <a href={`https://wa.me/${s.whatsapp}`} target="_blank" className="p-2 rounded-full bg-emerald-500 text-white"><MessageCircle size={14}/></a>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 text-white">
                      <div className="font-bold text-sm">إصدار فاتورة مشتريات</div>
                      <p className="text-xs opacity-80 mt-1">إنشاء فاتورة PDF احترافية ومشاركتها عبر واتساب بنقرة واحدة.</p>
                      <button onClick={()=>showToast('تم توليد فاتورة PDF للتاجر')} className="mt-3 bg-white text-violet-700 rounded-full px-4 py-2 text-xs font-black flex items-center gap-1"><FileText size={14}/> توليد فاتورة</button>
                    </div>
                  </div>
                  <div className="card p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-black flex items-center gap-2"><Globe size={18}/> طلبات SHEIN الجماعية</span>
                      <button onClick={()=>setShowNewShein(true)} className="btn-primary py-2 text-xs"><Plus size={14}/> حقيبة جديدة</button>
                    </div>
                    <div className="space-y-3">
                      {sheinOrders.map(sh=>(
                        <div key={sh.id} className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                          <div className="flex justify-between items-start">
                            <div><div className="font-mono font-bold text-sm">{sh.tracking}</div><div className="text-xs text-zinc-500">{sh.courier} • {fmtDate(sh.orderDate)}</div></div>
                            <span className={`badge ${sh.status==='Shipped'?'bg-sky-100 text-sky-700':'bg-amber-100 text-amber-700'}`}>{sh.status}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
                            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-2"><div className="text-zinc-500">الإجمالي</div><div className="font-bold">${sh.totalForeign}</div></div>
                            <div className="bg-emerald-50 rounded-xl p-2"><div className="text-zinc-500">الخصم</div><div className="font-bold text-emerald-700">-${sh.discount}</div></div>
                            <div className="bg-violet-50 rounded-xl p-2"><div className="text-zinc-500">الصافي</div><div className="font-bold text-violet-700">${sh.netPaid}</div></div>
                          </div>
                          <div className="text-[11px] text-zinc-500 mt-2">سعر الصرف: {sh.rate} • العملة: {sh.currency}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs">
                      <div className="font-bold text-amber-700">توزيع الخصومات تلقائياً</div>
                      <div className="text-zinc-600">يتم توزيع الكوبونات والخصومات بالتناسب على كل قطعة لحساب التكلفة الحقيقية.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CUSTOMERS */}
            {tab==='customers' && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3 items-center justify-between">
                  <h2 className="text-xl font-black flex items-center gap-2"><Users className="text-sky-600"/> العملاء</h2>
                  <div className="flex gap-2">
                    <button onClick={()=>{
                      const vcf = merchantCustomers.map(c=> `BEGIN:VCARD\nVERSION:3.0\nFN:${c.name}\nTEL:${c.phone}\nEND:VCARD`).join('\n');
                      const blob = new Blob([vcf],{type:'text/vcard'});
                      const url = URL.createObjectURL(blob);
                      const a=document.createElement('a'); a.href=url; a.download='tjaraty-customers.vcf'; a.click();
                      showToast('تم تصدير VCF ✓');
                    }} className="btn-ghost text-xs flex items-center gap-1"><Download size={14}/> تصدير VCF</button>
                    <button onClick={()=>setShowNewCustomer(true)} className="btn-primary"><Plus size={16}/> عميل جديد</button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {merchantCustomers.filter(c=> !search || c.name.includes(search) || c.phone.includes(search)).map(c=>(
                    <div key={c.id} className={`card p-4 border-2 ${c.rating==='Blacklisted'?'border-red-200 bg-red-50/30': c.rating==='VIP'?'border-amber-200 bg-amber-50/30':''}`}>
                      <div className="flex gap-3">
                        <img src={`https://i.pravatar.cc/100?u=${c.phone}`} className="w-12 h-12 rounded-full"/>
                        <div className="flex-1">
                          <div className="font-black flex items-center gap-2">{c.name} {c.rating==='VIP'&&<Star size={14} className="text-amber-500 fill-amber-500"/>}</div>
                          <div className="text-xs text-zinc-500 flex items-center gap-1"><Phone size={12}/>{c.phone}</div>
                          <div className="flex gap-1 mt-1">
                            <span className={`badge ${c.rating==='VIP'?'bg-amber-500 text-white': c.rating==='Blacklisted'?'bg-red-500 text-white': c.rating==='Late_Payer'?'bg-orange-500 text-white':'bg-emerald-500 text-white'}`}>{c.rating==='VIP'?'مميز':c.rating==='Blacklisted'?'محظور':c.rating==='Late_Payer'?'متأخر':'جيد'}</span>
                            {c.shoeSize && <span className="badge bg-zinc-100">👟 {c.shoeSize}</span>}
                            {c.clothingSize && <span className="badge bg-zinc-100">👗 {c.clothingSize}</span>}
                          </div>
                        </div>
                        <a href={`https://wa.me/${c.phone}`} target="_blank" className="h-fit p-2 rounded-full bg-emerald-500 text-white"><MessageCircle size={16}/></a>
                      </div>
                      {c.creditBalance>0 && <div className="mt-3 bg-emerald-600 text-white rounded-xl p-3 flex justify-between text-xs"><span>رصيد دائن</span><span className="font-black">{fmtMoney(c.creditBalance)}</span></div>}
                      {c.notes && <div className="mt-3 text-xs bg-white dark:bg-zinc-800 border rounded-xl p-2">{c.notes}</div>}
                      <div className="mt-3 flex gap-2">
                        <button onClick={()=>showToast('تم نسخ جهة الاتصال')} className="flex-1 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold">عرض الطلبات</button>
                        <button onClick={()=>showToast('تم فتح سجل المقاسات')} className="px-3 py-2 rounded-xl bg-white border text-xs">المقاسات</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* POINTS */}
            {tab==='points' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black flex items-center gap-2"><MapPin className="text-red-500"/> نقاط الأمانات</h2>
                  <button onClick={()=>setShowNewPoint(true)} className="btn-primary"><Plus size={16}/> نقطة جديدة</button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {merchantPoints.map(p=>(
                    <div key={p.id} className="card p-5">
                      <div className="flex justify-between items-start">
                        <div><div className="font-black">{p.name}</div><div className="text-xs text-zinc-500">{p.address}</div><div className="text-xs mt-1">مسؤول: {p.contact} • {p.phone}</div></div>
                        <span className={`badge ${p.settlement==='Cash'?'bg-emerald-100 text-emerald-700': p.settlement==='Bank_Transfer'?'bg-sky-100 text-sky-700':'bg-violet-100 text-violet-700'}`}>{p.settlement==='Cash'?'نقدي': p.settlement==='Bank_Transfer'?'بنكي':'كلاهما'}</span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button onClick={()=>{
                          const count = merchantOrders.filter(o=>o.deliveryPointId===p.id && o.pickupStatus==='Awaiting_Pickup').length;
                          store.addManifest({ id:'mf'+Date.now(), merchantId: currentMerchantId, pointId: p.id, createdAt: new Date().toISOString(), count, total: count*25000, status:'Generated'});
                          showToast('تم توليد كشف الأمانات PDF ✓');
                        }} className="py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-bold flex items-center justify-center gap-1"><FileText size={14}/> كشف مجمع</button>
                        <button onClick={()=>showToast('تمت الطباعة الحرارية')} className="py-2.5 rounded-xl bg-white border text-xs font-bold flex items-center justify-center gap-1"><Printer size={14}/> طباعة</button>
                      </div>
                      {p.bankInfo && <div className="mt-3 text-xs bg-sky-50 border border-sky-200 rounded-xl p-2">🏦 {p.bankInfo}</div>}
                    </div>
                  ))}
                </div>
                <div className="card p-4">
                  <div className="font-bold text-sm mb-3">كشوفات الأمانات الأخيرة</div>
                  <div className="space-y-2">
                    {manifests.filter(m=>m.merchantId===currentMerchantId).map(m=>(
                      <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center"><FileText size={18}/></div>
                        <div className="flex-1"><div className="font-mono font-bold text-sm">{m.id}</div><div className="text-xs text-zinc-500">{fmtDate(m.createdAt)} • {m.count} طلب • {fmtMoney(m.total)}</div></div>
                        <span className="badge bg-amber-100 text-amber-700">{m.status}</span>
                        <button onClick={()=>showToast('تم تحميل PDF')} className="p-2 rounded-lg bg-white border"><Download size={14}/></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* COURIERS */}
            {tab==='couriers' && (
              <div className="space-y-4">
                <h2 className="text-xl font-black flex items-center gap-2"><Truck className="text-amber-600"/> المناديب والتصفية</h2>
                <div className="grid lg:grid-cols-3 gap-4">
                  <div className="card p-5 lg:col-span-2">
                    <div className="font-bold mb-3">الطلبات المسندة للمندوب — {users.find(u=>u.role==='Courier')?.fullName}</div>
                    <div className="space-y-2">
                      {merchantOrders.filter(o=>o.deliveryType==='Courier').map(o=>{
                        const cust = merchantCustomers.find(c=>c.id===o.customerId);
                        return (
                          <div key={o.id} className="flex items-center gap-3 p-3 rounded-xl border">
                            <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-mono text-xs">{o.id.slice(-3)}</span>
                            <div className="flex-1"><div className="font-bold text-sm">{cust?.name}</div><div className="text-xs text-zinc-500">{fmtMoney(o.remaining)} مطلوب تحصيل</div></div>
                            <span className="badge bg-zinc-900 text-white">{o.status}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div className="card p-5 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white">
                    <div className="font-black mb-3">تصفية عهدة المندوب</div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between bg-white/10 rounded-xl p-3"><span>محصّل نقداً</span><span className="font-black">{fmtMoney(86000)}</span></div>
                      <div className="flex justify-between bg-white/10 rounded-xl p-3"><span>تحويلات</span><span className="font-black">{fmtMoney(42000)}</span></div>
                      <div className="flex justify-between bg-emerald-500 rounded-xl p-3 font-black"><span>الصافي للتسليم</span><span>{fmtMoney(128000)}</span></div>
                      <button onClick={()=>showToast('تمت تصفية عهدة المندوب ✓')} className="w-full py-3 rounded-xl bg-white text-zinc-900 font-black">تصفية بنقرة واحدة</button>
                      <div className="text-[11px] opacity-60 text-center">يتم تسجيل العملية في سجل العمليات تلقائياً</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FINANCES */}
            {tab==='finances' && (
              <div className="space-y-6">
                <h2 className="text-xl font-black flex items-center gap-2"><Wallet className="text-emerald-600"/> المالية — العربون والمصروفات والأرباح</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="card p-4"><div className="text-xs text-zinc-500">إجمالي العربون المحصّل</div><div className="text-xl font-black mt-1">{fmtMoney(transactions.filter(t=>t.type==='Deposit').reduce((s,t)=>s+t.amount,0))}</div></div>
                  <div className="card p-4"><div className="text-xs text-zinc-500">إجمالي المصروفات</div><div className="text-xl font-black mt-1 text-red-600">{fmtMoney(expenses.reduce((s,e)=>s+e.amount,0))}</div></div>
                  <div className="card p-4 bg-emerald-600 text-white"><div className="text-xs opacity-90">الربح الصافي</div><div className="text-xl font-black mt-1">{fmtMoney(kpis.totalProfit - expenses.reduce((s,e)=>s+e.amount,0))}</div><div className="text-[11px] opacity-80">المعادلة: (بيع - شراء) × الصرف − مصاريف</div></div>
                </div>
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="card p-5">
                    <div className="flex justify-between items-center mb-3"><span className="font-bold">المعاملات المالية</span><button onClick={()=>{
                      const amt = prompt('مبلغ العربون؟','15000');
                      if(amt) { store.addTransaction({ id:'t'+Date.now(), merchantId: currentMerchantId, type:'Deposit', amount: Number(amt), currency:'YER', method:'Cash', createdAt: new Date().toISOString(), createdBy: currentUser.id}); showToast('تم تسجيل العملية');}
                    }} className="btn-primary py-1.5 text-xs"><Plus size={12}/> معاملة</button></div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {transactions.map(t=>(
                        <div key={t.id} className="flex justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-sm">
                          <div><div className="font-bold">{t.type}</div><div className="text-xs text-zinc-500">{fmtDate(t.createdAt)} • {t.method}</div></div>
                          <div className="font-black">{fmtMoney(t.amount)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card p-5">
                    <div className="flex justify-between items-center mb-3"><span className="font-bold">المصروفات</span><button onClick={()=>{
                      const amt = prompt('مبلغ المصروف؟','5000');
                      const cat = prompt('الفئة؟','شحن');
                      if(amt) { store.addExpense({ id:'e'+Date.now(), merchantId: currentMerchantId, category: cat||'عام', amount: Number(amt), date: new Date().toISOString(), userId: currentUser.id}); showToast('تم تسجيل المصروف');}
                    }} className="btn-primary py-1.5 text-xs bg-red-600 hover:bg-red-700"><Plus size={12}/> مصروف</button></div>
                    <div className="space-y-2">
                      {expenses.map(e=>(
                        <div key={e.id} className="flex justify-between p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 text-sm">
                          <div><div className="font-bold">{e.category}</div><div className="text-xs text-zinc-500">{e.notes}</div></div>
                          <div className="font-black text-red-600">{fmtMoney(e.amount)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="card p-5">
                  <div className="font-bold mb-3">الديون — تسليم مع متبقٍ</div>
                  <div className="space-y-2">
                    {merchantOrders.filter(o=>o.isDebt).map(o=>{
                      const cust = customers.find(c=>c.id===o.customerId);
                      return <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200"><span className="text-sm"><b>{cust?.name}</b> — {o.id} • متبقي {fmtMoney(o.remaining)} • استحقاق {o.debtDue}</span><button onClick={()=>showToast('تم إرسال تذكير واتساب للعميل')} className="px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs">تذكير واتساب</button></div>
                    })}
                    {merchantOrders.filter(o=>o.isDebt).length===0 && <div className="text-center text-sm text-zinc-400 py-6">لا توجد ديون حالياً</div>}
                  </div>
                </div>
              </div>
            )}

            {/* CURRENCIES */}
            {tab==='currencies' && (
              <div className="space-y-4">
                <h2 className="text-xl font-black flex items-center gap-2"><Coins className="text-amber-500"/> العملات وأسعار الصرف</h2>
                <div className="card p-5">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {currencies.map(c=>(
                      <div key={c.code} className={`p-4 rounded-2xl border-2 ${c.isBase?'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20':'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'}`}>
                        <div className="flex justify-between items-start"><span className="font-black">{c.code}</span>{c.isBase && <span className="badge bg-emerald-600 text-white">أساسية</span>}</div>
                        <div className="text-sm text-zinc-500">{c.name}</div>
                        <div className="mt-3 flex items-center gap-2">
                          <input type="number" value={c.rate} onChange={e=>store.updateCurrency(c.code, Number(e.target.value))} disabled={c.isBase} className="input py-2 text-sm"/>
                          <span className="text-xs text-zinc-500">ر.ي</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-1">مثبت وقت الطلب — لا يتأثر بالتذبذب</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-800">💱 الشراء بالعملة الأجنبية والبيع بالمحلية — سعر الصرف يثبت عند تسجيل الطلب لضمان دقة الأرباح.</div>
                </div>
              </div>
            )}

            {/* COUPONS */}
            {tab==='coupons' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-black flex items-center gap-2"><Tag className="text-pink-500"/> الكوبونات والعروض</h2>
                  <button onClick={()=>setShowNewCoupon(true)} className="btn-primary"><Plus size={16}/> كوبون جديد</button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {coupons.map(cp=>(
                    <div key={cp.id} className="card p-4 border-dashed border-2">
                      <div className="flex justify-between"><span className="font-mono font-black text-lg">{cp.code}</span><span className={`badge ${cp.isActive?'bg-emerald-100 text-emerald-700':'bg-zinc-200'}`}>{cp.isActive?'نشط':'منتهي'}</span></div>
                      <div className="text-sm mt-1">{cp.type==='Percentage'?`خصم ${cp.value}%`: cp.type==='Fixed_Amount'?`خصم ${fmtMoney(cp.value)}`:'توصيل مجاني'} {cp.group?`• ${cp.group}`:''}</div>
                      <div className="text-xs text-zinc-500">ينتهي {fmtDate(cp.expiry)}</div>
                      <button onClick={()=>{navigator.clipboard.writeText(cp.code); showToast('تم نسخ الكود')}} className="mt-3 w-full py-2 rounded-xl bg-zinc-900 text-white text-xs flex items-center justify-center gap-1"><Copy size={12}/> نسخ الكود</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SHEIN CALC */}
            {tab==='sheinCalc' && (
              <div className="space-y-6 max-w-3xl">
                <h2 className="text-xl font-black flex items-center gap-2"><Calculator className="text-violet-600"/> حاسبة تسعير شي إن الذكية</h2>
                <div className="card p-6 space-y-4">
                  <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 text-xs text-violet-800">المعادلة: <b>سعر البيع = (سعر SHEIN × سعر الصرف) + الشحن + العمولة + هامش الربح</b></div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="space-y-1"><span className="text-xs font-bold">سعر SHEIN ($)</span><input type="number" value={sheinPrice} onChange={e=>setSheinPrice(Number(e.target.value))} className="input"/></label>
                    <label className="space-y-1"><span className="text-xs font-bold">سعر الصرف</span><input type="number" value={sheinRate} onChange={e=>setSheinRate(Number(e.target.value))} className="input"/></label>
                    <label className="space-y-1"><span className="text-xs font-bold">تكلفة الشحن المتوقعة (ر.ي)</span><input type="number" value={sheinShipping} onChange={e=>setSheinShipping(Number(e.target.value))} className="input"/></label>
                    <label className="space-y-1"><span className="text-xs font-bold">نسبة العمولة والمصاريف (%)</span><input type="number" value={sheinCommission} onChange={e=>setSheinCommission(Number(e.target.value))} className="input"/></label>
                    <label className="space-y-1 md:col-span-2"><span className="text-xs font-bold">هامش الربح المستهدف (ر.ي)</span><input type="number" value={sheinProfit} onChange={e=>setSheinProfit(Number(e.target.value))} className="input"/></label>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-6 text-white text-center">
                    <div className="text-sm opacity-90">سعر البيع المقترح</div>
                    <div className="text-3xl font-black mt-1">{fmtMoney(sheinSuggested)}</div>
                    <div className="text-xs opacity-80 mt-1">يضمن هامش ربح {fmtMoney(sheinProfit)} بعد كل التكاليف</div>
                    <button onClick={()=>showToast(`تم نسخ السعر: ${fmtMoney(sheinSuggested)}`)} className="mt-4 bg-white text-emerald-700 rounded-full px-6 py-2 text-sm font-black">نسخ السعر</button>
                  </div>
                </div>
              </div>
            )}

            {/* WHATSAPP TOOLS */}
            {tab==='waTools' && (
              <div className="space-y-6">
                <h2 className="text-xl font-black flex items-center gap-2"><MessageCircle className="text-emerald-600"/> أدوات واتساب — مولد الإعلانات ورابط السلة</h2>
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="card p-5 space-y-4">
                    <div className="font-bold flex items-center gap-2"><Sparkles size={16} className="text-amber-500"/> مولّد ملخص المنتج للواتساب</div>
                    <input value={waProduct.name} onChange={e=>setWaProduct({...waProduct, name:e.target.value})} placeholder="اسم المنتج" className="input"/>
                    <div className="grid grid-cols-2 gap-3">
                      <input value={waProduct.sizes} onChange={e=>setWaProduct({...waProduct, sizes:e.target.value})} placeholder="المقاسات" className="input"/>
                      <input value={waProduct.colors} onChange={e=>setWaProduct({...waProduct, colors:e.target.value})} placeholder="الألوان" className="input"/>
                    </div>
                    <input value={waProduct.price} onChange={e=>setWaProduct({...waProduct, price:e.target.value})} placeholder="السعر" className="input"/>
                    <button onClick={()=>{
                      const txt = `✨ *${waProduct.name}* ✨\n📏 المقاسات: ${waProduct.sizes}\n🎨 الألوان: ${waProduct.colors}\n💰 السعر: ${waProduct.price}\n📲 للطلب واتساب: https://wa.me/967777123456\n— تِجارتي`;
                      navigator.clipboard.writeText(txt); showToast('تم نسخ الإعلان الجاهز ✓');
                    }} className="w-full btn-primary"><Copy size={16}/> توليد ونسخ الإعلان</button>
                    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3 text-sm leading-relaxed whitespace-pre-wrap">
{`✨ *${waProduct.name}* ✨
📏 المقاسات: ${waProduct.sizes}
🎨 الألوان: ${waProduct.colors}
💰 السعر: ${waProduct.price}
📲 للطلب واتساب: https://wa.me/967777123456
— تِجارتي`}
                    </div>
                  </div>
                  <div className="card p-5 space-y-4">
                    <div className="font-bold flex items-center gap-2"><Link2 size={16}/> رابط السلة التفاعلي</div>
                    <select className="input" onChange={e=>showToast('تم اختيار الطلب '+e.target.value)}>
                      <option>اختر طلباً</option>
                      {merchantOrders.slice(0,5).map(o=> <option key={o.id}>{o.id}</option>)}
                    </select>
                    <div className="bg-white border rounded-2xl p-4 text-center">
                      <div className="text-xs text-zinc-500 mb-2">يستعرض العميل صوره وحالته وحسابه</div>
                      <div className="flex justify-center"><QRCodeSVG value="https://tjaraty.app/cart/ORD-2026-000125" size={140}/></div>
                      <div className="font-mono text-xs mt-2">https://tjaraty.app/cart/ORD-2026-000125</div>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <button onClick={()=>showToast('تم نسخ الرابط')} className="py-2 rounded-xl bg-zinc-900 text-white text-xs">نسخ الرابط</button>
                        <a href="https://wa.me/967777123456?text=رابط سلتك: https://tjaraty.app/cart/ORD" target="_blank" className="py-2 rounded-xl bg-emerald-500 text-white text-xs flex items-center justify-center gap-1"><Send size={12}/> مشاركة واتساب</a>
                      </div>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs">
                      <b>بحث بالصورة:</b> ارفع صورة المنتج وسيبحث النظام عن الطلبات المطابقة تلقائياً (ذكاء بصري قريباً).
                      <label className="mt-2 flex items-center justify-center gap-2 py-2 rounded-xl bg-white border text-xs font-bold cursor-pointer"><Upload size={14}/> رفع صورة للبحث<input type="file" className="hidden" onChange={()=>showToast('تم تحليل الصورة — وُجدت 2 نتائج مطابقة')}/></label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* RETURNS */}
            {tab==='returns' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-black flex items-center gap-2"><Undo2 className="text-red-500"/> المرتجعات والتالف</h2>
                  <button onClick={()=>{
                    const orderId = prompt('رقم الطلب؟','ORD-2026-000125');
                    if(orderId) { store.addReturn({ id:'ret'+Date.now(), merchantId: currentMerchantId, orderId, type:'Customer_Return', destination:'Local_Supplier_Refund', qty:1, action:'Cash_Refund', amount:15000, date: new Date().toISOString()}); showToast('تم تسجيل المرتجع');}
                  }} className="btn-primary bg-red-600 hover:bg-red-700"><Plus size={16}/> تسجيل مرتجع</button>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="card p-4 text-center"><div className="text-2xl font-black">{returns.length + 3}</div><div className="text-xs text-zinc-500">مرتجعات هذا الشهر</div></div>
                  <div className="card p-4 text-center"><div className="text-2xl font-black">2</div><div className="text-xs text-zinc-500">تالف أثناء الشحن</div></div>
                  <div className="card p-4 text-center bg-amber-50 border-amber-200"><div className="text-2xl font-black">1</div><div className="text-xs text-zinc-500">بانتظار قرار آدمن</div></div>
                </div>
                <div className="card p-5">
                  <div className="font-bold mb-3">سجل المرتجعات</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border">
                      <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center"><Undo2 size={18}/></div>
                      <div className="flex-1"><div className="font-bold text-sm">ORD-2026-000129 — فستان SHEIN</div><div className="text-xs text-zinc-500">عدم مطابقة المقاس • إرجاع للتاجر المحلي • استرداد نقدي 15,000 ر.ي</div></div>
                      <span className="badge bg-amber-100 text-amber-700">بانتظار موافقة</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border">
                      <div className="w-10 h-10 rounded-xl bg-zinc-200 flex items-center justify-center"><Box size={18}/></div>
                      <div className="flex-1"><div className="font-bold text-sm">ORD-2026-000127 — شحنة تالفة</div><div className="text-xs text-zinc-500">تالف أثناء الشحن • SHEIN • تسجيل كخسارة 22,000 ر.ي</div></div>
                      <span className="badge bg-red-100 text-red-700">خسارة</span>
                    </div>
                  </div>
                  <div className="mt-4 bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs">ℹ️ منتجات التجار المحليين تُعاد للتاجر لاسترداد القيمة، أما SHEIN فتُسجل كخسارة أو تُعرض على عميل آخر في المجموعات.</div>
                </div>
              </div>
            )}

            {/* APPROVALS */}
            {tab==='approvals' && (
              <div className="space-y-4">
                <h2 className="text-xl font-black flex items-center gap-2"><ShieldCheck className="text-violet-600"/> مركز الموافقات المزدوجة</h2>
                <div className="card p-4 border-violet-200 bg-violet-50/50 dark:bg-violet-950/20">
                  <div className="text-sm font-bold text-violet-700">🔐 لا يمكن للموظفين تنفيذ عمليات مالية حساسة إلا بموافقة الآدمن بالبصمة/PIN</div>
                </div>
                <div className="space-y-3">
                  {approvals.map(a=>(
                    <div key={a.id} className="card p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center"><ShieldCheck size={20}/></div>
                      <div className="flex-1">
                        <div className="font-bold text-sm">{a.type==='Cash_Refund'?'طلب استرداد نقدي': a.type==='Debt_Cancellation'?'إلغاء دين':'تعديل سعر صرف'} — {fmtMoney(a.amount)}</div>
                        <div className="text-xs text-zinc-500">الطلب {a.orderId} • السبب: {a.reason} • طلب بواسطة {users.find(u=>u.id===a.requestedBy)?.fullName}</div>
                        <div className="text-[11px] text-zinc-400">{fmtDate(a.timestamp)}</div>
                      </div>
                      {a.status==='Pending' ? (
                        <div className="flex gap-2">
                          <button onClick={()=>{store.decideApproval(a.id,'Approved'); showToast('تمت الموافقة بالبصمة ✓')}} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1"><Fingerprint size={14}/> موافقة</button>
                          <button onClick={()=>store.decideApproval(a.id,'Rejected')} className="px-4 py-2 rounded-xl bg-white border text-xs font-bold">رفض</button>
                        </div>
                      ): <span className={`badge ${a.status==='Approved'?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}`}>{a.status}</span>}
                    </div>
                  ))}
                  {approvals.length===0 && <div className="text-center text-sm text-zinc-400 py-10 card">لا توجد طلبات موافقة حالياً</div>}
                </div>
              </div>
            )}

            {/* REPORTS */}
            {tab==='reports' && (
              <div className="space-y-6">
                <h2 className="text-xl font-black flex items-center gap-2"><BarChart3 className="text-sky-600"/> التقارير والتصدير</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    {title:'تقرير المبيعات', icon: TrendingUp, color:'bg-emerald-500'},
                    {title:'أرباح SHEIN', icon: Globe, color:'bg-violet-500'},
                    {title:'ديون العملاء', icon: CreditCard, color:'bg-amber-500'},
                    {title:'المخزون الراكد', icon: Archive, color:'bg-red-500'},
                  ].map(r=>(
                    <div key={r.title} className="card p-4 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${r.color} text-white flex items-center justify-center`}><r.icon size={18}/></div>
                      <div className="flex-1"><div className="font-bold text-sm">{r.title}</div><div className="text-xs text-zinc-500">PDF / Excel</div></div>
                      <button onClick={()=>showToast(`تم تصدير ${r.title} PDF ✓`)} className="p-2 rounded-lg bg-zinc-900 text-white"><Download size={14}/></button>
                    </div>
                  ))}
                </div>
                <div className="card p-5">
                  <div className="flex justify-between items-center mb-4"><span className="font-bold">تحليل الأرباح</span><span className="text-xs text-zinc-500">آخر 6 أشهر</span></div>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[
                        {m:'يناير', profit: 320000}, {m:'فبراير', profit: 410000}, {m:'مارس', profit: 380000}, {m:'أبريل', profit: 520000}, {m:'مايو', profit: 610000}, {m:'يونيو', profit: 580000}
                      ]}>
                        <XAxis dataKey="m" tick={{fontSize:12}} axisLine={false}/>
                        <YAxis tick={{fontSize:12}} axisLine={false}/>
                        <Tooltip/>
                        <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} dot={{r:4}}/>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={()=>showToast('تم تصدير Excel')} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold">تصدير Excel</button>
                    <button onClick={()=>showToast('تم تصدير PDF')} className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-bold">تصدير PDF</button>
                  </div>
                </div>
              </div>
            )}

            {/* USERS */}
            {tab==='users' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-black">إدارة المستخدمين</h2>
                  <button onClick={()=>{
                    const name = prompt('اسم الموظف؟');
                    if(name) { store.addLog({ id:'log'+Date.now(), merchantId: currentMerchantId, userId: currentUser.id, action:'إضافة مستخدم', target:'Users', details:name, timestamp: new Date().toISOString()}); showToast('تمت إضافة المستخدم — تجاوز الحد؟ تحقق من الباقة');}
                  }} className="btn-primary"><Plus size={16}/> مستخدم جديد</button>
                </div>
                <div className="card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-500"><tr><th className="p-3 text-right">المستخدم</th><th className="p-3">الدور</th><th className="p-3">الحالة</th><th className="p-3">إجراءات</th></tr></thead>
                    <tbody>
                      {users.filter(u=> u.merchantId===currentMerchantId).map(u=>(
                        <tr key={u.id} className="border-t">
                          <td className="p-3 flex items-center gap-2"><img src={`https://i.pravatar.cc/100?u=${u.id}`} className="w-8 h-8 rounded-full"/><span className="font-bold">{u.fullName}</span><span className="text-xs text-zinc-500">@{u.username}</span></td>
                          <td className="p-3"><span className="badge bg-zinc-100">{u.role}</span></td>
                          <td className="p-3"><span className={`badge ${u.isActive?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}`}>{u.isActive?'نشط':'موقوف'}</span></td>
                          <td className="p-3 flex gap-1"><button className="p-1.5 rounded-lg bg-white border"><Edit size={14}/></button><button className="p-1.5 rounded-lg bg-red-50 text-red-600"><Trash2 size={14}/></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="card p-4 bg-amber-50 border-amber-200 text-xs">👥 الحد الأقصى حسب الباقة: <b>{currentMerchant.maxUsers} مستخدمين</b> — للترقية تواصل مع المالك.</div>
              </div>
            )}

            {/* AUDIT */}
            {tab==='audit' && (
              <div className="space-y-4">
                <h2 className="text-xl font-black flex items-center gap-2"><FileText className="text-zinc-600"/> سجل العمليات (Audit Log)</h2>
                <div className="card p-4 space-y-2 max-h-[600px] overflow-y-auto">
                  {auditLogs.filter(l=> l.merchantId===currentMerchantId).map(l=>(
                    <div key={l.id} className="flex gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border text-sm">
                      <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs">{users.find(u=>u.id===l.userId)?.fullName[0]||'?'}</div>
                      <div className="flex-1"><div className="font-bold">{l.action} — {l.target}</div><div className="text-xs text-zinc-500">{l.details} • {new Date(l.timestamp).toLocaleString('ar-YE')}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SETTINGS */}
            {tab==='settings' && (
              <div className="space-y-6 max-w-3xl">
                <h2 className="text-xl font-black flex items-center gap-2"><Settings className="text-zinc-600"/> الإعدادات وحقوق الملكية</h2>
                <div className="card p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800">
                    <div><div className="font-bold text-sm">الوضع الداكن</div><div className="text-xs text-zinc-500">تفعيل المظهر الليلي</div></div>
                    <button onClick={()=>store.toggleDark()} className={`w-12 h-7 rounded-full p-1 transition ${darkMode?'bg-emerald-600':'bg-zinc-300'}`}><span className={`block w-5 h-5 rounded-full bg-white transition ${darkMode?'translate-x-5':''}`}></span></button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800">
                    <div><div className="font-bold text-sm flex items-center gap-2"><Fingerprint size={16}/> الدخول بالبصمة</div><div className="text-xs text-zinc-500">تأكيد المعاملات الحساسة</div></div>
                    <span className="badge bg-emerald-100 text-emerald-700">مفعل ✓</span>
                  </div>
                  <div className="p-4 rounded-2xl border-2 border-dashed space-y-2">
                    <div className="font-bold text-sm flex items-center gap-2"><Printer size={16}/> طابعة البلوتوث الحرارية</div>
                    <div className="flex gap-2"><button onClick={()=>showToast('تم البحث عن الطابعات — وُجدت: XP-58')} className="btn-primary py-2 text-xs">بحث عن طابعة</button><button onClick={()=>showToast('تمت طباعة صفحة اختبار 🖨️')} className="btn-ghost py-2 text-xs">طباعة اختبار</button></div>
                  </div>
                  <div className="p-4 rounded-2xl border space-y-2">
                    <div className="font-bold text-sm flex items-center gap-2"><Send size={16}/> بوت تليجرام للطوارئ</div>
                    <input placeholder="مثال: @tjaraty_bot Token" className="input"/>
                    <div className="text-xs text-zinc-500">إشعارات فورية للآدمن عند الطلبات الكبيرة والحظر وتجاوز المصروف.</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white text-center">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3 font-black text-xl">ت</div>
                    <div className="font-black">تِجارتي — أعداد د. عبدالله عبدالمجيد الحميري</div>
                    <div className="text-xs opacity-80 mt-1">© جميع الحقوق الفكرية والمعمارية ولوحة السوبر آدمن محفوظة للمالك الحصري</div>
                    <div className="text-[11px] opacity-60 mt-2">الإصدار 1.0 — SaaS Multi-Tenant • Firebase Firestore • Offline First</div>
                  </div>
                </div>
              </div>
            )}

            {/* SUPER ADMIN */}
            {tab==='superadmin' && currentUser.role==='SuperAdmin' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-[24px] p-6 text-white">
                  <div className="flex items-center gap-3"><Crown size={32}/><div><div className="text-2xl font-black">لوحة تحكم المالك 👑</div><div className="text-sm opacity-90">د. عبدالله عبدالمجيد الحميري — التحكم الكامل بالاشتراكات السنوية</div></div></div>
                  <div className="grid grid-cols-3 gap-3 mt-6 text-center">
                    <div className="bg-white/15 backdrop-blur rounded-2xl p-4"><div className="text-2xl font-black">{merchants.length}</div><div className="text-xs">إجمالي التجار</div></div>
                    <div className="bg-white/15 backdrop-blur rounded-2xl p-4"><div className="text-2xl font-black">{merchants.filter(m=>m.isActive && daysLeft(m.endDate)>0).length}</div><div className="text-xs">نشط</div></div>
                    <div className="bg-white/15 backdrop-blur rounded-2xl p-4"><div className="text-2xl font-black">{merchants.filter(m=> daysLeft(m.endDate)<=15 && daysLeft(m.endDate)>0).length}</div><div className="text-xs">قريب الانتهاء</div></div>
                  </div>
                </div>

                <div className="card p-5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-black">إدارة التجار والاشتراكات السنوية</span>
                    <button onClick={()=>{
                      const name = prompt('اسم المتجر الجديد؟');
                      const phone = prompt('رقم هاتف المالك؟');
                      if(name && phone){
                        store.addMerchant({ id:'m'+Date.now(), name, ownerPhone: phone, startDate: new Date().toISOString(), endDate: new Date(Date.now()+365*86400000).toISOString(), isActive:true, maxUsers:5, plan:'basic'});
                        showToast('تم إنشاء التاجر وتوليد بيانات الدخول ✓');
                      }
                    }} className="btn-primary"><Plus size={16}/> تاجر جديد</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-500"><tr><th className="p-3 text-right">المتجر</th><th className="p-3">الاشتراك</th><th className="p-3">الحالة</th><th className="p-3">الباقة</th><th className="p-3">إجراءات</th></tr></thead>
                      <tbody>
                        {merchants.map(m=>{
                          const d = daysLeft(m.endDate);
                          return (
                            <tr key={m.id} className="border-t">
                              <td className="p-3"><div className="font-bold">{m.name}</div><div className="text-xs text-zinc-500">{m.ownerPhone} • {m.maxUsers} مستخدمين</div></td>
                              <td className="p-3 text-xs"><div>{fmtDate(m.startDate)} → {fmtDate(m.endDate)}</div><div className={d<=15?'text-amber-600 font-bold': d<=0?'text-red-600 font-bold':'text-emerald-600'}>{d>0?`متبقي ${d} يوم`: `منتهي منذ ${Math.abs(d)} يوم`}</div></td>
                              <td className="p-3"><span className={`badge ${m.isActive && d>0?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}`}>{m.isActive && d>0?'نشط':'مقفل 🔒'}</span></td>
                              <td className="p-3"><span className="badge bg-zinc-900 text-white">{m.plan}</span></td>
                              <td className="p-3 flex gap-1">
                                <button onClick={()=>{store.renewMerchant(m.id); showToast('تم التجديد +365 يوم ✓')}} className="px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold">تجديد سنة</button>
                                <button onClick={()=>store.toggleMerchantActive(m.id)} className="px-3 py-1.5 rounded-full bg-white border text-xs">{m.isActive?'تجميد':'تفعيل'}</button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="card p-5">
                    <div className="font-bold mb-2">سجل فواتير الاشتراكات</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800"><span>متجر الأناقة — تجديد 2025</span><span className="font-bold">$120 — 12/01/2025</span></div>
                      <div className="flex justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800"><span>عالم شي إن — متأخر</span><span className="font-bold text-red-600">غير مدفوع</span></div>
                    </div>
                  </div>
                  <div className="card p-5 bg-zinc-900 text-white">
                    <div className="font-bold mb-2">نظام الإحالة</div>
                    <div className="text-sm opacity-80">كود إحالة لكل تاجر — خصم 10% للمدعو والمحيل عند تجديد الاشتراك.</div>
                    <button onClick={()=>showToast('تم نسخ رابط الإحالة')} className="mt-3 w-full py-2 rounded-xl bg-white text-zinc-900 font-black text-sm">نسخ رابط الإحالة</button>
                  </div>
                </div>
              </div>
            )}

            {/* FOOTER */}
            <div className="text-center text-[11px] text-zinc-400 py-6 border-t border-zinc-200 dark:border-zinc-800 mt-8">
              «تِجارتي» — أعداد د. عبدالله عبدالمجيد الحميري © جميع الحقوق محفوظة • {new Date().getFullYear()} • من الطلب إلى التسليم والتحصيل — كل شيء في مكان واحد
            </div>
          </main>
        </div>

        {/* FAB */}
        <button onClick={()=>setShowNewOrder(true)} className="fixed bottom-6 left-6 w-14 h-14 rounded-full bg-emerald-600 text-white shadow-xl flex items-center justify-center md:hidden"><Plus size={24}/></button>

        {/* TOAST */}
        {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-5 py-3 rounded-full text-sm font-bold shadow-xl z-50 flex items-center gap-2"><Check size={16} className="text-emerald-400"/>{toast}</div>}
      </div>

      {/* MODALS */}
      {showNewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setShowNewOrder(false)}/>
          <div className="relative bg-white dark:bg-zinc-900 rounded-[24px] w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4"><h3 className="font-black text-lg">طلب جديد</h3><button onClick={()=>setShowNewOrder(false)} className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800"><X size={18}/></button></div>
            <form onSubmit={e=>{
              e.preventDefault();
              const fd = new FormData(e.currentTarget as HTMLFormElement);
              const custId = fd.get('customer') as string;
              const total = Number(fd.get('total'));
              const deposit = Number(fd.get('deposit'));
              const delivery = fd.get('delivery') as any;
              const id = `ORD-2026-${String(merchantOrders.length+130).padStart(6,'0')}`;
              const newOrder: any = { id, merchantId: currentMerchantId, barcode: id, customerId: custId, orderDate: new Date().toISOString(), source:'WhatsApp', deliveryType: delivery==='courier'?'Courier':'Delivery_Point', deliveryPointId: delivery==='point'? merchantPoints[0]?.id: undefined, courierId: delivery==='courier'? users.find(u=>u.role==='Courier')?.id: undefined, status: deposit>0?'Confirmed':'Pending_Deposit', totalAmount: total, discount:0, depositPaid: deposit, remaining: total-deposit, depositTimer: deposit===0? new Date(Date.now()+12*3600000).toISOString(): undefined, pickupStatus: 'Awaiting_Pickup', isDeadStock:false };
              store.addOrder(newOrder, []);
              // check blacklist
              const cust = customers.find(c=>c.id===custId);
              if(cust?.rating==='Blacklisted') showToast('⚠️ تنبيه: العميل محظور — كثير الإلغاء!');
              else if(cust?.rating==='Late_Payer') showToast('⚠️ تنبيه: عميل متأخر في السداد');
              else showToast('تم إنشاء الطلب '+id+' ✓');
              setShowNewOrder(false);
            }} className="space-y-3">
              <select name="customer" required className="input"><option value="">اختر العميل</option>{merchantCustomers.map(c=> <option key={c.id} value={c.id}>{c.name} — {c.phone} ({c.rating})</option>)}</select>
              <div className="grid grid-cols-2 gap-3">
                <input name="total" type="number" placeholder="الإجمالي (ر.ي)" required className="input"/>
                <input name="deposit" type="number" placeholder="العربون" defaultValue="0" className="input"/>
              </div>
              <select name="delivery" className="input"><option value="point">أمانات — {merchantPoints[0]?.name}</option><option value="courier">مندوب توصيل</option></select>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs">⏳ سيتم تفعيل مؤقت 12 ساعة للعربون — إلغاء تلقائي عند عدم السداد (قابل للتعديل).</div>
              <button type="submit" className="w-full btn-primary py-3">حفظ الطلب وطباعة الملصق</button>
              <div className="flex gap-2 text-xs">
                <button type="button" onClick={()=>showToast('تم إنشاء رابط السلة')} className="flex-1 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold">+ رابط سلة</button>
                <button type="button" onClick={()=>showToast('تم فتح ماسح الباركود')} className="flex-1 py-2 rounded-xl bg-zinc-100 font-bold flex items-center justify-center gap-1"><QrCode size={14}/> مسح</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNewCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setShowNewCustomer(false)}/>
          <div className="relative bg-white dark:bg-zinc-900 rounded-[24px] w-full max-w-md p-6">
            <div className="flex justify-between mb-4"><h3 className="font-black">عميل جديد</h3><button onClick={()=>setShowNewCustomer(false)} className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800"><X size={18}/></button></div>
            <form onSubmit={e=>{
              e.preventDefault();
              const fd=new FormData(e.currentTarget as HTMLFormElement);
              const c:any={ id:'c'+Date.now(), merchantId: currentMerchantId, name: fd.get('name'), phone: fd.get('phone'), rating: fd.get('rating'), creditBalance:0, shoeSize: fd.get('shoe'), clothingSize: fd.get('cloth'), notes: fd.get('notes'), createdAt: new Date().toISOString()};
              store.addCustomer(c); showToast('تم إضافة العميل وإنشاء VCF ✓'); setShowNewCustomer(false);
            }} className="space-y-3">
              <input name="name" placeholder="الاسم" required className="input"/>
              <input name="phone" placeholder="رقم الهاتف" required className="input"/>
              <div className="grid grid-cols-2 gap-3">
                <select name="rating" className="input"><option value="Good">جيد</option><option value="VIP">VIP</option><option value="Late_Payer">متأخر</option><option value="Blacklisted">محظور</option></select>
                <input name="shoe" placeholder="مقاس الحذاء" className="input"/>
              </div>
              <input name="cloth" placeholder="مقاس الملابس" className="input"/>
              <textarea name="notes" placeholder="ملاحظات" className="input h-20"/>
              <button type="submit" className="w-full btn-primary">حفظ وتصدير VCF</button>
            </form>
          </div>
        </div>
      )}

      {showNewPoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setShowNewPoint(false)}/>
          <div className="relative bg-white dark:bg-zinc-900 rounded-[24px] w-full max-w-md p-6">
            <h3 className="font-black mb-4">نقطة أمانات جديدة</h3>
            <form onSubmit={e=>{
              e.preventDefault();
              const fd=new FormData(e.currentTarget as HTMLFormElement);
              store.addPoint({ id:'p'+Date.now(), merchantId: currentMerchantId, name: fd.get('name') as string, phone: fd.get('phone') as string, address: fd.get('address') as string, contact: fd.get('contact') as string, settlement: fd.get('settlement') as any});
              showToast('تمت إضافة نقطة الأمانات ✓'); setShowNewPoint(false);
            }} className="space-y-3">
              <input name="name" placeholder="اسم المحل" required className="input"/>
              <input name="phone" placeholder="الهاتف" className="input"/>
              <input name="address" placeholder="العنوان" className="input"/>
              <input name="contact" placeholder="الشخص المسؤول" className="input"/>
              <select name="settlement" className="input"><option value="Cash">نقدي</option><option value="Bank_Transfer">بنكي</option><option value="Both">كلاهما</option></select>
              <button type="submit" className="w-full btn-primary">حفظ</button>
            </form>
          </div>
        </div>
      )}

      {showNewCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setShowNewCoupon(false)}/>
          <div className="relative bg-white dark:bg-zinc-900 rounded-[24px] w-full max-w-md p-6">
            <h3 className="font-black mb-4">كوبون جديد</h3>
            <form onSubmit={e=>{
              e.preventDefault();
              const fd=new FormData(e.currentTarget as HTMLFormElement);
              store.addCoupon({ id:'cp'+Date.now(), merchantId: currentMerchantId, code: fd.get('code') as string, type: fd.get('type') as any, value: Number(fd.get('value')), group: fd.get('group') as string, expiry: new Date(Date.now()+30*86400000).toISOString(), isActive:true});
              showToast('تم إنشاء الكوبون ✓'); setShowNewCoupon(false);
            }} className="space-y-3">
              <input name="code" placeholder="كود الخصم (مثال: EID30)" required className="input"/>
              <div className="grid grid-cols-2 gap-3">
                <select name="type" className="input"><option value="Percentage">نسبة %</option><option value="Fixed_Amount">مبلغ ثابت</option><option value="Free_Delivery">توصيل مجاني</option></select>
                <input name="value" type="number" placeholder="القيمة" className="input"/>
              </div>
              <input name="group" placeholder="جروب واتساب المستهدف (اختياري)" className="input"/>
              <button type="submit" className="w-full btn-primary">إنشاء</button>
            </form>
          </div>
        </div>
      )}

      {showNewShein && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setShowNewShein(false)}/>
          <div className="relative bg-white dark:bg-zinc-900 rounded-[24px] w-full max-w-md p-6">
            <h3 className="font-black mb-4">حقيبة SHEIN جماعية جديدة</h3>
            <form onSubmit={e=>{
              e.preventDefault();
              const fd=new FormData(e.currentTarget as HTMLFormElement);
              store.addSheinOrder({ id:'sh'+Date.now(), merchantId: currentMerchantId, orderDate: new Date().toISOString(), tracking: fd.get('tracking') as string, courier: fd.get('courier') as string, totalForeign: Number(fd.get('total')), discount: Number(fd.get('discount')), netPaid: Number(fd.get('total'))-Number(fd.get('discount')), currency:'USD', rate:530, status:'Purchased'});
              showToast('تم إنشاء حقيبة SHEIN ✓'); setShowNewShein(false);
            }} className="space-y-3">
              <input name="tracking" placeholder="رقم التتبع" required className="input"/>
              <input name="courier" placeholder="شركة الشحن" className="input"/>
              <div className="grid grid-cols-2 gap-3">
                <input name="total" type="number" placeholder="الإجمالي $" className="input"/>
                <input name="discount" type="number" placeholder="الخصم $" className="input"/>
              </div>
              <button type="submit" className="w-full btn-primary">حفظ الحقيبة</button>
            </form>
          </div>
        </div>
      )}

      {showNewSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setShowNewSupplier(false)}/>
          <div className="relative bg-white dark:bg-zinc-900 rounded-[24px] w-full max-w-md p-6">
            <h3 className="font-black mb-4">تاجر محلي جديد</h3>
            <form onSubmit={e=>{
              e.preventDefault();
              const fd=new FormData(e.currentTarget as HTMLFormElement);
              store.addSupplier({ id:'s'+Date.now(), merchantId: currentMerchantId, name: fd.get('name') as string, phone: fd.get('phone') as string, whatsapp: fd.get('wa') as string, category: fd.get('cat') as string});
              showToast('تمت إضافة التاجر ✓'); setShowNewSupplier(false);
            }} className="space-y-3">
              <input name="name" placeholder="اسم التاجر" required className="input"/>
              <input name="phone" placeholder="الهاتف" className="input"/>
              <input name="wa" placeholder="واتساب" className="input"/>
              <input name="cat" placeholder="التصنيف" className="input"/>
              <button type="submit" className="w-full btn-primary">حفظ</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

# تِجارتي - TEJARATI APP 📱

**«من طلب العميل إلى التسليم والتحصيل... كل شيء في مكان واحد»**

تطبيق SaaS متعدد التجار لإدارة مبيعات واتساب و SHEIN والمحلات، مع إغلاق سنوي آلي ولوحة سوبر آدمن.

أعداد: **د. عبدالله عبدالمجيد الحميري** © جميع الحقوق محفوظة

---

## 🚀 التشغيل السريع (ويب)

```bash
npm install
npm run dev
# http://localhost:3000
```

بيانات الدخول الافتراضية:
- admin / 1234
- superadmin (المالك)

## 📱 بناء APK أندرويد

### تلقائياً عبر GitHub Actions (موصى به)
كل push على `arena/01a109fb-tjaraty-app` يبني APK تلقائياً:
1. افتح تبويب **Actions** في GitHub
2. اختر **Build APK - تِجارتي**
3. حمّل الـ artifact `tjaraty-debug-apk` (يحتوي `app-debug.apk`)

أو شغّل يدوياً عبر **Run workflow**.

### يدوياً (يحتاج Android Studio)
```bash
npm run build
npx cap sync android
npx cap open android
# ثم Build > Build APK(s) في Android Studio
```

### مباشر من المتصفح (PWA)
افتح التطبيق في Chrome على أندرويد → قائمة ⋮ → **تثبيت التطبيق** أو **Add to Home Screen** — يعمل كـ APK بدون متجر.

---

## 🏗️ التقنية
- Next.js 14 (export static) + Tailwind + Zustand + Recharts
- Capacitor 8 للـ APK (WebView + Splash)
- Firebase-ready (Firestore multi-tenant)
- RTL + Dark Mode + Offline First

## 📂 الهيكل
- `app/page.tsx` — كل الوحدات
- `lib/store.ts` — Zustand + Persist
- `android/` — مشروع أندرويد جاهز
- `.github/workflows/build-apk.yml` — بناء تلقائي


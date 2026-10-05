# دليل نشر تِجارتي على Google Play Console

## 1. إنشاء تطبيق جديد
- ادخل https://play.google.com/console
- إنشاء تطبيق → اسم: تِجارتي → اللغة: العربية → نوع: تطبيق → مجاني

## 2. إكمال المتطلبات
- **المحتوى:** حدد الفئة: Shopping / Business
- **سياسة الخصوصية:** ارفع `store/privacy_policy.md` على موقعك وأضف الرابط (مطلوب للنشر)
- **الإعلانات:** لا يحتوي على إعلانات
- **التشفير:** استخدم التشفير العادي (HTTPS)

## 3. رفع الحزمة
- مسار الإنتاج (Production) → إنشاء إصدار جديد
- اسحب ملف `app-release.aab` من Artifacts (هذا هو المطلوب، ليس APK)
- Google ستدير التوقيع تلقائياً

## 4. قائمة المتجر (Store Listing)
- **أيقونة:** 512x512 من `public/icon-512.png`
- **Feature Graphic:** 1024x500 من `store/feature-graphic.png` (مطلوبة)
- **لقطات شاشة:** خذ 4-6 صور من التطبيق (هاتف 16:9)
- **الوصف:** انسخ من `store/listing/ar/full_description.txt`
- **معلومات الاتصال:** البريد وواتساب

## 5. اختبار مغلق (Closed Testing) اختياري قبل الإنتاج

## 6. المراجعة والنشر (1-3 أيام)

### ملفات جاهزة:
- AAB: من Actions → tjaraty-store-aab
- APK: من Actions → tjaraty-store-apk (للتوزيع المباشر خارج المتجر)
- Keystore: tjaraty-release.keystore (password: tjaraty123, alias: tjaraty) - **احتفظ به!**

### تحديث مستقبلي:
يجب استخدام **نفس الـ Keystore** ونفس الـ package `com.tjaraty.app` وزيادة `versionCode`.


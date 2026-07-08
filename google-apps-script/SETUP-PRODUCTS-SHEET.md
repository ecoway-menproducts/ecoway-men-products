# الخطوة 1 — شيت products (تجربة 5 منتجات)

## هيكل الأعمدة

| العمود | الوصف | مثال |
|--------|--------|------|
| `id` | معرف ثابت (لا يتغير) | `perf-silver` |
| `name` | اسم المنتج | عطر الرجل الفضي |
| `category` | التصنيف | `perfumes` / `skincare` / `home` / `packages` |
| `price` | السعر بعد الخصم | `380` |
| `compareAt` | السعر قبل الخصم (فارغ = بدون خصم) | `450` |
| `description` | وصف المنتج | نص كامل |
| `image` | رابط الصورة (URL كامل) | رابط Google Drive |
| `inStock` | متوفر؟ | `TRUE` / `FALSE` |
| `active` | يظهر في الموقع؟ | `TRUE` / `FALSE` |
| `notes_top` | نفحة المقدمة (عطور) | برغموت، ليمون |
| `notes_middle` | نفحة القلب | لافندر |
| `notes_base` | نفحة القاعدة | أرز |

## أسهل طريقة لرفع صور المنتجات (موصى بها)

**Google Drive** — لأنك تستخدم Google Sheets أصلاً.

1. ارفع صورة المنتج على [Google Drive](https://drive.google.com)
2. كليك يمين → **مشاركة** → **أي شخص لديه الرابط → عارض**
3. انسخ الرابط، ثم حوّله للصيغة المباشرة:

```
الرابط الأصلي:
https://drive.google.com/file/d/FILE_ID/view?usp=sharing

ضع FILE_ID هنا:
https://drive.google.com/uc?export=view&id=FILE_ID
```

4. الصق الرابط في عمود `image` في الشيت

> **نصيحة:** أنشئ مجلد Drive باسم `Ecoway Product Images` وارفع كل الصور فيه.

## تنفيذ الخطوة 1 على Google

### أ) تحديث Apps Script

1. افتح Google Sheet الخاص بالطلبات
2. **Extensions → Apps Script**
3. استبدل الكود بالكامل من ملف `Code.gs` في المشروع
4. احفظ (Ctrl+S)

### ب) إنشاء الشيت وملء 5 منتجات

**الطريقة الأسهل:** من محرر Apps Script:

1. اختر الدالة `seedProductsSheet` من القائمة المنسدلة
2. اضغط **Run**
3. وافق على الصلاحيات عند الطلب
4. ارجع للجدول — ستجد تبويب `products` بـ 5 منتجات

**بديل:** استورد ملف `products-sample.csv` يدوياً:
File → Import → Upload → اختر CSV → اسم التبويب: `products`

### ج) نشر نسخة جديدة من Web App

1. **Deploy → Manage deployments**
2. اضغط ✏️ على النشر الحالي → **New version** → Deploy  
   *(أو New deployment إذا لم يكن منشوراً)*
3. تأكد: Execute as **Me** / Who has access **Anyone**

### د) اختبار API

افتح في المتصفح:

```
رابط_الـ_exec?action=products
```

مثال:
```
https://script.google.com/macros/s/XXXX/exec?action=products
```

يجب أن ترى JSON فيه `success: true` و 5 منتجات.

---

## المنتجات التجريبية (5)

| id | الاسم | التصنيف |
|----|-------|---------|
| perf-silver | عطر الرجل الفضي | عطور |
| perf-night-king | عطر نايت كينج | عطور |
| skin-charcoal-wash | غسول الفحم المنشط | عناية |
| car-freshener | معطر سيارة Ecoway | سيارات |
| pkg-full-care | باكدج العناية الشاملة | باكدجات |

---

## الخطوة التالية (بعد تأكيدك)

ربط الموقع ليقرأ من `?action=products` بدل `products.js` الثابت.

**لا تكمل الخطوة 2 حتى تؤكد أن رابط الاختبار يعمل.**

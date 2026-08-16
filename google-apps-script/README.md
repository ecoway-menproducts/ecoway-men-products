# Google Apps Script — استقبال الطلبات

هذا المجلد **للمرجع فقط** ولا يُستخدم على GitHub Pages.

## الخطوات

1. افتح [Google Sheets](https://sheets.google.com) وأنشئ جدولاً باسم `Ecoway Orders`
2. من القائمة: **Extensions → Apps Script**
3. انسخ محتوى `Code.gs` بالكامل والصقه في المحرر
4. احفظ المشروع
5. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. انسخ رابط الـ Web App (ينتهي بـ `/exec`)
7. ضع الرابط في `assets/js/config.js`:

```javascript
orderEndpoint: 'https://script.google.com/macros/s/XXXX/exec',
```

8. ارفع التعديل على GitHub

## لوحة الإدارة (`admin.html`)

بعد لصق `Code.gs` المحدّث:

1. من Apps Script شغّل الدالة `authorizeAdminDrive` مرة واحدة ووافق على صلاحية Drive
2. **Deploy → Manage deployments → ✏️ → New version → Deploy**
3. افتح: `https://ecoway-menproducts.github.io/ecoway-men-products/admin.html`
4. أدخل كلمة مرور الإدارة المعرّفة في `ADMIN_TOKEN` داخل `Code.gs`

الصور تُرفع إلى مجلد Drive باسم `ecoway-products-images`، والمنتجات تُكتب في تبويب `products`.

## التحقق

- افتح رابط `/exec` في المتصفح — يجب أن ترى `status: ok`
- أرسل طلب تجريبي من `checkout.html` — يظهر صف جديد في الجدول

## إشعار بالبريد (اختياري)

في `Code.gs`، أزل التعليق عن السطر `sendOrderEmail(...)` داخل `doPost`.

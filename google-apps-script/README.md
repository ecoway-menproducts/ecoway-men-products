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

## التحقق

- افتح رابط `/exec` في المتصفح — يجب أن ترى `status: ok`
- أرسل طلب تجريبي من `checkout.html` — يظهر صف جديد في الجدول

## إشعار بالبريد (اختياري)

في `Code.gs`، أزل التعليق عن السطر `sendOrderEmail(...)` داخل `doPost`.
